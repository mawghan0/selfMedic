// const { nanoid } = import('nanoid');
const crypto = require("crypto");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../server/db');
// const { image } = require("@tensorflow/tfjs-node");
const {scarClassification, acneClassification} = require('../services/inferenceService')
const uploadFileToGCS = require('./storage.js');
// const loadModel = require("../services/loadModel");

const skinDiseases = {
    'BA-cellulitis': 0, 
    'BA-impetigo': 1, 
    'FU-athlete-foot': 2, 
    'FU-nail-fungus': 3, 
    'FU-ringworm': 4, 
    'cutaneous-larva-migrans': 5, 
    'VI-chickenpox': 6, 
    'VI-shingles': 7, 
    'Scar': 8
}

async function postUserHandler(request, h) {
    try {const { email, password } = request.payload;
    const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);

    if (rows.length === 0) {
        return h.response({ error: 'Invalid email or password' }).code(401);
    }
    const user = rows[0];

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
        return h.response({ error: 'Invalid password', hash: user.password, password: password }).code(401);
    }

    const token = jwt.sign({ user_id: user.user_id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });

    return h.response({error: false, message: 'Login successful', loginResult: {
        userId: user.user_id,
        name: user.full_name,
        token: token
    } }).code(200);
    } catch (error) {
        console.error('Error during login:', error); // Log the detailed error
        return h.response({ error: 'Internal Server Error', details: error.message }).code(500);
    }
};

async function postRegisterHandler(request, h){
    const {email, password, full_name, date_of_birth, gender} = request.payload;

    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    const user_id = "U" + id;
    const hashedPassword = await bcrypt.hash(password, 10);
    const inputDate = new Date(createdAt);
    const formattedDate = inputDate.toISOString().slice(0, 19).replace('T', ' ');

    if (password.length < 8) {
        const response = h.response({
            error: true,
            message: 'Password must be at least 8 characters long'
        })
        response.code(400);
        return response;
    }
    
    const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length > 0) {
        const response = h.response({
            error: true,
            message: 'Email is already taken'
        })
        response.code(400);
        return response;
    }

    await pool.execute(
        'INSERT INTO users (user_id, email, full_name, password, date_of_birth, gender, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)', 
        [user_id, email, full_name, hashedPassword, date_of_birth, gender, formattedDate]
    );
    // const isValid = await bcrypt.compare(password, hashedPassword);
    return h.response({ error: false, message: 'User registered successfully'}).code(201);
}

async function getAllDiseases(request, h){
    const [disease] = await pool.execute('SELECT * FROM diseases');

    const simplifiedDiseases = disease.map(disease => ({
        id: disease.Id,
        name: disease.name,
        prevention: disease.prevention,
        treatment: disease.treatment,
        description: disease.description,
        imageURL: disease.image
      }));

    return h.response({
        error: false,
        status: "Success",
        data: simplifiedDiseases
    });
}

async function getDiseaseDetail(request, h){
    const id = request.params.id;

    const [rows] = await pool.execute('SELECT * FROM diseases WHERE id = ?', [id]);

    if (rows.length === 0) {
        return h.response({ error: 'Disease not found' }).code(404);
    }
    
    const disease_detail = rows[0];

    return h.response({
        error: false,
        message: 'success',
        data: disease_detail
    }).code(200);
}

async function skinDetection(request, h){
    const { image } = request.payload;
    const { skin_model } = request.server.app;
    const imageName = `image_${Date.now()}.png`;
    const id = "SD" + crypto.randomUUID();
    const user = request.auth.credentials.user;

    const link = await uploadFileToGCS(image, imageName);
    // const { label, suggestion } = await scarClassification(model, image);
    const result = await scarClassification(skin_model, image)

    const disease = Object.keys(skinDiseases);
    
    await pool.execute(
        'INSERT INTO historyskin (id, user_id, image, result) VALUES (?, ?, ?, ?)', 
        [id, user.user_id, link, disease[result]]
    );


    return h.response({
        error: false,
        result: disease[result],
        // link: link
    }).code(200);
}

async function getAllSkinDetection(request, h){
        const user = request.auth.credentials.user;
        const [historySD] = await pool.execute('SELECT * FROM historyskin WHERE user_id = ?', [user.user_id]);
        const historySkinDetection = historySD.map(note => ({
            id: note.id,
            image: note.image,
            result: note.result,
            createdAt: note.createdAt,
          }));
    
        return h.response({
            error: false,
            status: "Success",
            data: historySkinDetection
            // user: user,
        });
}


async function acneDetection(request, h){
    try {
        const { image } = request.payload;
        const { acne_model } = request.server.app;

        const result = await acneClassification(acne_model, image);

        // Assuming you have a mapping of class indices to disease names
        const acneDiseases = [
            'Acne', 'Actinic Keratosis', 'Basal Cell Carcinoma', 'Eczemaa', 'Rosacea'
        ];

        const disease = acneDiseases[result.maxKey];

        return h.response({
            error: false,
            result: disease,
        }).code(200);
    } catch (error) {
        console.error("Error in acneDetection handler:", error);
        return h.response({
            status: "fail",
            message: error.message
        }).code(500);
    }
}

async function postSugarBlood(request, h){
    const {check_date, check_time, blood_sugar} = request.payload;

    const id = "SB" + crypto.randomUUID();
    const user = request.auth.credentials.user;

    await pool.execute(
        'INSERT INTO guladarah (id, user_id, check_date, check_time, blood_sugar) VALUES (?, ?, ?, ?, ?)', 
        [id, user.user_id, check_date, check_time, blood_sugar]
    );

    return h.response({error: false, message: 'success', data: {check_date: check_date, check_time: check_time, blood_sugar: blood_sugar} }).code(200);
}

function addHours(date, hours) {
    return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

async function getAllSugarBlood(request, h){
    const user = request.auth.credentials.user;
    const [guladarah] = await pool.execute('SELECT * FROM guladarah WHERE user_id = ?', [user.user_id]);
    const simplifiedSugarBlood = guladarah.map(note => ({
        // check_date: note.check_date.toISOString().split('T')[0],
        check_date: addHours(note.check_date, 7).toISOString().split('T')[0],
        check_time: note.check_time,
        blood_sugar: note.blood_sugar,
      }));

    return h.response({
        error: false,
        status: "Success",
        data: simplifiedSugarBlood
        // user: user,
    });
}

//route profile
async function getProfile(request, h){
    const users = request.auth.credentials.user;
    const [user] = await pool.execute('SELECT * FROM users WHERE user_id = ?', [users.user_id]);
    const userProfile = user[0];
        const emailFullName = {
            name: userProfile.full_name,
            email: userProfile.email
        };

    return h.response({
        error: false,
        status: "Success",
        data: emailFullName
        // user: user,
    });
}

//route tekanan darah
async function postBloodPressure(request, h){
    const {check_date, check_time, sistolik, distolik} = request.payload;

    const id = "BP" + crypto.randomUUID();
    const user = request.auth.credentials.user;

    await pool.execute(
        'INSERT INTO tekanandarah (id, user_id, check_date, check_time, sistolik, distolik) VALUES (?, ?, ?, ?, ?, ?)', 
        [id, user.user_id, check_date, check_time, sistolik, distolik]
    );

    return h.response({error: false, message: 'success', data: {check_date: check_date, check_time: check_time, sistolik: sistolik, distolik: distolik} }).code(201);
}

async function getAllBloodPressure(request, h){
    const user = request.auth.credentials.user;
    const [tekanandarah] = await pool.execute('SELECT * FROM tekanandarah WHERE user_id = ?', [user.user_id]);
    const bloodPressure = tekanandarah.map(note => ({
        // check_date: note.check_date.toISOString().split('T')[0],
        check_date: addHours(note.check_date, 7).toISOString().split('T')[0],
        check_time: note.check_time,
        sistolik: note.sistolik,
        distolik: note.distolik,
      }));

    return h.response({
        error: false,
        status: "Success",
        data: bloodPressure,
        // user: user,
    });
}

module.exports = {
    postUserHandler,
    postRegisterHandler,
    getAllDiseases,
    postSugarBlood,
    getAllSugarBlood,
    getDiseaseDetail,
    skinDetection,
    acneDetection,
    getProfile,
    postBloodPressure,
    getAllBloodPressure,
    getAllSkinDetection
}

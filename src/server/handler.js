// const { nanoid } = import('nanoid');
const crypto = require("crypto");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../server/db')
const scarClassification = require('../services/inferenceService');

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

    const token = jwt.sign({ user_id: user.user_id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

    return h.response({ message: 'Login successful', token }).code(200);
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

    // const newUser = {
    //     user_id, email, full_name, hashedPassword, date_of_birth, gender, createdAt
    // }
    
    const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length > 0) {
        const response = h.response({
            error: 'Email already exists',
        })
        response.code(400);
        return response;
    }

    await pool.execute(
        'INSERT INTO users (user_id, email, full_name, password, date_of_birth, gender, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)', 
        [user_id, email, full_name, hashedPassword, date_of_birth, gender, createdAt]
    );
    // const isValid = await bcrypt.compare(password, hashedPassword);
    return h.response({ message: 'User registered successfully'}).code(201);
}

async function getAllDiseases(h){
    const simplifiedDiseases = diseases.map(disease => ({
        name: disease.name,
        publisher: disease.description,
      }));

    return h.response({
        status: "Success",
        data: {
            diseases: simplifiedDiseases,
        }
    });
}

// async function scarDetection(request, h){
//     const { image } = request.payload;
//     const { model } = await loadModel(process.env.MODEL_URL)

//     const { label, suggestion } = await scarClassification(model, image);
// }

async function postSugarBlood(request, h){
    const {check_date, check_time, blood_sugar} = request.payload;

    const id = "SB" + crypto.randomUUID();
    const user = request.auth.credentials.user;

    await pool.execute(
        'INSERT INTO guladarah (id, user_id, check_date, check_time, blood_sugar) VALUES (?, ?, ?, ?, ?)', 
        [id, user.user_id, check_date, check_time, blood_sugar]
    );

    return h.response({ message: 'success', user }).code(200);
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
        status: "Success",
        data: {
            note: simplifiedSugarBlood,
        }
        // user: user,
    });
}

async function getProfile(request, h){
    const users = request.auth.credentials.user;
    const [user] = await pool.execute('SELECT * FROM users WHERE user_id = ?', [users.user_id]);
    const userProfile = user[0];
        const emailFullName = {
            name: userProfile.full_name,
            email: userProfile.email
        };

    return h.response({
        status: "Success",
        data: emailFullName
        // user: user,
    });
}

async function postBloodPressure(request, h){
    const {check_date, check_time, sistolik, distolik} = request.payload;

    const id = "BP" + crypto.randomUUID();
    const user = request.auth.credentials.user;

    await pool.execute(
        'INSERT INTO tekanandarah (id, user_id, check_date, check_time, sistolik, distolik) VALUES (?, ?, ?, ?, ?, ?)', 
        [id, user.user_id, check_date, check_time, sistolik, distolik]
    );

    return h.response({ message: 'success', user }).code(200);
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
        status: "Success",
        data: bloodPressure,
        // user: user,
    });
}

async function skinDetection(request, h){
    const { image } = request.payload;
    const { skinModel } = request.server.app;

    // const { label, suggestion } = await scarClassification(model, image);
    const result = await scarClassification(skinModel, image);

    function getPredictedDisease(predictions) {
        let maxProbability = 0;
        let predictedDisease = '';
    
        // Loop through the prediction probabilities
        Object.keys(predictions).forEach(key => {
            // Check if the current probability is higher than the current maximum probability
            if (predictions[key] > maxProbability) {
                maxProbability = predictions[key];
                predictedDisease = key;
            }
        });
    
        // Map the predicted disease label based on the key
        switch (predictedDisease) {
            case '0':
                return 'BA-cellulitis';
            case '1':
                return 'BA-impetigo';
            case '2':
                return 'FU-athlete-foot';
            case '3':
                return 'FU-nail-fungus';
            case '4':
                return 'FU-ringworm';
            case '5':
                return 'PA-cutaneous-larva-migrans';
            case '6':
                return 'VI-chickenpox';
            case '7':
                return 'VI-shingles';
            case '8':
                return 'scar';
            default:
                return 'Unknown';
        }
    }
    const predictedDisease = getPredictedDisease(result);
    // const disease = Object.keys(skinDiseases);
    return h.response({
        // score: score,
        result: predictedDisease,
    }).code(200);
}


module.exports = {
    postUserHandler,
    postRegisterHandler,
    getAllDiseases,
    postSugarBlood,
    getAllSugarBlood,
    getProfile,
    postBloodPressure,
    getAllBloodPressure,
    skinDetection
}

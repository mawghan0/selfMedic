// const { nanoid } = import('nanoid');
const crypto = require("crypto");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../server/db')

const users = [];
const diseases = [];

async function postUserHandler(request, h) {
    const { email, password } = request.payload;
    const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);

    if (rows.length === 0) {
        return h.response({ error: 'Invalid email or password' }).code(401);
    }
    const user = rows[0];

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
        return h.response({ error: 'Invalid password', hash: user.password, password: password }).code(401);
    }

    const token = jwt.sign({ id: user.id, email: user.email }, 'your_jwt_secret', { expiresIn: '1h' });

    return h.response({ message: 'Login successful', token }).code(200);
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

module.exports = {
    postUserHandler,
    postRegisterHandler,
    getAllDiseases,
    // scarDetection
}

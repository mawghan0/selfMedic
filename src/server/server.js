require('dotenv').config();

const Hapi = require('@hapi/hapi');
const routes = require('../server/routes');
const Jwt = require('@hapi/jwt');
const loadModel = require("../services/loadModel");
const InputError = require("../exceptions/InputError");

(async () => {
    const server = Hapi.server({
        port: 3000,
        host: '0.0.0.0',
        routes: {
            cors: {
              origin: ['*'],
            },
        },
    });

    await server.register(Jwt);

    server.auth.strategy('jwt', 'jwt', {
        keys: process.env.JWT_SECRET,
        verify: {
            aud: false,
            iss: false, 
            sub: false, 
            nbf: true,
            exp: true,
            maxAgeSec: 14400, 
            timeSkewSec: 15
        },
        validate: (artifacts, request, h) => {
            return {
                isValid: true,
                credentials: { user: artifacts.decoded.payload }
            };
        }
    });

    server.auth.default('jwt');

    const model = await loadModel("https://storage.googleapis.com/capstone-self-medic/model/model.json");
    server.app.skin_model = model;


    server.route(routes);
    
    server.ext("onPreResponse", function (request, h) {
        const response = request.response;

        if (response instanceof InputError) {
            const newResponse = h.response({
                status: "fail",
                // message: `${response.message} Silakan gunakan foto lain.`,
                message: "Terjadi kesalahan dalam melakukan prediksi",
            });
            newResponse.code(400);
            return newResponse;
        }

        if (response.isBoom) {
            const newResponse = h.response({
                status: "fail",
                message: response.message,
            });
            // response.statusCode;
            newResponse.code(413);
            return newResponse;
        }

        return h.continue;
    });
 
    await server.start();
    console.log(`Server start at: ${server.info.uri}`);
})();

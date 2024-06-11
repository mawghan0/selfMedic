require('dotenv').config();

const Hapi = require('@hapi/hapi');
const routes = require('../server/routes');
const Jwt = require('@hapi/jwt');
const loadModel = require("../services/loadModel");

(async () => {
    try {
        model = await loadModel();
        console.log('Model loaded successfully');
      } catch (error) {
        console.error('Failed to load the model:', error);
        process.exit(1); // Exit the process if the model fails to load
      }

    const server = Hapi.server({
        port: 3000,
        host: 'localhost',
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

    server.app.skinModel = model;

    server.route(routes); 
 
    await server.start();
    console.log(`Server start at: ${server.info.uri}`);
})();

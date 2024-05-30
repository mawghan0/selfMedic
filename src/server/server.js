require('dotenv').config();

const Hapi = require('@hapi/hapi');
const routes = require('../server/routes');
// const mysql = require('mysql2/promise'); 

(async () => {
    // const useCloudSQL = process.env.USE_CLOUD_SQL === 'true';

    // const dbConfig = useCloudSQL ? {
    //     host: process.env.CLOUD_DB_HOST,
    //     user: process.env.CLOUD_DB_USER,
    //     password: process.env.CLOUD_DB_PASSWORD,
    //     database: process.env.CLOUD_DB_NAME,
    //     port: process.env.CLOUD_DB_PORT
    // } : {
    //     host: process.env.DB_HOST,
    //     user: process.env.DB_USER,
    //     password: process.env.DB_PASSWORD,
    //     database: process.env.DB_NAME,
    //     port: process.env.DB_PORT
    // };

    // const db = await mysql.createConnection(dbConfig);
    // module.exports = {db};
    const server = Hapi.server({
        port: 3000,
        host: 'localhost',
        routes: {
            cors: {
              origin: ['*'],
            },
        },
    });
 
    server.route(routes); 
 
    await server.start();
    console.log(`Server start at: ${server.info.uri}`);
})();

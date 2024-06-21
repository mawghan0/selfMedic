const Joi = require('@hapi/joi');

const {
  postUserHandler,
  postRegisterHandler,
  getAllDiseases,
  getDiseaseDetail,
  postSugarBlood,
  getAllSugarBlood,
  skinDetection,
  acneDetection,
  getProfile,
  postBloodPressure,
  getAllBloodPressure,
  getAllSkinDetection,
  getAllAcneDetection
} = require('./handler');

const routes = [
    {
      path: '/login',
      method: 'POST',
      options: {
        auth: false,
        validate: {
          payload: Joi.object({
            email: Joi.string().required(),
            password: Joi.string().required()
          }),
        },
      },
      handler: postUserHandler,
    },
    {
        path: '/register',
        method: 'POST',
        options: {
          auth: false,
          // validate: {
          //   payload: Joi.object({
          //     email: Joi.string().required(),  
          //     password: Joi.string().required()
          //   }),
          // }
        },
        handler: postRegisterHandler,
    },
    {
      path: '/diseases',
      method: 'GET',
      options:{
        auth: false,
      },
      handler: getAllDiseases,
    },
    {
      path: '/diseases/{id}',
      method: 'GET',
      options:{
        auth: false,
      },
      handler: getDiseaseDetail,
    },
    {
      path: '/sugar-blood',
      method: 'POST',
      options: {
        auth: 'jwt',
      },
      handler: postSugarBlood,
    },
    {
      path: '/sugar-blood',
      method: 'GET',
      options: {
        auth: 'jwt',
      },
      handler: getAllSugarBlood,
    },
    {
      path: '/skin-detection',
      method: 'POST',
      options: {
        auth: 'jwt',
        payload: {
          allow: 'multipart/form-data',
          multipart: true,
        }
      },
      handler: skinDetection,
    },
    {
      path: '/skin-detection',
      method: 'GET',
      options: {
        auth: 'jwt',
      },
      handler: getAllSkinDetection,
    },
    {
      path: '/acne-detection',
      method: 'POST',
      options: {
        auth: 'jwt',
        payload: {
          allow: 'multipart/form-data',
          multipart: true,
        }
      },
      handler: acneDetection,
    },
    {
      path: '/acne-detection',
      method: 'GET',
      options: {
        auth: 'jwt',
      },
      handler: getAllAcneDetection,
    },
    //route profile
    {
      path: "/profile",
      method: "GET",
      options: {
        auth: "jwt",
      },
      handler: getProfile,
    },

    // route tekanan darah
    {
      path: "/blood-pressure",
      method: "POST",
      options: {
        auth: "jwt",
      },
      handler: postBloodPressure,
    },
    {
      path: "/blood-pressure",
      method: "GET",
      options: {
        auth: "jwt",
      },
      handler: getAllBloodPressure,
    }
]

module.exports = routes;
const Joi = require('@hapi/joi');

const {
  postUserHandler,
  postRegisterHandler,
  getAllDiseases,
  scarDetection,
} = require('./handler');

const routes = [
    {
      path: '/login',
      method: 'POST',
      options: {
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
        // options: {
        //   validate: {
        // //     payload: Joi.object({
        // //       email: Joi.string().required(),  
        // //       password: Joi.string().required()
        // //     }),
        //     failAction: (request, h, error) => {
        //       // Log the validation error for debugging
        //         console.error('Validation Error:', error.details[0].message);
        //         return h.response({ error: error.details[0].message }).code(400).takeover();
        //   }
        //   }
        // },
        handler: postRegisterHandler,
    },
    {
      path: '/diseases',
      method: 'GET',
      handler: getAllDiseases,
    },
    // {
    //   path: '/scar',
    //   method: 'POST',
    //   handler: scarDetection,
    //   options: {
    //     payload: {
    //       allow: 'multipart/form-data',
    //       multipart: true,
    //     }
    //   }
    // }
]

module.exports = routes;
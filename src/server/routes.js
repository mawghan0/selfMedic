const Joi = require('@hapi/joi');

const {
  postUserHandler,
  postRegisterHandler,
  getAllDiseases,
  postSugarBlood,
  getAllSugarBlood
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
          validate: {
            payload: Joi.object({
              email: Joi.string().required(),  
              password: Joi.string().required()
            }),
          }
        },
        handler: postRegisterHandler,
    },
    {
      path: '/diseases',
      method: 'GET',
      handler: getAllDiseases,
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
    }
]

module.exports = routes;
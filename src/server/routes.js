const Joi = require("@hapi/joi");

const {
  postUserHandler,
  postRegisterHandler,
  getAllDiseases,
  postSugarBlood,
  getAllSugarBlood,
  getProfile,
  postBloodPressure,
  getAllBloodPressure
} = require("./handler");

const routes = [
  {
    path: "/login",
    method: "POST",
    options: {
      auth: false,
      validate: {
        payload: Joi.object({
          email: Joi.string().required(),
          password: Joi.string().required(),
        }),
      },
    },
    handler: postUserHandler,
  },
  {
    path: "/register",
    method: "POST",
    options: {
      auth: false,
    },
    handler: postRegisterHandler,
  },
  {
    path: "/diseases",
    method: "GET",
    handler: getAllDiseases,
  },
  {
    path: "/sugar-blood",
    method: "POST",
    options: {
      auth: "jwt",
    },
    handler: postSugarBlood,
  },
  {
    path: "/sugar-blood",
    method: "GET",
    options: {
      auth: "jwt",
    },
    handler: getAllSugarBlood,
  },
  {
    path: "/profile",
    method: "GET",
    options: {
      auth: "jwt",
    },
    handler: getProfile,
  },
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
  },
];

module.exports = routes;

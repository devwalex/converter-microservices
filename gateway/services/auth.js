const axios = require("axios");
const AUTH_SVC_ADDRESS = process.env.AUTH_SVC_ADDRESS || "http://localhost:4000";

const register = (payload) => {
  return axios.post(`${AUTH_SVC_ADDRESS}/register`, payload);
};

const login = (payload) => {
  return axios.post(`${AUTH_SVC_ADDRESS}/login`, payload);
};

const validate = (req) => {
  const token = req.headers["authorization"];
  return axios.post(`${AUTH_SVC_ADDRESS}/validate`, {}, {
    headers: {
      authorization: token,
    },
  });
};

module.exports = { register, login, validate };

const axios = require("axios");
const AUTH_SVC_ADDRESS = process.env.AUTH_SVC_ADDRESS || 'http://localhost:4000';

const register = (payload) => {
  return axios.post(`${AUTH_SVC_ADDRESS}/register`, payload);
};

const login = (payload) => {
  return axios.post(`${AUTH_SVC_ADDRESS}/login`, payload);
};

const validate = (token) => {
  return axios.post(`${AUTH_SVC_ADDRESS}/validate`, {
    headers: {
        // 'Content-Type': 'application/json',
        'Authorization': `bearer ${token}`
    }
  });
};

module.exports = { register, login, validate };

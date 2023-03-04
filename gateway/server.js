const express = require("express");
const { register, login, validate } = require("./services/auth");
require("dotenv/config");
const app = express();
const router = express.Router();

// parse json request body
app.use(express.json());

app.use(router);

router.post("/register", async (req, res) => {
  try {
    const response = await register(req.body);
    return res.status(201).send(response.data);
  } catch (error) {
    console.log("Register Error =>", error);
    if (error.response) {
      return res.status(500).send(error.response.data);
    } else {
      return res.status(500).send(error);
    }
  }
});

router.post("/login", async (req, res) => {
  try {
    const response = await login(req.body);
    return res.status(200).send(response.data);
  } catch (error) {
    console.log("Login Error =>", error);
    if (error.response) {
      return res.status(500).send(error.response.data);
    } else {
      return res.status(500).send(error);
    }
  }
});


const PORT = process.env.PORT || 6000;
app.listen(PORT, () => console.log(`Gateway service is running on port ${PORT}`));

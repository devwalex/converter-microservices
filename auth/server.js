const express = require("express");
require("dotenv/config");
const app = express();
const router = express.Router();
const db = require("./config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const jwtConfig = require("./config/jwt");

// parse json request body
app.use(express.json());

app.use(router);

router.get("/", (req, res) => {
  res.status(200).send("OK");
});

router.post("/register", async (req, res) => {
  try {
    const { first_name, last_name, email, password } = req.body;
    const hashPassword = await bcrypt.hashSync(password, 10);
    await db("users").insert({ first_name, last_name, email, password: hashPassword });
    return res.status(201).send("Registered successfully!");
  } catch (error) {
    console.log("Register Error =>", error);
    return res.status(500).send(error);
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await db("users").where("email", email).first();
    if (!user) {
      return res.status(401).send("Invalid credentials");
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).send("Invalid credentials");
    }

    const payload = {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
    };
    const token = jwt.sign(payload, jwtConfig.appKey, jwtConfig.options);

    return res.status(200).send(token);
  } catch (error) {
    console.log("Login Error =>", error);
    return res.status(500).send(error);
  }
});

router.post("/validate", async (req, res) => {
  try {
    let token = req.headers["authorization"];

    if (!token) {
      return res.status(401).send("Not authorized");
    }

    const decodeToken = await jwt.verify(token.split(" ")[1], jwtConfig.appKey);
    return res.status(200).send(decodeToken);
  } catch (error) {
    console.log("Validate Error =>", error);
    return res.status(500).send(error);
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Auth service is running on port ${PORT}`));

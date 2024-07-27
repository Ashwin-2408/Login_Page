const express = require("express");
require("dotenv").config();
const app = express();
const db = require("./db");
const otp = require("simple-otp-generator");
const nodemailer = require("nodemailer");

var transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.USER,
    pass: process.env.PASS,
  },
});

const sendotp = async (email, otp) => {
  var mail = await transporter.sendMail({
    from: process.env.USER,
    to: `${email}`,
    subject: "Confirmation OTP for signup",
    text: `Your signup OTP is ${otp}`,
  });
};

app.use(express.json());

const create_table = () => {
  const table_name = "login";
  const create_query = `CREATE TABLE IF NOT EXISTS ${table_name}(
  email VARCHAR(255) not NULL,
  password VARCHAR(255) not Null,
  otp INT NULL)`;
  db.query(create_query, (err) => {
    if (err) {
      console.log(err.message);
    } else {
      console.log("table created successfully");
    }
  });
};

app.get("/", async (req, res) => {
  await create_table();
  res.status(200).send();
});

app.post("/signup", (req, res) => {
  const { email, password } = req.body;
  if (
    email == undefined ||
    email == "" ||
    password == undefined ||
    password == ""
  ) {
    return res.status(400).send({ ERROR: "Bad request body" });
  }
  try {
    db.query(
      "SELECT * FROM login WHERE email = ? AND password = ?",
      [email, password],
      (err, rows) => {
        if (err) {
          console.error(err);
          return res.status(500).send({ ERROR: "Database query error" });
        }
        if (rows.length == 0) {
          db.query(
            "INSERT INTO login VALUES (?, ?, 1234)",
            [email, password],
            (err) => {
              if (err) {
                console.log(err);
                return res.status(500).send({ ERROR: "Failed to insert data" });
              }
              const generate_otp = otp.generateOTP();
              sendotp(email, generate_otp);
              return res
                .status(200)
                .send({ MSG: "Data inserted successfully" });
            }
          );
        } else {
          return res.status(400).send({ ERROR: "Email already found" });
        }
      }
    );
  } catch (err) {
    console.error(err);
    return res.status(500).send({ ERROR: "Server error" });
  }
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email | !password) {
    return res.status(400).send({ Error: "bad body request" });
  }
  try {
    db.query(
      "SELECT * FROM login WHERE email=?",
      [email, password],
      (err, rows) => {
        if (rows.length == 0) {
          return res.status(400).send({ ERROR: "email does not exist" });
        } else if (rows[0].password != password) {
          return res.status(404).send({ ERROR: "incorrect password" });
        } else {
          return res.status(200).send("Login successfull");
        }
      }
    );
  } catch (err) {
    if (err) {
      return res.status(400).send({ Error: "server error" });
    }
  }
});

app.listen(process.env.PORT, (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log("Listening at port " + process.env.PORT);
    console.log(process.env.USER);
  }
});

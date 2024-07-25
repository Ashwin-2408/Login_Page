const express = require("express");
const app = express();
const db = require("./db");


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

app.post("/submitForm", (req, res) => {
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
              return res
                .status(200)
                .send({ MSG: "Data inserted successfully", OTP: 1234 });
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
      "SELECT * FROM login WHERE email=? AND password=?",
      [email, password],
      (err, rows, Fields) => {
        if (rows.length == 0) {
          return res.status(400).send({ ERROR: "email does not exist" });
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

app.listen(3000, (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log("Listening at port 3000");
  }
});

const mysql2 = require("mysql2");

const connection = mysql2.createConnection({
  host: "localhost",
  user: "root",
  database: "login",
  password: "Ashwin1204",
});

module.exports = connection;

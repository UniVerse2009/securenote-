const mysql = require("mysql2");
const util = require("util");

const connection = mysql.createConnection({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASS || "",
	database: process.env.DB_NAME
});

const query = util.promisify(connection.query).bind(connection);

module.exports = {query:query};

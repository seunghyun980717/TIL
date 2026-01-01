const mysql = require("mysql2/promise");
const dotenv = require("dotenv");
dotenv.config();

const pool = mysql.createPool({
    // 접근할 ip
    host: process.env.DB_HOST,
    // mysql id
    user: process.env.DB_USER,
    // mysql password
    password: process.env.DB_PASSWORD,
    // mysql 스키마
    database: process.env.DB_NAME,
    // 풀에 연결이 부족하면, 새 연결이 생길때까지 기다릴것인지?
    waitForConnections: true,
    // 동시에 사용할 수 있는 최대 연결
    connectionLimit: 10,
    // 연결 대기열, 0인 경우 무제한
    queueLimit: 0
});

module.exports = { pool };
const express = require("express")
const morgan = require("morgan")
const { pool } = require("./db");

const app = express();
const PORT = 8080;

app.use(express.json());
app.use(morgan("dev"));

app.get("/api/menus", async (req, res) => {
    try {
        const data = await pool.query("SELECT * FROM menus;");
        console.log(data);
        return res.json(data);
    } catch (err) {
        console.error(err);
        return res.json(err);
    }
})

app.post("/api/menus", async (req, res) => {
    try {
        const data = await pool.query(
            `INSERT INTO menus (menu_name, menu_description) VALUES (?, ?);`,
            [req.body.menu_name, req.body.menu_description]
        );
        console.log(data);
        return res.json(data);
    } catch (err) {
        console.error(err);
        return res.json(err);
    }
})

app.listen(PORT, () => console.log(`${PORT} 서버 기동중`));
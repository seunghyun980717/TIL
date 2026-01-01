const express = require("express")
const morgan = require("morgan")

const app = express();
const PORT = 8080;

app.use(express.json());
app.use(morgan("dev"));

const infos = [
    {name: "나나", age:15},
    {name: "유진", age:25},
    {name: "재범", age:35}
]

app.get("/", (req, res) => {
    return res.json({
        name: "Hello3"
    })
});

app.get("/api/info", (req, res) => {
    return res.json(infos)
})

app.listen(PORT, () => console.log(`${PORT} 서버 기동중`));
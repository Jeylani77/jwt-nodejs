const express = require("express");
const app = express();

//USING EXPRESS JSON
app.use(express.json());

const users = [
    {
        id: "1",
        username: "abdou",
        password: "test",
        isAdmin: true
    },
    {
        id: "2",
        username: "saly",
        password: "test",
        isAdmin: false
    }
];

app.post("/api/login", (req, res) => {
    const { username, password } = req.body;
    const user= users.find((u)=>{
        return u.username === username && u.password === password;
    });
    if (user) {
        const {password, ...others} = user;
        res.status(200).json(others);
    }else{
        res.status(400).json("Wrong credentials");
    }
})

//DEFINE PORT
app.listen("5001", () => {
    console.log("Backend is running");
})
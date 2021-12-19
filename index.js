const { json } = require("express");
const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");

//USING EXPRESS JSON
app.use(express.json());

//DATA
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

let refreshTokens = [];

//REFRESH TOKEN
app.post("/api/refresh", (req, res) => {
    //take the refresh token from the user
    const refreshToken = req.body.token;

    //send error if there is no token or it's invalid
    !refreshToken && res.status(401).json("You are not authenticated");
    !refreshTokens.includes(refreshToken) && res.status(403).json("Refresh token is invalid !");

    //if everything is ok, create new access token, refresh token and send to user
    jwt.verify(refreshToken, "myRefreshSecretKey", (err, payload) => {
        err && console.log(err);

        //delete refresh token in array or db
        refreshTokens = refreshTokens.filter((token) => token != refreshToken);

        // create a new one
        const newAccessToken = generateAccessToken(payload);
        //create a new refresh token for more secure
        const newRefreshToken = generateRefreshToken(payload);
        //add the new one to array or db
        refreshTokens.push(newRefreshToken);

        res.status(200).json({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
        });

    });
});

const generateAccessToken = (user) => {
    return jwt.sign({
        id: user.id,
        isAdmin: user.isAdmin,
    },
        "mySecretKey",
        { expiresIn: "5s" }
    );
}
const generateRefreshToken = (user) => {
    return jwt.sign({
        id: user.id,
        isAdmin: user.isAdmin,
    },
        "myRefreshSecretKey",
    );
}

//LOGIN
app.post("/api/login", (req, res) => {
    const { username, password } = req.body;
    const user = users.find((u) => {
        return u.username === username && u.password === password;
    });
    if (user) {
        // const {password, ...others} = user;
        // res.status(200).json(others);

        //GENERATE TOKEN & REFRESH
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);
        refreshTokens.push(refreshToken);

        res.status(200).json({
            username: user.username,
            isAdmin: user.isAdmin,
            accessToken,
            refreshToken
        });
    } else {
        res.status(400).json("Wrong credentials !");
    }
});

const verify = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(" ")[1]
        jwt.verify(token, "mySecretKey", (err, payload) => {
            if (err) {
                return res.status(403).json("Token is not valid !");
            }
            req.user = payload;
            next();
        });
    } else {
        res.status(401).json("You are not authenticated !");
    }
}

//TESTING ACTION (Delete User)
app.delete("/api/users/:userId", verify, (req, res) => {
    if (req.user.id === req.params.userId || req.user.isAdmin) {
        res.status(200).json("User has been deleted !");
    } else {
        res.status(403).json("You are not allow to delete this user !");
    }
});

//LOGOUT
app.post("/api/logout", verify, (req, res)=>{
    const refreshToken = req.body.token;
    refreshTokens = refreshTokens.filter((token) => token != refreshToken);
    res.status(200).json("You logout successfully.")
})

//DEFINE PORT
app.listen("5001", () => {
    console.log("Backend is running");
})
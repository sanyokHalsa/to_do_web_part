require("dotenv").config();
//===================================================
const mongoose = require('mongoose');
const user_schema = new mongoose.Schema({ // defining user scheme for mongoose
    username: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    completed_tasks: {
        type: Number,
        required: true,
    }
})
const User = mongoose.model('User', user_schema);
//===================================================
//==================================Express.js
const express = require('express')
const app = express();
const methodOverride = require('method-override')
const path = require('path')
app.use(methodOverride('_method'))
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', extended: true}));
//==================================================Mongoose
const {query} = require("express");
mongoose.set('strictQuery', false);
main().catch(err => console.log(err));

async function main() {
    await mongoose.connect(process.env.DB_CONNECTION); //============Connecting mongoDB
}

app.listen(process.env.PORT || 3000, () => {
    console.log("On work")
})
//========================================================= POST
app.post('/login', async (req, res) => {
    let log_username = req.body.username;
    let log_password = req.body.password;
    let db_user = await User.findOne({"username": log_username});
    if (db_user === null) {
        res.json({
            status: "No such user",
        })
    } else if (db_user) {
        if (db_user.password === log_password) {
            res.json({
                status: "Access accepted",
            })
        } else {
            res.json({
                status: "Wrong password",
            })
        }
    }
})
app.post('/register', async (req, res) => {
    let reg_username = req.body.username;
    let reg_password = req.body.password;
    let db_user = await User.findOne({"username": reg_username});
    if (db_user === null) {
        let new_user = new User();
        new_user.password = reg_password;
        new_user.username = reg_username;
        new_user.completed_tasks = 0;
        await new_user.save();
        res.json({
            status: "User created",
        })
    } else if (db_user) {
        res.json({
            status: "Such user already exists",
        })
    }
})
//======================================= GET
app.get('/leaders', async (req, res) => {
    let resp_arr = [];
    let search_res = await User.find({}).sort({ completed_tasks: -1 }).limit(10);
    for(let i = 0; i<search_res.length;i++){
        search_res[i].username
        resp_arr.push({username:search_res[i].username, tasks:search_res[i].completed_tasks});
    }
    res.json({
        response: JSON.stringify(resp_arr),
    })
})
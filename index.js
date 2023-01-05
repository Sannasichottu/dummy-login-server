const express = require('express');
const app = express();
const mongoose = require('mongoose')
require ('dotenv').config();
const userSchema = require('./router/userRouter');
const morgan = require('morgan');
const cors = require('cors')


//Middleware
app.use(express.json());
app.use(morgan('dev'));
app.use(cors())


//mongoose connection
const uri = process.env.ATLAS_URI

mongoose.set('strictQuery', false);
mongoose.connect(uri,err => {
    if(err) throw err;
})
const connection = mongoose.connection;
connection.once('open',()=>{
    console.log("Db connection successfully")
})


//Router
app.use('/user',userSchema);


/*
app.use('/',(req,res) => {
    res.send("Hlo")
})*/

app.listen(3002, () => {
    console.log(`server is running`);
})
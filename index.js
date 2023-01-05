const express = require('express');
const app = express();
const mongoose = require('mongoose')
require ('dotenv').config();
const userSchema = require('./router/userRouter');
const morgan = require('morgan');
var cors = require('cors');



//Middleware
app.use(express.json());
app.use(morgan('dev'));
app.use(cors());

const port = process.env.PORT || 5000

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

app.listen(port, () => {
    console.log(`server is running`);
})
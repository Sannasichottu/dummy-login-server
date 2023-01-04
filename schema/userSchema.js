const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name : {
        type:String,
        required: true,
        lowercase:true
    },
    number : {
        type:Number,
        required:true
    },
    email:{
        type:String,
        required: true
    },
    password : {
        type:String,
        required: true
    },
    otp:{
        type:Number,
        required:true
    }

})

module.exports = mongoose.model("User", UserSchema);
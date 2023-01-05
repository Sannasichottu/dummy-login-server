const router = require('express').Router();
const User = require('../schema/userSchema');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

//Register
router.post('/register',async(req,res) => {
    try {
        var emailExist = await User.findOne({email:req.body.email});
        if(emailExist) {
            return res.status(400).json("Email already exists.")
        }
        //password- encrypt
        var hash =await bcrypt.hash(req.body.password,10);
        var user = new User({
            name:req.body.name,
            number:req.body.number,
            email:req.body.email,
            password:hash
        });
        var data = await user.save();
        res.json(data);
    } catch (err) {
        res.status(400).json(err);
    }
    //res.json(user);
});

//Login

router.post('/login',async (req,res)=> {
    try {
        var userData = await User.findOne({email:req.body.email});
        if(!userData) {
            return res.status(400).json("Email not exist.")
        }

        var validPsw = await bcrypt.compare(req.body.password, userData.password);

        if(!validPsw){
            return res.status(400).json("Please enter correct password!.")
        }

        //jsonwebtoken
        var userToken = jwt.sign({email:userData.email},"sannasiChottu"); //sannasiChottu- dummy private key

        res.setHeader('auth', userToken).json(userToken);

    } catch (err) {
        res.status(400).json(err);
    }
})

//getAll

const validUser = (req,res,next) => {    // login-> pandra user mattum ella users-yum pakka mudiyum
    var token = req.header('auth');
    req.token = token;
    next()
};



router.get('/getAll',validUser, async(req,res) => {
    jwt.verify(req.token,"sannasiChottu", async(err,data)=>{
        if(err) {
            res.sendStatus(403)
        }else{
            const data = await User.find().select(['-password']);
            res.json(data)
        }
    })

})

//send - otp
router.post('/send-otp', async (req,res) => {
    console.log(req.body);

    const _otp = Math.floor(100000 + Math.random() * 900000 );
    console.log(_otp);

   // User.findOne({email:req.body.email})
    //.then(result =>{
        let user = await User.findOne({email : req.body.email})
        //send to user email

        if(!user) {
            res.send({code:500, message:'user not found'})
        }

        let testAccount = await nodemailer.createTestAccount()

        //nodemailer
        let transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass
            }
        })



        let info = await transporter.sendMail({
            from: 'sannasichottu@gmail.com',
            to: req.body.email, // list of receivers
            subject: "OTP", // Subject line
            text: String(_otp),
            html: `<html>
                < body >
                Hello and welcome
            </ >
           </html > `,
        })

        if (info.messageId) {

            console.log(info, 84)
            User.updateOne({ email: req.body.email }, { otp: _otp })
                .then(result => {
                    res.send({ code: 200, message: 'otp send' })
                })
                .catch(err => {
                    res.send({ code: 500, message: 'Server err' })

                })

        } else {
            res.send({ code: 500, message: 'Server err' })
        }
    })


//submit - otp
router.post('/submit-otp',(req,res) => {
    console.log(req.body);

    User.findOne({ otp: req.body.otp }).then(result => {

        //  update the password



        User.updateOne({ email: result.email }, { password: req.body.password })
            .then(result => {
                res.send({ code: 200, message: 'Password updated' })
            })
            .catch(err => {
                res.send({ code: 500, message: 'Server err' })

            })


    }).catch(err => {
        res.send({ code: 500, message: 'otp is wrong' })

    })
})


module.exports = router;
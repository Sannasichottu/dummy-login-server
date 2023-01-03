const router = require('express').Router();
const User = require('../schema/userSchema');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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
    res.json(user);
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

        res.header('auth', userToken).json(userToken);

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


module.exports = router;
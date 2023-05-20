const express=require("express")
const cors=require("cors")
const { default: mongoose } = require("mongoose")
const app=express()
app.use(cors({
    origin:'*',
    methods: ['GET','POST','DELETE','UPDATE','PUT','PATCH']
}))
app.use(express.json())
const User=require("./models/userSchema")
const Admin = require('./models/adminSchema');
const Payment = require('./models/withdrawSchema')
const nodemailer = require('nodemailer')
const {authentication,authorisation} = require('./middleware/auth')
const session = require('express-session');
const jwt = require('jsonwebtoken');

const connection_url = "mongodb+srv://Tushar:1234@cluster0.jfwhxqh.mongodb.net/test"
const PORT = process.env.PORT || 4000;

mongoose.connect(connection_url, {
    useNewUrlParser:true
})
.then(()=> console.log("Database is connected"))
.catch((err)=> console.log(err))

// set up session middleware
app.use(session({
  token:"logged in user token",
  secret: 'mySecretKey', // replace with your own secret key
  resave: false,
  saveUninitialized: true
}));

app.post("/register",async(req,res)=>{
    console.log(req.body)

const {name,email,phone,password,friendReferal}=req.body;
const alreadyUser=await User.findOne({email})
if(alreadyUser){
    return  res.status(403).json({status:false,message:"Email id already register"})
}
// const num = 6;
// const randomString = (len = 1) => {
//    const charSet =
//    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
//    let randomString = '';
//    for (let i = 0; i < len; i++) {
//       let randomPoz = Math.floor(Math.random() * charSet.length);
//       randomString += charSet.substring(randomPoz,randomPoz+1);
//    };
//    return randomString;
// };
// let code=randomString(num)
const response=new User({
    name,email,phone,password,friendReferal
})
await response.save()
res.status(200).json({status:true,message:"Register Sucessfully"})
})
app.post('/admin/register', async(req,res)=>{
    let adminData = req.body
    let savedData = await Admin.create(adminData)
    res.send({message:"Register successfull",data:savedData})
})

app.post('/send/details',async(req,res)=>{

    let user=await User.findOne({email:req.body.email})
    if(!user){
    return  res.status(403).json({status:false,message:"Invalid User"})
    }
    await User.updateOne({email:req.body.email},{$set:{qrDetails:[req.body]}})
    return  res.status(200).json({status:true,message:"send details sucessfully"})

})

app.post("/approve/user",async(req,res)=>{
    let users = req.body
    var userEmail = ''
    for(let ele of users){
        if(ele){
            userEmail = ele
            let user=await User.findOne({email:userEmail})
        if(!user){
            return  res.status(403).json({status:false,message:"Invalid User"})
            }
          let updatedUser =  await User.updateOne({email:userEmail},{$set:{approve:"Approved"}})
        }
    }
        return  res.status(200).json({status:true,message:"Approve sucessfully"})

})
app.post("/admin/login",async(req,res)=>{
    
    let admin=await Admin.findOne({email:req.body.email})
    // console.log(user.approve)
    if(!admin){
        return  res.status(403).json({status:false,message:"Invalid admin"})
    
    }
if(admin.password!=req.body.password){
    return  res.status(403).json({status:false,message:"Invalid Password"})

}

// await admin.updateOne({email:user.email},{$set:{referal:code}})
// console.log();
res.status(200).json({status:true,message:admin})

})
app.post("/login",async(req,res)=>{
    
    let user=await User.findOne({email:req.body.email})
    if(!user){
    return  res.status(403).json({status:false,message:"Invalid User"})

    }
if(user.approve=="Not Approved"){
    return  res.status(403).json({status:false,message:"Not Approved"})
}
if(user.password!=req.body.password){
    return  res.status(403).json({status:false,message:"Invalid Password"})

}
const num = 6;
const randomString = (len = 1) => {
   const charSet =
   'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'; 
   let randomString = '';
   for (let i = 0; i < len; i++) {
      let randomPoz = Math.floor(Math.random() * charSet.length);
      randomString += charSet.substring(randomPoz,randomPoz+1);
   };
   return randomString;
};
let code=randomString(num)
if(!user.referal){
    await User.updateOne({email:user.email},{$set:{referal:code}})
}

const payload = { userId:user._id }; // replace with your own payload data
const secret = 'myJWTSecretKey'; // replace with your own secret key
const token = jwt.sign(payload, secret);
if(!user.accessToken){
    await User.updateOne({email:user.email},{$set:{accessToken:token}})
}else{
    return res.status(422).send({status:false, message:"You are already logged in"})
}
req.session.token = token;
res.setHeader('Authorization', 'Bearer '+ token); 
 res.status(200).json({status:true,message:user, accessToken:token})

})


app.get("/approve/request",async(req,res)=>{
let user=await User.find({approve:'Not Approved'})
res.status(200).json(user)

});
app.get("/users/info", async(req, res)=>{
    let allData = await User.find({approve:"Approved"})
    if(allData.length == 0){
        return res.status(404).send({status:false, message:'User data not found'})
    }
    return res.status(200).send({status:true, userData:allData})
})

app.get('/user/referalId',authentication, async(req,res)=>{
    let referalId = await User.findOne({_id:req.user_id}).select({referal:1, _id:0})
    res.status(200).send({status:true, referalId:referalId.referal})
})
app.post('/api/user/send_otp', async (req, res) => {
    let { email } = req.body
    console.log(email)
    let data = await User.findOne({email})
    if (!data) {
        return res.status(400).send({ status: false, msg: "Plz enter valid email ID" })
    }

    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: "gurucharanmanjhizx@gmail.com",
            pass: "kaasdabnqwnksmvy"
        }
    });
    let otpnum = Math.floor(1000 + (Math.random() * 9000))

     await User.findOneAndUpdate({ email: req.body.email }, { $set: { otp: otpnum } })

    var mailOptions = {
        from: "gurucharan@hminnovance.com",
        to: `${req.body.email}`,
        subject: "Reset Password OTP",
        text: `
     Reset password OTP for email  is ${otpnum}

    Do not share this OTP with anyone`
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            res.status(200).send(info)
        }
    });
}
)

app.post('/api/user/verify_otp', async(req,res)=>{
    let OTP = req.body.otp
    console.log(OTP)
    let isValidOtp = await User.findOne({OTP})
    if(!isValidOtp){
        return res.status(400).send({status:false, message:"Invalid OTP"})
    }
    return res.status(200).send({status:true, message:"OTP verified successfully"})
});
app.put('/api/user/change_password', async(req,res)=>{
    let {password,confirmPassword, otp} = req.body
    console.log(req.body)
    let savedPwd = await User.findOneAndUpdate({otp}, {$set:{password:password}})
    if(!savedPwd){
        return res.status(400).send({status:false, message:"Unable to change password Try again!"})
    }
    return res.status(200).send({status:false, message:"Your password has been changed"})
})

app.post('/api/user/wallet', async(req,res)=>{
    const {planType, amount} = req.body
    let savedWallet = await User.findOneAndUpdate({email}, {$inc:{wallet:-amount}})
    if(!savedWallet){
        return res.status(400).send({status:false, message:"Unable to pay"})
    }
    return res.status(200).send({status:true, message:"Plan purchased successfully"})
});
// get wallet amount
app.get('/api/user/:email/get_wallet_amount', async(req,res)=>{
    let Amount = await User.findOne({email:req.params.email}).select({wallet:1, _id:0})
    res.status(200).send({status:true, Amount})
})

//save User payment request
app.post('/api/user/payment_request', async(req,res)=>{
    let {name,
        bankName,
        accountNumber,
        ifscCode, userId} = req.body
        if(!name || !bankName || !accountNumber || !ifscCode || !userId){
            return res.status(400).send({statu:false, message:"All fields are required!"})
        }
        let savedpayment = await Payment.create(req.body)
        if(!savedpayment){
            return res.status(400).send({status:false, message:"Invalid Credentials"})
        }

})
app.listen(PORT,()=>{
    console.log("server started")
})
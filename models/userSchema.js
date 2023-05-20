//const { default: mongoose } = require("mongoose")
const mongoose=require("mongoose")

const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },email:{
        type:String,
        required:true
    },phone:{
        type:String,
        required:true
    },password:{
        type:String,
        required:true
    },referal:{
        type:String
    },
    friendList:{
        
            type:[]
        
    },
    approve:{
        type:String,
        default:"Not Approved"
    },
    qrDetails:{
        type:[]
    },
    friendReferal:{
        type:String,
    },
    plan:{
        type:String,
        
    },
    accessToken:{
        type:String
    },
    Otp:{
        type:String,
        trim:true,
        default:null
    },
    wallet:{
        type:String,
        trim:true,
        default:"100"
    }
})

const User=mongoose.model("USER",userSchema)
module.exports=User
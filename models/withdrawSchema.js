const mongoose = require('mongoose');

const withdrawSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true,
        tolowercase:true
    },
    bankName:{
       type:String,
       trim:true,
       required:true
    },
    accountNumber:{
        type:Number,
        trim:true
    },
    ifscCode:{
        type:String,
        trim:true
    },
    userId:[{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        trim:true
    }]
})

module.exports = mongoose.model('Withdraw', withdrawSchema)
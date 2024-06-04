require('dotenv').config()
const mongoose=require("mongoose")


mongoose.connect(process.env.MONG0_URL)
.then(()=>{
    console.log('mongoose connected');
})
.catch((e)=>{
    console.log('failed');
})

const logInSchema=new mongoose.Schema({
    name:{
        type:String,
        required:false
    },
    password:{
        type:String,
        required:false
    },
    scored:{
        type:Number,
        required:false
    },
    scores:{
        type:Number,
        required:false
    }
 
})

const LogInCollection=new mongoose.model('LogInCollection',logInSchema)

module.exports=LogInCollection
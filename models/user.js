const mongoose = require("mongoose");
const validator = require("validator")

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        minLength:3,
        maxLength:50
    },
    email:{
        type:String,
        lowercase:true,
        trim:true,
        required:true,
        unique:true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error("Email is invalid")
            }
        }
    },
    password:{
        type:String,
        required:true,
        minLength:6,
    },
    role: {
    type: String,
    enum: ['Applicant', 'Recruiter'],
    required: true,
    default: 'Applicant', 
  },
    age:{
        type:Number,
        min:18,
    },
    gender:{
        type:String,
        validate(value){
            if(!["male","female","others"].includes(value)){
                throw Error("Gender data is invalid")
            }
        }
    },
    phone:{
        type:String,
        maxLength:10,
    }
}, {
    timestamps: true
})

const UserModel = mongoose.model("User",userSchema)
module.exports = UserModel; 
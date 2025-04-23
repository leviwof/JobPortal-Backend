const validator = require("validator")

const validateSignUpData = (res)=>{
    const{name,email,password} = res.body;

    if(!name || !email || !password ){
        throw new Error("All fields are required")
    }
    // else if(validator.isEmail(email)){
    //     console.log("Email" + email)
    //     throw new Error("Email is invalid")
    // }
    else if(!validator.isStrongPassword(password)){
       throw new Error("Password is weak")
    }
}

module.exports = {validateSignUpData};
const mongoose = require("mongoose")

const connectDB = async()=>{
 await mongoose.connect(
    "mongodb+srv://srank8861:Ip6HWoJJjYBLGeOU@cluster0.nvkkzuf.mongodb.net/JobPortal "
)
}

module.exports = connectDB
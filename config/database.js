const mongoose = require("mongoose")



const DB_URL = process.env.MONGODB_URI
const connectDB = async()=>{
 await mongoose.connect(
     DB_URL || "mongodb+srv://Srank01:srankzero@cluster0.nvkkzuf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
    // "mongodb+srv://srank8861:Ip6HWoJJjYBLGeOU@cluster0.nvkkzuf.mongodb.net/JobPortal "
)
}

module.exports = connectDB
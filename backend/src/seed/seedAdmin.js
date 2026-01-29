import dotenv from "dotenv";dotenv.config();
import bcrypt from "bcryptjs";
import { connectDB } from "../config/db.js";
import User from "../models/User.js";
const run=async()=>{await connectDB();
const username="admin";const password="123456";
const exists=await User.findOne({username});if(exists){console.log("✅ Admin already exists");process.exit(0);}
const hash=await bcrypt.hash(password,10);
await User.create({username,password:hash,role:"admin",name:"Admin",location:"E-Mart HQ"});
console.log("✅ Default admin created", username, password);process.exit(0);};
run().catch(e=>{console.error(e);process.exit(1);});
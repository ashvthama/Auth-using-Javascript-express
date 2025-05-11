import mongoose from "mongoose"
import dotenv from "dotenv"
dotenv.config();
const db = async()=>{
    try{
        mongoose.connect(process.env.MONGO_URL);
        console.log("sucessful connection")
    }
    catch(err){
        console.error("error in dbjs ", err.message);
    }
}
export default db;
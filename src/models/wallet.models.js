
import { Schema, model } from "mongoose";

const WalletSchema = new Schema({
  id: { type: String, required: true, unique: true },
  userId:{type:String,required:true},
  amount: { type: Number, required: true, default:0 },       
    
}, { timestamps: true });


const Wallet = model("Wallet", WalletSchema);
export default Wallet; 
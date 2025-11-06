
import { Schema, model } from "mongoose";

const TransactionSchema = new Schema({
  id: { type: String, required: true, unique: true },
  userId:{type:String,required:true},
  paymentId: { type: String, required: true, unique:true },  
  amount: { type: Number, required: true },         
  method: { type: String, enum: ["rupee", "credit"], required:true },
  membership: { type: String, enum: ["inner-circle", "courses"], required:true},        
    
}, { timestamps: true });


const Transaction = model("Transaction", TransactionSchema);
export default Transaction; 
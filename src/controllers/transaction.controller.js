import Transaction from "../models/transaction.models.js";
import { v4 as uuidv4 } from 'uuid';

export const createTransaction = async (req, res) => {
  try {
    const {
      userId, paymentId, amount, method, membership
    } = req.body
    if (
         !userId
        || !paymentId
        || !amount
        //|| method.length == 0
        //|| membership.length == 0
      ){
        
       return res.status(400).json({message:"All fields are required", data:req.body});
    }
    
    const transaction = await Transaction.create({id:uuidv4(), userId, paymentId, amount, method, membership, id:uuidv4()});
    if(!transaction){
      return res.status(404).json({ message: "Transaction not found" });
    }
    return res.status(201).json(transaction);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

export const updateTransaction = async (req, res)=>{
  try{
    // const id = req.user.id;
    const {data,id}=req.body
    const transaction = await Transaction.findOneAndUpdate({id}, data, { new: true });
    if(!transaction){
      return res.status(404).json({ message: "Transaction not found" });
    }
   return res.json({success: true, message: "Transaction updated successfully", transaction});
  } catch(err){
   return res.status(500).json({ error: err.message });
  }
}

export const getAllTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.find();
    res.json(transaction);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getTransactionByID = async (req, res) =>{
  try {
    const id = req.params.id;
    const transaction = await Transaction.find({id});
    if(transaction.length == 0){
      res.json({message: "transaction not found", success: false})
    } else {
      res.json({success: true, transaction})
    }
  } catch (err){
    console.log(err.message)
  }
}

export const getTransactionByUserID = async (req, res) =>{
  try {
    const userId = req.params.userId;
    console.log(userId);
    const transaction = await Transaction.find({userId});
     
    if(transaction.length == 0){
     
      res.json({message: "transaction not found", success: false})
    } else {
      res.json({success: true, transaction})
    }
  } catch (err){
    console.log(err.message)
  }
}

export const getTransactionByPaymentID = async (req, res) =>{
  try {
    const PaymentID = req.params.PaymentId;
    const transaction = await Transaction.find({PaymentID});
    if(transaction.length == 0){
      res.json({message: "transaction not found", success: false})
    } else {
      res.json({success: true, transaction})
    }
  } catch (err){
    console.log(err.message)
  }
}

export const getTransactionByMethod = async (req, res) =>{
  try {
    const Method = req.params.Method;
    const transaction = await Transaction.find({Method});
    if(transaction.length == 0){
      res.json({message: "transaction not found", success: false})
    } else {
      res.json({success: true, transaction})
    }
  } catch (err){
    console.log(err.message)
  }
}

export const getTransactionByMembership = async (req, res) =>{
  try {
    const Membership = req.params.Method;
    const transaction = await Transaction.find({Membership});
    if(transaction.length == 0){
      res.json({message: "transaction not found", success: false})
    } else {
      res.json({success: true, transaction})
    }
  } catch (err){
    console.log(err.message)
  }
}

export const deleteTransaction = async (req, res) => {
  try {
    await Transaction.findOneAndDelete({id:req.params.id});
   return res.json({ message: "Transaction deleted" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

import Wallet from "../models/wallet.models.js";
import { v4 as uuidv4 } from 'uuid';

export const createWallet = async (req, res) => {
  try {
    const {
      userId, amount
    } = req.body
    if (!userId
        || !amount
      ){
        
       return res.status(400).json({message:"All fields are required", data:req.body});
    }
    
    const wallet = await Wallet.create({id:uuidv4(), userId, amount, id:uuidv4()});
    if(!wallet){
      return res.status(404).json({ message: "Wallet not found" });
    }
    return res.status(201).json(wallet);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

export const getAllWallet = async (req, res) => {
  try {
    const wallet = await Wallet.find();
    res.json(wallet);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getWalletByID = async (req, res) =>{
  try {
    const id = req.params.id;
    const wallet = await Wallet.find({id});
    if(wallet.length == 0){
      res.json({message: "Wallet not found", success: false})
    } else {
      res.json({success: true, wallet})
    }
  } catch (err){
    console.log(err.message)
  }
}

export const getWalletByUserId = async (req, res) => {
  try {
    const userId = req.user.id;
    const wallet = await Wallet.findOne({userId});
    if(!wallet){
      res.json({message: "Wallet not found", success: false})
    } else {
      res.json({success: true, wallet})
    }
  } catch (err){
    console.log(err.message)
  }
}
export const incrementWalletByUserId = async (req, res) => {
  try {
    const id = req.params.id;
    const amount = req.body.amount
    const wallet = await Wallet.findOneAndUpdate({ userId:id }, { $inc: { amount: amount } }, { new: true });
    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }
    return res.json({ success: true, message: "Wallet updated successfully", wallet });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const decrementWalletByUserId = async (req, res) => {
  try {
    const id = req.user.id;
    const amount = req.body.amount
    const wallet = await Wallet.findOneAndUpdate({ userId:id }, { $inc: { amount: amount<0 ? 0 : -amount } }, { new: true });
    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }
    return res.json({ success: true, message: "Wallet updated successfully", wallet });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};


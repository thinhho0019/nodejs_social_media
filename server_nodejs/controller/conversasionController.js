const express = require("express");
 
const conversasionService = require("../services/conversasionService");
const User = require("../models/userModel");
 
const conversasionController ={
    chatMessage: async (req,res)=>{
        const {userID,sender,text} = req.query;
        const result = await conversasionService.addConversasion(userID,sender,text);
        res.status(200).send(result);
    },
    getAllMessageByUserId: async (req,res)=>{
        const {userID} = req.query;
        const result = await conversasionService.getAllConversasionByUserId(userID);
        if(typeof result==='undefined'){
            res.status(200).send({result:"fasle"});
        }else{
            res.status(200).send(result.reverse());
        }
        
    },
    getAllConversasionByUserId : async (req,res)=>{
        const {user1,user2} = req.query;
        try{
            const result = await conversasionService.getConversasionExistUserId(user1,user2);
            res.status(200).send(result);
        }catch(err){
            res.status(500).send(err.stack);
        }
        
    },
    getAllConversasion : async (req,res)=>{
        const {userid} = req.query;
        try{
            const result = await conversasionService.getAllConversasion(userid);
            res.status(200).send(result);
        }catch(err){
            res.status(500).send(err.stack);
        }
        
    },
    checkConversasion: async (req,res)=>{

        const {userID,sender} = req.query;
        
        try{
            const result = await conversasionService.checkConversasion(userID,sender);
            res.status(200).send(result);
        }catch(err){
            res.status(500).send(err.stack);
        }
    },
    verifyMessageSeen :async (req,res)=>{
        const {conversation,action,user} = req.query;
        try{
            const result = await conversasionService.verifyMessage(conversation,action,user);
            res.status(200).send(result);
        }catch(err){
            res.status(500).send(err.stack);
        }
    }
}

module.exports = conversasionController;
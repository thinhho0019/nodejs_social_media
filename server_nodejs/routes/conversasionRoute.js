const express = require('express');
const conversasionController = require("../controller/conversasionController");
const route = express.Router();
route.use(express.json());
route.use(express.urlencoded({extended:true}));
route.get('/addchat',conversasionController.chatMessage);
route.get('/getallmessagebyuser',conversasionController.getAllMessageByUserId);
route.get('/getallconversasionbyuser',conversasionController.getAllConversasionByUserId);
route.get('/getallconversasion',conversasionController.getAllConversasion);
route.get('/checkconversasion',conversasionController.checkConversasion);
route.get('/verifymessage',conversasionController.verifyMessageSeen);
module.exports = route;
const conversasionModel = require("../models/conversationsModel")
const mongoose = require('../utils/connectDB');

class conversasionService {
  async getConversasionById(conversationId) {
    const value = await conversasionModel.findById(conversationId).exec();
    return value;
  };
  async checkAndGetConversationId(user1,user2){

  }
  async getConversasionExistUserId(user1, user2) {
    const value = await conversasionModel.find(
      { "members": { $all: [user1, user2] } },
      {
        messages: { $slice: -1 },
        updated_at: 1,
        members: 1,
        created_at: 1,
      }
    ).populate({
      path: "members",
      select: "name email avatar"
    })
      .exec();

    return value;
  };
  async getAllConversasionByUserId(userId) {
    const value = await conversasionModel.findOne({ _id: userId }).exec();
    return value ? value.messages : [];
  };
  async getAllConversasion(userId) {
    const value = await conversasionModel.find(
      { "members": userId,messages: { $elemMatch: { $exists: true, $ne: [] }} },
      {
        messages: { $slice: -1 },
        updated_at: 1,
        members: 1,
        created_at: 1,
      }
    ).populate({
      path: "members",
      select: "name email avatar"
    })
      .exec();

    return value;
  };
  async addConversasion(userID, sender, text) {
    const checkExist = await conversasionModel.findOne({ members: { $all: [userID, sender] } }).exec();
    if (checkExist) {
      const filter = { _id: checkExist.id };
      const update = {
        $push: {
          messages: {
            _id: new mongoose.Types.ObjectId(),
            sender: sender,
            text: text,
            created_at: new Date()
          }
        },
        $set: {
          updated_at: new Date()
        }
      }
      const result = await conversasionModel.updateOne(filter, update).exec();

      return { result: true, content: "add new message", detail: result };
    } else {
      const member = [userID, sender];
      const value = await conversasionModel({ members: member }).save();
      return value;
    }
  }
  async checkConversasion(userID, sender) {
    const checkExist = await conversasionModel.findOne({ members: { $all: [userID, sender] } }).exec();
    if (checkExist != null) {
      return checkExist;
    } else {
      const member = [userID, sender];
      const value = await conversasionModel({ members: member }).save();
      return value;
    }

  }
  async verifyMessage(conversation, action,user) {
    if(conversation=="empty") return;
    const result = await conversasionModel.find(
      { _id: conversation },
      {
        messages: { $slice: -1 },
        updated_at: 1,
        members: 1,
        created_at: 1,
      }
    ).exec();
    console.log(result);
    try{
      var sender = result[0].messages[0].sender;
      var id = result[0].messages[0]._id;
      
        const kq = await conversasionModel.findOneAndUpdate(
          { _id: conversation },
          { $set: { "messages.$[lastMessage].status": action } },
          {
            arrayFilters: [
              { "lastMessage._id": id},
             
            ]
          }
        ).catch((e)=>{
          return false
        });
        return id;
      
      
    }catch(e){
      return e;
    }
  
  }
}

module.exports = new conversasionService();
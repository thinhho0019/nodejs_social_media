const reportModel = require('../models/reportModel');
const { waitFriends } = require('./userService');
const postModel = require("../models/postModel");
const { populate } = require('../models/userModel');
class reportService {
    async addReport(data) {
        const result = await reportModel(data).save();
        return result;
    }
    async getReportAll(){
        const result = await reportModel.find(
            {},
            {

            }
        ).populate({
            path:"user",
            select:"name"
        })
        .sort({ state: -1 });
        return result;
    }
   async detailReport(id){
        const result =  await reportModel.findOne(
            {_id:id}
        ).populate({
            path:"user",
            select:"name"
        }).populate({
            path:"post",
            select:"content image user",
            populate :
                {
                    path:"user",
                    select:"name"
                }
            
        })
        return result;
   }
   async updatePostWhenDelete(post){
    await reportModel.updateMany(
        {
            post:post
        },{
            $set:{ post:null }
        }
       );
   }
   async updateStateReport(post){
       await reportModel.updateMany(
        {
            post:post
        },{
            $set:{ state: "done" }
        }
       );
   }
}

module.exports = new reportService()
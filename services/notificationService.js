const notificationModel = require('../models/notificationModel')

class notificationService {
    async addNotification(data) {
        const result = await notificationModel(data).save();
        return result;
    }
    async updateTimeAddFriend(useraction, userrecei){
        const result = await notificationModel.findOneAndUpdate(
            {
                useraction: useraction,
                userrecei:userrecei,
                type:"addfriend",
                
            },{
                $set: { create_at: new Date() ,seen:"false"}
            }
        ).exec().catch(e=>{
            console.log(e);
        });
        console.log(result);
        if (result === null) {
            return true;
        } else {
            return false;
        }
    }
    async updateTimeAceeptFriend(useraction, userrecei){
        const result = await notificationModel.findOneAndUpdate(
            {
                useraction: useraction,
                userrecei:userrecei,
                type:"acceptfriend",
                
            },{
                $set: { create_at: new Date(),seen:"false" }
            }
        ).exec();
         
        if (result === null) {
            return true;
        } else {
            return false;
        }
    }
    //check you had liked and notification
    async checkNotificationLike(userid, postid) {
        const result = await notificationModel.findOne(
            {
                useraction: userid,
                post: postid
            }
        ).exec();
         
        if (result === null) {
            return true;
        } else {
            return false;
        }
    }
    async checkNotificationAddFriends(useraction, userrecei) {
        const result = await notificationModel.findOne(
            {
                useraction: useraction,
                userrecei: userrecei,
                type:"addfriend"
            }
        ).exec();
         
        if (result === null) {
            return true;
        } else {
            return false;
        }
    }
    async checkNotificationAcceptFriends(useraction, userrecei) {
        const result = await notificationModel.findOne(
            {
                useraction: useraction,
                userrecei:userrecei,
                type:"acceptfriend"
            }
        ).exec();
         
        if (result === null) {
            return true;
        } else {
            return false;
        }
    }
    async seenNotification(id){
        await notificationModel.findOneAndUpdate({
            _id:id
        },
        {
            $set: { seen: "true" }
        }
        ).catch(e=>{
            print(e);
        })
    }
    async getNotificationUserId(id) {
        const result = await notificationModel.find(
            {userrecei:id}
        )
        .populate({
            path: "post",
            select: "id content like_count comment_count create_at access image user",
            populate: {
                path: "user",
                select: "id avatar name",
              }
        }).populate({
            path: "useraction",
            select: "id avatar name",
        }).populate({
            path: "userrecei",
            select: "id avatar name",
        }).sort({ create_at: -1 }).catch(e=>{
            return e;
        });
        const data = [];
     
        
        result.forEach(
            e => {
                 console.log(e["useraction"]["_id"]);
                if( e["useraction"]["_id"].toString() != e["userrecei"]["_id"].toString()){
                    
                    data.push(e);
                }

               
            }
        );

        return result;
    }
}

module.exports = new notificationService()
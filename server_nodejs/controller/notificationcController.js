const notificationService = require("../services/notificationService")

const notificationController = {
    getAllNotificationUserID: async (req,res)=>{
        const {userid} = req.body;

        res.status(200).json(await notificationService.getNotificationUserId(userid));
    },
    seenNotification : async (req,res)=>{
        const {id} = req.body;
        res.status(200).json(await notificationService.seenNotification(id));
    }

}

module.exports = notificationController
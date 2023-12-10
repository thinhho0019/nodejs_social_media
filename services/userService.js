const userModel = require("../models/userModel")
const userDetailModel = require("../models/userDetailModel")
const notificationService = require("../services/notificationService")
const fcm = require('../utils/fcm');
 
class userService {
    async findAllUser(id) {
        const user = await userModel.find({}, { name: 1, email: 1, avatar: 1, friends: 1, wait_friends: 1 }).exec();
        return user;
    };
    async checkUser(id) {
        const check = await userModel.findOne({ google_id: id }).exec();
        return check;
    };
    async updateProfile(idDetail, data) {
        const userDetail = await userDetailModel.findOneAndUpdate(
            { _id: idDetail },
            {
                bio: data['bio'],
                job: data['job'],
                address_form: data['address_form'],
                address_live: data['address_live'],
                birthday: data['birthday'],
                studying: data['studying'],
                background_image: data['background_image']
            }, {
            new: true
        }
        ).exec();
        return userDetail;
    };
    async checkRelationshipUser(user1, user2) { //user2 should check
        //check friends
        const userFriends = await userModel.findOne({ _id: user1, friends: user2 });
        if (userFriends != null) {
            return "friends"
        }
        //check cancel await friends
        const userAwaitFriends = await userModel.findOne({ _id: user1, wait_friends: user2 });
        if (userAwaitFriends != null) {
            return "cancleawait"
        }
        //check receive add friends
        const userReceiveAddFriend = await userModel.findOne({ _id: user2, wait_friends: user1 });
        if (userReceiveAddFriend != null) {
            return "receiveaddfriend"
        }
        //check unknow friends
        return "unknow";
    };
    async getInformationUser(userId) {
        const data = await userModel.findById({ _id: userId }, {
            user_detail: 1,
            name: 1,
            avatar: 1,
            create_at: 1,
            friends: 1,
            wait_friends: 1
        }).populate({
            path: "user_detail",

        });
        return data;
    }
    async addNewUser(name, email, picture, google_id, access_token_current) {
        const userDetail = new userDetailModel();
        await userDetail.save();
        const newUser = new userModel({ name: name, email: email, avatar: picture, google_id: google_id, access_token_current: access_token_current, log_out: "0", user_detail: userDetail });
        const saveUser = await newUser.save();
        return saveUser;
    }
    async logOutUser(userId, status) {
        await userModel.findByIdAndUpdate({ _id: userId }, {
            log_out: "1",
            token_notification: "null"
        })
    }
    async acceptFriends(userSender, userReceiver,nameSend,nameRecei) {
        const check = await userModel.findOneAndUpdate(
            { _id: userSender, wait_friends: userReceiver },
            { $pull: { wait_friends: userReceiver }, $addToSet: { friends: userReceiver } },
            {
                new: true,
                upsert: true // Make this update into an upsert
            }
        ).catch((e) => {
            return {
                result: false
            };
        });
      
        const checkU = await userModel.findOneAndUpdate({ _id: userReceiver },
            { $addToSet: { friends: userSender } },
            {
                new: true,
                upsert: true // Make this update into an upsert
            }).catch((e) => {
                return {
                    result: false
                };
            });
              //notification
              const dataA = {
                useraction: userSender,
                userrecei: userReceiver,
                post: null,
                type: "acceptfriend",
                create_at: new Date(),
            }
            const dataB = {
                useraction: userReceiver,
                userrecei: userSender,
                post: null,
                type: "acceptfriend",
                create_at: new Date(),
            }
            const checkA = await notificationService.checkNotificationAcceptFriends(userSender, userReceiver);
            const checkB = await notificationService.checkNotificationAcceptFriends( userReceiver,userSender);
            const getTokenNotiA = await this.getTokenNotification(userSender);
            const getTokenNotiB = await this.getTokenNotification(userReceiver);
            if (checkA && checkB) {

                //u1
                await notificationService.addNotification(dataA);
                
                // if (getTokenNotiA != "null") {
                //     await fcm.pushNotification(getTokenNotiA.token_notification, "Thông báo chattt","Bạn và "+ nameRecei+ " đã trở thành bạn bè");
                // }
                //u2
                await notificationService.addNotification(dataB);
                
                if (getTokenNotiB != "null") {
                    await fcm.pushNotification(getTokenNotiB.token_notification, "Thông báo chattt","Bạn và "+ nameSend  + " đã trở thành bạn bè");
                }
            }else{
                //
                await notificationService.updateTimeAceeptFriend(userSender, userReceiver)
                if (getTokenNotiA != "null") {
                    await fcm.pushNotification(getTokenNotiA.token_notification, "Thông báo chattt","Bạn và "+ nameSend+ " đã trở thành bạn bè");
                }
                
                // await notificationService.updateTimeAceeptFriend(userReceiver,userSender )
                // if (getTokenNotiB != "null") {
                //     await fcm.pushNotification(getTokenNotiB.token_notification, "Thông báo chattt","Bạn và "+  nameRecei+ " đã trở thành bạn bè");
                // }
            }
        return {
            result: true
        };

    }
    async cancelFriends(userSender, userReceiver, action) {
        if (action == "cancelwait") {
            await userModel.findOneAndUpdate(
                { _id: userSender, wait_friends: userReceiver },
                { $pull: { wait_friends: userReceiver } },
                {
                    new: true,
                    upsert: true // Make this update into an upsert
                }
            ).catch((e) => {
                return {
                    result: false
                };
            });

            return {
                result: true
            }
        } else if (action == "cancelfriends") {
            const checkuserSender = await userModel.findOneAndUpdate(
                { _id: userSender, friends: userReceiver },
                { $pull: { friends: userReceiver } },
                {
                    new: true,
                    upsert: true // Make this update into an upsert
                }
            ).catch((e) => {
                return {
                    result: "dont cancle friends " + e
                };
            });
            const checkuserReceiver = await userModel.findOneAndUpdate(
                { _id: userReceiver, friends: userSender },
                { $pull: { friends: userSender } },
                {
                    new: true,
                    upsert: true // Make this update into an upsert
                }
            ).catch((e) => {
                return {
                    result: "dont cancle friends " + e
                };
            });
            return {
                checkuserSender,
                checkuserReceiver
            }
        } else if (action == "cancle_wait_receiver") {
            await userModel.findOneAndUpdate(
                { _id: userReceiver, wait_friends: userSender },
                { $pull: { wait_friends: userSender } },
                {
                    new: true,
                    upsert: true // Make this update into an upsert
                }
            ).catch((e) => {
                return {
                    result: false
                };
            });

            return {
                result: true
            }
        }
    }
    async getListWaitAcceptFriends(userId) {
        const user = await userModel.find({ wait_friends: userId });
        return user;
    }
    async waitFriends(userSender, userReceiver, nameSender) {
        await userModel.findOneAndUpdate({ _id: userSender }
            , { $addToSet: { wait_friends: userReceiver } },
            { new: true, upsert: true }).exec()
            .catch((e) => {
                return {
                    result: false
                }
            });
        const data = {
            useraction: userSender,
            userrecei: userReceiver,
            post: null,
            type: "addfriend",
            create_at: new Date(),
        }
        const check = await notificationService.checkNotificationAddFriends(userSender, userReceiver);
        const getTokenNoti = await this.getTokenNotification(userReceiver);
        if (check) {
            console.log("1");
            await notificationService.addNotification(data);
            
            if (getTokenNoti != "null") {
                await fcm.pushNotification(getTokenNoti.token_notification, "Thông báo chattt", nameSender + " đã gửi lời mời kết bạn");
            }
        }else{
            console.log("2");
            await notificationService.updateTimeAddFriend(userSender, userReceiver)
            if (getTokenNoti != "null") {
                await fcm.pushNotification(getTokenNoti.token_notification, "Thông báo chattt", nameSender + " đã gửi lời mời kết bạn");
            }
        }


        return {
            result: true
        }
    }
    async getMyFriends(userid) {
        const user = await userModel.find({ _id: userid }, {
            friends: 1
        }).populate({
            path: "friends",
            select: "name email avatar last_online"
        });
        return user;
    }
    async getWaitSendFriends(userid) { //wait request
        const user = await userModel.find({ _id: userid }, {
            wait_friends: 1
        }).populate({
            path: "wait_friends",
            select: "name email avatar"
        });
        return user;
    }
    async getwaitReceiverFriends(userid) { //wait accept
        const user = await userModel.find({ wait_friends: userid }).populate({
            path: "wait_friends",
            select: "name email avatar"
        });
        return user;

    }
    async updateUserOnline(userid) {
        await userModel.findOneAndUpdate({ _id: userid }, {
            $set: { is_online: 1, last_online: new Date() }
        }, {
            new: true,
            upsert: true // Make this update into an upsert
        }).catch(e => {
            return {
                result: false
            }
        });
        return {
            result: true
        }
    }
    async updateUserOfline(userid) {
        await userModel.findOneAndUpdate({ _id: userid }, {
            $set: { is_online: 0, last_online: new Date() }
        }, {
            new: true,
            upsert: true // Make this update into an upsert
        }).catch(e => {
            return {
                result: false
            }
        });
        return {
            result: true
        }
    }
    async findStateOnline(userid) {
        const result = await userModel.find({ _id: userid }, {
            is_online: 1,
            last_online: 1,
        }).catch((e) => {
            return {
                result: false
            }
        });
        return result;
    }


    //
    async updateImageAvatar(userid, avatar) {
        await userModel.findOneAndUpdate(
            { _id: userid },
            {
                avatar: avatar
            },
            {
                new: true
            }
        ).then(e => {
            return e;
        }).catch(e => {
            return e;
        })
    }
    async updateImageAvatarBackground(userid, avatar) {
        await userDetailModel.findOneAndUpdate(
            { _id: userid },
            {
                background_image: avatar
            },
            {
                new: true
            }
        ).then(e => {
            return e;
        }).catch(e => {
            return e;
        })
    }
    async updateTokenNotification(token, userid) {
        await userModel.findOneAndUpdate({
            _id: userid
        }, {
            token_notification: token
        }).then(e => {
            return true;
        }).catch(e => {
            return false;
        })
    }
    async getTokenNotification(userid) {
        const result = await userModel.findOne({ _id: userid }, {
            token_notification: 1
        }).catch(e => {
            return "null";
        })
        return result;
    }
    async updateNameUser(userid, name) {
        return await userModel.findOneAndUpdate(
            {
                _id: userid,
            }, {
            name: name
        }
        ).then(e => {
            return true;

        }).catch(e => {
            return false;
        })
    }
    async updateUserPassword(userid, email, password) {
        return await userModel.findByIdAndUpdate(
            { _id: userid }, {
            username: email,
            password: password
        }
        ).then(e => {
            return true;
        }).catch(e => {
            return false;
        })
    }
    async getCheckEmailPassword(userid) {
        return await userModel.findOne({
            _id: userid
        }, {
            username: 1,
            password: 1
        }).then(e => {
            return e;
        }).catch(e => {
            return e;
        })
    }
    async loginEmailPassword(username, password) {
        return await userModel.findOne({

            username: username,
            password: password

        }).then(e => {
            return e;
        }).catch(e => {
            return e;
        })
    }
    async loginAdmin(username, password) {
        return await userModel.findOne({

            username: username,
            password: password,
            role : "admin"
        }).then(e => {
            console.log(e);
            return e==null?false:true;
        }).catch(e => {
            console.log(e);
            return false;
        })
    }
}
module.exports = new userService()
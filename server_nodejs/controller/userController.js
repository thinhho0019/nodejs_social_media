const userModel = require("../models/userModel");
const axios = require('axios');
    const fs = require('fs');
const userService = require("../services/userService");
async function verifyGoogle(token) {
    const response = await axios.get(`https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${token}`);
    const userInfo = await axios.get(`https://www.googleapis.com/oauth2/v2/userinfo`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    const { email } = response.data;
    const { name, picture, id } = userInfo.data;
    return { email, name, picture, id };

}
const userController = {
    login: async (req, res) => {
        var accessToken = req.body.accesstoken;
        verifyGoogle(accessToken)
            .then(async (user) => {
                //check user
                try{
                     
                    const check = await userService.checkUser(user.id);
                   if (check===null) {
                        console.log(check);
                        res.status(200).json(await userService.addNewUser(user.name,user.email,user.picture,user.id,accessToken));
                   } else {
                        await check.updateOne({access_token_current:accessToken,log_out:0});
                       res.status(200).json({ "result": "exist",name:user.name,email:user.email,avatar:user.picture,_id:check.id });
                   }
                }catch(err){
                    res.status(200).json(err.stack);
                }
                
            })
            .catch(() => {
                res.status(200).json("accessToken: validEXP");
            });
    },
    getInformationUser : async (req,res)=>{
        var userId = req.body.userId;
        await userService.getInformationUser(userId).then((r)=>{
            res.status(200).json(r);
        }).catch((e)=>res.status(200).json(e));
    },
    logOutUser: async (req,res)=>{
        var userId = req.body.userId;
        await userService.logOutUser(userId).then((r)=>{
            res.status(200).json("oke");
        }).catch((e)=>res.status(200).json(e));
    },
    findUser: async (req,res)=>{
        var idmongo = req.query.id;
        res.status(200).json(await userService.findAllUser(idmongo));
    },
    waitFriends: async (req,res)=>{
        var userSender = req.body.userSender;
        var userReceiver = req.body.userReceiver;
        var nameSender =  req.body.nameSender;
        console.log(nameSender);
        res.status(200).json(await userService.waitFriends(userSender,userReceiver,nameSender));
    },
    acceptFriends: async (req,res)=>{
        var userSender = req.body.userSender;
        var userReceiver = req.body.userReceiver;
        res.status(200).json(await userService.acceptFriends(userSender,userReceiver));
    },
    cancelFriends :async (req,res)=>{
        var userSender = req.body.userSender;
        var userReceiver = req.body.userReceiver;
        var action = req.body.action;
        res.status(200).json(await userService.cancelFriends(userSender,userReceiver,action));
    },
    getAllUserWaitAccept :async (req,res)=>{
        var userid = req.query.userid;
        res.status(200).json(await userService.getwaitReceiverFriends(userid));
    },
    getAllMyFriends : async (req,res)=>{
        var userid = req.query.userid;
        res.status(200).json(await userService.getMyFriends(userid));
    },
    getAllUserSentAddFriend :async (req,res)=>{
        var userid = req.query.userid;
        res.status(200).json(await userService.getWaitSendFriends(userid));
    },
    getStatusOnlineUser : async (req,res)=>{
        var userid = req.query.userid;
        res.status(200).json(await userService.findStateOnline(userid));
    },
    checkRelatetionFriends : async (req,res)=>{
        var user1 = req.body.user1;
        var user2 = req.body.user2;
        res.status(200).json(await userService.checkRelationshipUser(user1,user2));
    },
    updateProfile : async (req,res)=>{
        var idDetail = req.body.idDetail;
        var data =     req.body.data;
         
    
        await userService.updateProfile(idDetail,data).then(e=>{
            console.log(e);
            res.status(200).json(e);
        }).catch(e=>{
            console.log(e);
            res.status(500).json(eachDayOfInterval);
        });
        
    },
    uploadImageAvatar : async (req,res)=>{
        var namefileold = req.body.nameimageold;
        var userid = req.body.userid;
        var namefile = "/avatar/"+req.file['filename'];
        console.log(namefile);
        if (namefileold) {
            fs.unlink("./public/images/"+namefileold, (err) => {
              if (err) console.log(err);
            });
          }
        userService.updateImageAvatar(userid,namefile).then(
            e=>{
                res.status(200).send(namefile);
            }
        ).catch(e=>{
            res.status(200).send(e);
        });

        
    },
    uploadImageBackground : async (req,res)=>{
        var namefileold = req.body.nameimageold;
        var userid = req.body.userid;
        var namefile = "/background/"+req.file['filename'];
        if (namefileold) {
            fs.unlink("./public/images/"+namefileold, (err) => {
              if (err) console.log(err);
            });
          }
        userService.updateImageAvatarBackground(userid,namefile).then(
            e=>{
                res.status(200).send(namefile);
            }
        ).catch(e=>{
            res.status(200).send(e);
        });
    },
    getTokenNotification: async (req,res)=>{
        var userid= req.body.userid;
        console.log(userid)
        // await userService.getTokenNotification(userid).then(e=>{
        //     res.status(200).json(e);
        // }).catch(e=>{
        //     res.status(500).json(e);
        // })
        const result = await userService.getTokenNotification(userid);
        console.log(result)
        res.status(200).json(result);
    },
    updateNameUser:async (req,res)=>{
        var userid =req.body.userid;
        var name = req.body.name;
        const result  = await userService.updateNameUser(userid,name);
        console.log(result);
        result?res.status(200).json(true):res.status(500).json(false);
    },
    updateUserPasswordForAccount:async (req,res)=>{
        var userid= req.body.userid;
        var email = req.body.email;
        var password = req.body.password;
        const result = await userService.updateUserPassword(userid,email,password);
        result?res.status(200).json(true):res.status(500).json(false);
    },
    getCheckEmailPassword:async (req,res)=>{
        var userid= req.body.userid;
         
        const result = await userService.getCheckEmailPassword(userid);
        res.status(200).json(result);
    },
    loginEmailPassword:async (req,res)=>{
        var email = req.body.email;
        var password = req.body.password;
        const result = await userService.loginEmailPassword(email,password);
        res.status(200).json(result);
    }
    
}

module.exports = userController;
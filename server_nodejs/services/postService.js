const postModel = require("../models/postModel");
const likeModel = require("../models/likeModel");
const userModel = require("../models/userModel");
const userService = require("../services/userService");
const notificationService = require("../services/notificationService")
const fcm = require('../utils/fcm');
const commentModel = require("../models/commentModel")
const mongoose = require('../utils/connectDB');
class postService {
    async getAllPost(user) {
        // const result = await postModel.find({access:{$ne:'private'}}).populate({
        //     path: "user",
        //     select: "name email avatar"
        //   }).limit(20);
        // var arraySortRandom = result.sort(()=>Math.random()-0.5)
        // return arraySortRandom;
        ////////////////////////
        const result = await postModel.aggregate([
            {
                $match: //dua theo du lieu ban dau
                {
                    $and: [
                        { access: { $ne: 'private' } },
                        { user:  { $ne: mongoose.Types.ObjectId.createFromHexString(user) } },
                       
                    ]
                }

            },
            { $sample: { size: 10 } },
            {
                $lookup: {
                    from: "users", // Tên collection chứa thông tin user
                    localField: "user", // Trường liên kết trong bài đăng
                    foreignField: "_id", // Trường liên kết trong collection user
                    as: "user" // Tên định danh cho thông tin user
                }
            },
            {
                $unwind: "$user"  // split user to collection single
              },
            {
                $project: {
                    _id: 1,
                    "user._id": 1,
                    "user.avatar": 1,
                    "user.email": 1,
                    "user.name": 1,
                    "user.friends": 1,
                    content: 1,
                    like_count: 1,
                    comment_count:1,
                    create_at: 1,
                    access: 1,
                    image: 1
                }
            }
        ]);
        var liked = await  this.getUserLiked(user);
        result.forEach(  (e) =>{
            var flag = true;
            liked.forEach((a)=>{
                
                if((e['_id'].equals( a['post']))&&(flag==true)){
                    console.log(e['_id']+"  vs  "+a['post']);
                    e['liked'] = true;
                    flag==false;
                }
                
            });
            
        });
        
        //friends check access friends
        result.forEach((e,index)=>{
            if(e['access'] =="friend"){
                var flag=false;
                e['user']['friends'].forEach(
                    (a) => {
                         
                        if(a===user)
                        flag=true
                    }
                );
                if(flag==false){
                     
                    result.splice(index,1)
                }
                
            }

           
        }
        
        )
        
        return result;
    };
    async getAllPostByUserId(user,useraction) {
        // const result = await postModel.find({access:{$ne:'private'}}).populate({
        //     path: "user",
        //     select: "name email avatar"
        //   }).limit(20);
        // var arraySortRandom = result.sort(()=>Math.random()-0.5)
        // return arraySortRandom;
        ////////////////////////
        //check friend
        const resultFriend = await userService.checkRelationshipUser(user,useraction);
        console.log("msg:" +user==useraction?"":resultFriend=="friends"?"":'friend');
        const result = await postModel.aggregate([
            {
                $match: //dua theo du lieu ban dau
                {
                    $and: [
                        { access: { $nin: [user==useraction?"":'private' , 
                        user==useraction?"":resultFriend=="friends"?"":'friend'
                    ]} },
                         { user:  mongoose.Types.ObjectId.createFromHexString(user) }
                    ]
                }

            },
             { $sample: { size: 20 } },
            {
                $lookup: {
                    from: "users", // Tên collection chứa thông tin user
                    localField: "user", // Trường liên kết trong bài đăng
                    foreignField: "_id", // Trường liên kết trong collection user
                    as: "user" // Tên định danh cho thông tin user
                }
            },
            {
                $unwind: "$user"  // split user to collection single
              },
            {
                $project: {
                    _id: 1,
                    "user._id": 1,
                    "user.avatar": 1,
                    "user.email": 1,
                    "user.name": 1,
                    content: 1,
                    like_count: 1,
                    comment_count:1,
                    create_at: 1,
                    access: 1,
                    image: 1
                }
            }
        ]).sort({ create_at: -1 }).catch(e=>{
            return e;
        });
        try{
            if(user==useraction){
             
                var liked = await likeModel.find({ user: user});
                console.log(liked);
            result.forEach(  (e) =>{
                var flag = true;
                liked.forEach((a)=>{
                    
                    if((e['_id'].equals( a['post']))&&(flag==true)){
                         
                        e['liked'] = true;
                        flag==false;
                    }
                    
                });
                
            });
            }else{
                var liked = await likeModel.find({ user: useraction});
            result.forEach(  (e) =>{
                var flag = true;
                liked.forEach((a)=>{
                    
                    if((e['_id'].equals( a['post']))&&(flag==true)){
                         
                        e['liked'] = true;
                        flag==false;
                    }
                    
                });
                
            });
            }
        }catch(e){
            console.log(e)
        }
        
        
        
        return result;
    };
    async addPost(content, user, images, access) {

        try {
            const post = await postModel({ create_at: new Date(), content: content, image: images, user: user, access: access }).save();
            const populatedPost = await postModel.findById(post._id).populate({
                path: "user",
                select: "name email avatar"
            });
            return populatedPost;
        } catch (e) {
            return e;
        }
    };
    async likePost(user, idpost,tokennofi,nameuseraction,userrecei) {
        try {
            //check user have like?
            const check = await likeModel.findOne({ user: user, post: idpost }).exec();
            console.log(check);
            if (check === null) {
                //notification like
                //check like 
                const check = await notificationService.checkNotificationLike(user,idpost);
                console.log(check);
                if(check){
                    const getTokenNoti = await userService.getTokenNotification(userrecei);
                    console.log("token notification: " + getTokenNoti.token_notification);
                    const data = {
                        useraction:user,
                        userrecei:userrecei,
                        post:idpost,
                        type:"like",
                        create_at:new Date(),
                    }
                    await notificationService.addNotification(data);
                    if(getTokenNoti!="null"){
                    if(user!=userrecei){
                        const datatransfer = {
                            idpost:idpost
                        };
                        await fcm.pushNotification(getTokenNoti.token_notification,"Thông báo chattt",nameuseraction+" đã like bài viết bạn");
                    }
                    
                    
                    }
                    
                    
                }
                
                const result = await likeModel({ user: user, post: idpost, create_at: new Date() }).save();
                await postModel.updateOne({ _id: idpost }, { $inc: { like_count: 1 } }).exec();
                return "liked";
            } else {
                const result = await likeModel.deleteOne({ _id: check._id });
                await postModel.updateOne({ _id: idpost }, { $inc: { like_count: -1 } }).exec();
                return "unliked";
            }
        } catch (e) {
            console.log(e);
            return e;
        }
    }
    async checkLiked(user, idpost) {
        try {
            const check = await likeModel.findOne({ user: user, post: idpost });
            return check;
        } catch (e) {
            console.log(e);
        };
    }
    async getUserLiked(user) {
        try {
            const check = await likeModel.find({ user: user});
            return check;
        } catch (e) {
            console.log(e);
        };
    }
    async addComment(user,post,comment){
        const data={};
        if(user!=""){
            data['user']=user;
        }
        if(post!=""){
            data['post']=post;
        }
        data['comment'] = comment;
        data['create_at'] = new Date();
        data['reply'] = [];
        console.log(data);
        try {
            const result = await commentModel(data).save();
            var id = result['_id'];
            const comment = await commentModel.findOne({_id:id}).populate({
                path: "user",
                select: "name email avatar"
            })
            await postModel.updateOne({ _id: post }, { $inc: { comment_count: 1 } }).exec();
            
            return comment;
        } catch (e) {
            return e;
        };
    }
    async addRepplyComment(idcomment,user,post,comment){
        const data={};
        if(user!=""){
            data['user']= mongoose.Types.ObjectId.createFromHexString(user);
        }
        data['comment'] = comment;
        data['create_at'] = new Date();
        console.log(data);
        try {
            await postModel.updateOne({ _id: post }, { $inc: { comment_count: 1 } }).exec();
            await commentModel.updateOne({_id:idcomment},
                {
                $push:{reply:data}
            })
            const result  = await commentModel.findOne({_id:idcomment}).populate({
                path: "user",
                select: "name email avatar"
            }).populate({
                path: "reply.user",
                select: "name email avatar"
            });
            return result;
        } catch (e) {
            return e;
        };
    }
    async getAllCommentByIdPost(post){
        const filter = {
            "post":post
        };
        try{
            const result  = await commentModel.find(filter).populate({
                path: "user",
                select: "name email avatar"
            }).populate({
                path: "reply.user",
                select: "name email avatar"
            });
            return result;
        }catch(e){
            return e;
        }
    }
    async deletePost(idpost){
       const result =  await postModel.deleteOne({_id:idpost});
       return result;
    }
    async updatePost(idpost,titlepost,images,access){
        console.log(idpost,titlepost,images,access)
        const result = await postModel.findOneAndUpdate({_id:idpost},{
            image:images,
            content:titlepost,
            access:access
        })
        return result;
    }
    async countLikePost(idpost){
        return await likeModel.countDocuments({post:idpost}).then(e=>{
            return e;
        }).catch(e=>{
            return false;
        })
    }
}
module.exports = new postService();
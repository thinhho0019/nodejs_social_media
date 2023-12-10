const postService = require('../services/postService')
const userService = require('../services/userService')
const notificationService = require("../services/notificationService")
const fs = require('fs');
const { post } = require('../routes/reportRoute');
const postController = {
    getPost : async (req,res)=>{
        const {user} = req.query;
        res.status(200).send(await postService.getAllPost(user));
    },
    getAllPostByUserId: async (req,res)=>{
        const {user,useraction} = req.query;
        console.log(useraction);
        res.status(200).send(await postService.getAllPostByUserId(user,useraction));
    },
    addPost : async (req,res)=>{
        const{content,user} = req.body;
        await postService.addPost(content,user).then((value)=>{
            res.status(200).send(value);
        }).catch((e)=>{
            res.status(500).send(value);
        });
        
    },
    addImage: async (req,res)=>{
        var images = [];
        const {content,access,user} = req.body;
        req.files.forEach(element => {
            var type;
            console.log(element);
            var detailName = element['originalname'].split(".");
            if(detailName[detailName.length-1]=="mp4"){
                type = "video";
            }else{
                type = "image";
            }
            
            const image = {
                'image_url':"./public/images/post/"+element['originalname'],
                'size_image':element['size'],
                'type_media': type,
            };
            images.push(image);
        });
      
        console.log(images);
        await postService.addPost(content,user,images,access).catch(
            (e)=>{
                res.status(500).send("upload file no success");
            }
        ).then(e=>{
            console.log(e);
            res.status(200).send(e);
        });
       
    },
    likePost: async (req,res)=>{
        const {user,idpost,userrecei,tokennofi,nameuser} = req.body;
        await postService.likePost(user,idpost,tokennofi,nameuser,userrecei).then(
            (result)=>{
                //push notification
                 
                res.status(200).send(result);
            }
        ).catch(
            (e)=>{
                res.status(500).send(e);
            }
        );
         

    },
    checkLikedController: async (req,res)=>{
        const {user,idpost} = req.body;
        await postService.checkLiked(user,idpost).then(
            (result)=>{
                if(result!=null){
                    res.status(200).send(true);
                }else{
                    res.status(200).send(false);
                }
                
            }
        ).catch(
            (e)=>{
                res.status(500).send(e);
            }
        );
    },
    addCommentController : async (req,res)=>{
        
        const {user,post,comment,usernameaction,userrecei} = req.body;
        console.log(user,post,comment,usernameaction,userrecei)
        await postService.addComment(user,post,comment,usernameaction,userrecei).then(
            (value)=>{
                // if(value=="error"){
                //     res.status(500).send(value);
                // }else{
                //     res.status(200).send(value);
                // }
                res.status(200).send(value);
            }
        ).catch((e)=>{
            console.log(e)
            res.status(500).send(e);
        });
    },
    addReplyCommentController : async (req,res)=>{
        
        const {idcomment,user,post,comment,usernameaction,userrecei} = req.body;
        await postService.addRepplyComment(idcomment,user,post,comment,usernameaction,userrecei).then(
            (value)=>{
                res.status(200).send(value);
            }
        ).catch((e)=>{
    
            res.status(500).send(e);
        });
    },
    getAllCommentController :  async (req,res)=>{
        const {post} = req.query;
        await postService.getAllCommentByIdPost(post).then(
            (value)=>{
                res.status(200).send(value);
            }
        ).catch((e)=>{
            res.status(500).send(e);
        });
    },
    deletePost : async (req,res)=>{
        const idpost = req.body.idpost;
        const listImage = req.body.listImage; 
        listImage.forEach((e)=>{
            if (e) {
                console.log(e);
                fs.unlink(e, (err) => {
                  if (err) console.log(err);
                });
              }
        });
        console.log(listImage);
        await postService.deletePost(idpost).then(e=>{
            
            if(e['deletedCount']>0){
                res.status(200).send(true);
            }else{
                res.status(200).send(false);
            }
            
        }).catch(e=>{
            res.status(500).send(e);
        })
    },
    getAllImagePost: async (req,res)=>{
        const id = req.body.id;
        await postService.getAllImagePost(id).then(e=>{
            res.status(200).json(e);
        })
    },
    updatePost: async (req,res)=>{
        const idpost = req.body.idpost;
        const titlepost = req.body.titlepost;
        const access = req.body.access;
        const images = [];
        const imageold = req.body.imageold;
        imageold.forEach((e)=>{
            if (e) {
                console.log(e);
                fs.unlink(e, (err) => {
                  if (err) console.log(err);
                });
              }
        });
        req.files.forEach(element => {
            var type;
            console.log(element);
            var detailName = element['originalname'].split(".");
            if(detailName[detailName.length-1]=="mp4"){
                type = "video";
            }else{
                type = "image";
            }
            const image ={
                'image_url':"./public/images/post/"+element['originalname'],
                'size_image':element['size'],
                'type_media': type,
            };
            images.push(image);
        });
         
        
        await postService.updatePost(idpost,titlepost,images,access).then(
            e=>{
                
                    res.status(200).send(images);
            }
        ).catch(e=>{
            res.status(500).send(e);
        });
    },
    updateCountLike:async (req,res)=>{
        const idpost = req.body.idpost;
        const result = await postService.countLikePost(idpost);
        res.status(200).json(result);
    },
    getAllUserLikePost:async (req,res)=>{
        const idpost = req.body.idpost;
        const result = await postService.getAllUserLikePost(idpost);
        res.status(200).json(result);
    }
}
module.exports = postController;
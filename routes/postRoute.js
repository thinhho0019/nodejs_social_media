const express = require('express');

const postController = require("../controller/postController");
const bodyParser= require('body-parser');
const multer = require('multer');
 
const route = express.Router();
route.use(express.json());
route.use(bodyParser.urlencoded({extended: true}))
route.use(express.urlencoded({extended:true}));
// SET STORAGE
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/images/post/')
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname )
    }
  })
var upload = multer({ storage: storage})
let uploadMulti = upload.array('fileimage',6);
route.get('/getallpost',postController.getPost);
route.get('/getallpostbyuserid',postController.getAllPostByUserId);
route.post('/addpost',postController.addPost);
route.post('/updatepost',uploadMulti,postController.updatePost);
route.post('/deletepost',postController.deletePost);
route.post('/uploadimage',uploadMulti,postController.addImage);
route.post('/likepost',postController.likePost);
route.post('/checkliked',postController.checkLikedController);
route.post('/addcomment',postController.addCommentController);
route.post('/addreplycomment',postController.addReplyCommentController);
route.get('/getcommentbyid',postController.getAllCommentController);
route.post('/getcountlikepost',postController.updateCountLike);
route.post('/getallimagepost',postController.getAllImagePost);
route.post('/getalluserlikepost',postController.getAllUserLikePost);
module.exports = route;
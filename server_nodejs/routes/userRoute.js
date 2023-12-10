const express = require('express');
const userController = require("../controller/userController");
const user_route = express.Router();
const multer = require('multer');
user_route.use(express.json());

user_route.use(express.urlencoded({extended:true}));
var storageAvatar = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/images/avatar/')
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
  })
  var uploadAvatar = multer({ storage: storageAvatar})
  let uploadSingleAvatar = uploadAvatar.single('image');
  //
  var storageBackground = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/images/background/')
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
  })
  var uploadBackground = multer({ storage: storageBackground})
  let uploadSingleBackground = uploadBackground.single('image');
user_route.post('/uploadimageavatar',uploadSingleAvatar,userController.uploadImageAvatar);
user_route.post('/uploadimagebackground',uploadSingleBackground,userController.uploadImageBackground);
user_route.post('/signingoogle',userController.login);
user_route.post('/logout',userController.logOutUser);
user_route.post('/getinformationuser',userController.getInformationUser);
user_route.get('/getalluser',userController.findUser);
user_route.post('/waitfriends',userController.waitFriends);
user_route.post('/acceptfriends',userController.acceptFriends);
user_route.post('/cancelfriends',userController.cancelFriends);
user_route.get('/getAllUserWaitAccept',userController.getAllUserWaitAccept);
user_route.get('/getMyFriends',userController.getAllMyFriends);
user_route.get('/getAllSentAddFriends',userController.getAllUserSentAddFriend);
user_route.get('/getStatusOnlineUser',userController.getStatusOnlineUser);
user_route.post('/checkreplateuser',userController.checkRelatetionFriends);
user_route.post('/updateprofile',userController.updateProfile);
user_route.post('/gettokennotification',userController.getTokenNotification);
user_route.post('/updatenameuser',userController.updateNameUser);
user_route.post('/updateuserpassword',userController.updateUserPasswordForAccount);
user_route.post('/getcheckemailpassword',userController.getCheckEmailPassword);
user_route.post('/loginemailpassword',userController.loginEmailPassword);
module.exports = user_route;


const express = require('express');
const notificationController  = require('../controller/notificationcController');
 
const route = express.Router();
route.use(express.json());
route.use(express.urlencoded({extended:true}));
route.post('/getnotification',notificationController.getAllNotificationUserID);
route.post('/seennotification',notificationController.seenNotification);
module.exports = route;
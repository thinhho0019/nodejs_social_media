var admin = require("firebase-admin");
const FCM = require('fcm-node');
var serviceAccount = require("../config/serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const certPath = admin.credential.cert(serviceAccount);
 
const fcm = new FCM(certPath);

exports.pushNotification = (token,title,body)=>{
    const message = {
        to: token,
        notification: {
          title: title,
          body: body
        },
      };
    console.log("message: "+token);
    fcm.send(message, (err, response) => {
        if (err) {
          console.log('Lỗi gửi thông báo:', err);
        } else {
          console.log('Thông báo đã được gửi thành công:', response);
        }
      });
}
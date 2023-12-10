

const mongoose = require('../utils/connectDB');

const notificationSchema = new mongoose.Schema({
    useraction: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    userrecei: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    post:{ type: mongoose.Schema.Types.ObjectId, ref: "Post", sparse: true},
    content:{type: String,
        default:"null"},
    type: {
        type: String,
        require:true
    },
    create_at: {
        type: Date, default: new Date()
    },
    seen:{
        type: String, default:"false"
    },
  
}
);
const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;
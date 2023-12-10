const mongoose = require('../utils/connectDB');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    username:{
        type: String,
        default:"null"
    },
    password:{
        type: String,
        default:"null"
    }
    ,
    avatar: {
        type: String,
        required: true
    }
    ,
    create_at: {
        type: Date, default: new Date()
    }
    ,
    is_online: {
        type: String,
        default: '0'
    },
    log_out: {
        type: String,
        default: '0'
    },
    last_online:{
        type: Date, default: new Date()
    },
    google_id: {
        type: String,
        default: 'null'
    },
    token_notification: {
        type: String,
        default: 'null' 
    },
    access_token_current: {
        type: String,
        default: 'null'
    },
    friends: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    wait_friends: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
    }],
    user_detail: { type: mongoose.Schema.Types.ObjectId, ref: "UserDetail" },
    role:{
        type:String,
        enum:['user','admin'],
        default:'user'
    }
}
);
const User = mongoose.model('User', userSchema);
module.exports = User;
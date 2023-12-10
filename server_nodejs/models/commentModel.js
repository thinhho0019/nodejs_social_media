const mongoose = require('../utils/connectDB');
const commentSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    post:{ type: mongoose.Schema.Types.ObjectId, ref: "Post" },
    comment:{type:String,required: true},
    reply: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        comment: { type: String, required: true },
        create_at: { type: Date, default: new Date() }
      }],
    create_at:{type: Date, default: new Date()},
}
);
const Comment = mongoose.model('Comment', commentSchema);
module.exports = Comment;

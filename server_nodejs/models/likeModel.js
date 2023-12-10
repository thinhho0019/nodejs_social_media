



const mongoose = require('../utils/connectDB');

const likeSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    post:{ type: mongoose.Schema.Types.ObjectId, ref: "Post" },
    create_at:{type: Date, default: new Date()},
}
);
const Like = mongoose.model('Like', likeSchema);
module.exports = Like;
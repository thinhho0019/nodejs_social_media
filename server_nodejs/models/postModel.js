

const mongoose = require('../utils/connectDB');

const postSchema = new mongoose.Schema({
    content: {
        type: String,
        default: 'null'
    },
    like_count: {
        type: Number,
        default: 0
    },
    comment_count: {
        type: Number,
        default: 0
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    create_at: {
        type: Date, default: new Date()
    },
    access :{
        type:String,
        enum:['private','friend','public'],
        default:'public'
    },
    image:[{
        image_url:String,
        size_image:String,
    }]
}
);
const Post = mongoose.model('Post', postSchema);
module.exports = Post;
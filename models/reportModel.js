



const mongoose = require('../utils/connectDB');

const reportSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    post:{ type: mongoose.Schema.Types.ObjectId, ref: "Post", sparse: true},
    content: {
        type: String,
        default:"null"
    },
    create_at: {
        type: Date, default: new Date()
    },
    state:{
         
            type:String,
            enum:['wait','done'],
            default:'wait'
        
    }
}
);
const Report = mongoose.model('Report', reportSchema);
module.exports = Report;
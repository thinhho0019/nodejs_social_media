const mongoose = require('../utils/connectDB');

const userDetailSchema = new mongoose.Schema({
    bio: {
        type: String,
        default:"null"
    },
    address_from: {
        type: String,
        default:"null"
    }
    ,
    job: {
        type: String,
        default:"null"
    },
    address_live: {
        type: String,
        default:"null"
    }
    ,
    birthday: {
        type: Date, default: new Date()
    }
    ,
    studying: {
        type: String,
        default: 'null'
    },
    
    background_image: {
        type: String,
        default: 'https://antimatter.vn/wp-content/uploads/2022/05/background-anime.jpg'
    }
   
}
);
const UserDetail = mongoose.model('UserDetail', userDetailSchema);
module.exports = UserDetail;
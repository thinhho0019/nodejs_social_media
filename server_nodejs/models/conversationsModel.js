const mongoose =require('../utils/connectDB');

const conversasionSchema = new  mongoose.Schema({
  members: [{type:mongoose.Schema.Types.ObjectId,ref:"User"}],
  messages: [{
    sender: mongoose.Schema.Types.ObjectId,
    text: String,
    status : {type:String,enum:['sent,received,seen'],default:'sent'}, 
    created_at: { type: Date, default: new Date() }
  }],
  created_at: { type: Date, default: new Date() },
  updated_at: { type: Date, default: new Date() }
}
)
const Conversasion =mongoose.model('Conversasion',conversasionSchema)
module.exports = Conversasion
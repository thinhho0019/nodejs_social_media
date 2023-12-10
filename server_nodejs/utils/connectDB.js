var mongoose = require('mongoose');
mongoose.connect(process.env.MONGOOSE_URL,{
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
    .then(() => console.log('Connected to MongoDB'))

module.exports = mongoose;
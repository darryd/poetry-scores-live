var mongoose = require('mongoose');
var localDbString = 'mongodb://localhost:27017/livescores';
var url = process.env.MONGODB_URI || localDbString;

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);



mongoose.connect(url, {useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
  console.log('Connected to database.')
}).catch((error: any) => {
   //assert.isNotOk(error,'Promise error');
   //notify('error', error)
 });

module.exports.mongoose = mongoose;

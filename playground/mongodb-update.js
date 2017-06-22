//const MongoClient = require('mongodb').MongoClient;
const {MongoClient,ObjectID} = require('mongodb');

var user = {name:'Luis',age:27};
var {name} = user;
console.log(name);

MongoClient.connect('mongodb://localhost:27017/TodoApp',(err,db)=>{
  if (err) {
    console.log('Unable to connect to MongoDB Server');
    return;
  }
  console.log('Connected to MongoDB server');

  db.collection('Users').findOneAndUpdate({
    _id:new ObjectID('5949ef95c071678c01965250')
  },{
    $set: {
      name:'Michel'
    },
    $inc:{
      age:1
    }
  },{
    returnOriginal:false
  }).then((result)=>{
    console.log(result);
  });

  //db.close();
});

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

  // deleteMany
  // db.collection('Users').deleteMany({name:'Michel'}).then((result)=>{
  //   console.log(result);
  // });

  // deleteOne
  // db.collection('Todos').deleteOne({text:'Eat lunch'}).then((result)=>{
  //   console.log(result);
  // });

  //findOneAndDelete
  db.collection('Users').findOneAndDelete({_id: new ObjectID('5949f97203a6868c2e82fd3f')}).then((result)=>{
    console.log(result);
  });

  //db.close();
});

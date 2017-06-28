const {ObjectID} = require('mongodb');

const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require('./../server/models/todo');
const {User} = require('./../server/models/user');

Todo.remove({}).then((result)=>{
  console.log(result);
});

// Todo.findOneAndRemove()
// Todo.findByIdAndRemove

Todo.findByIdAndRemove({_id:'59532cdfaac61fb8eecfd620'}).then((todo)=>{
  console.log(todo);
});

Todo.findByIdAndRemove('59532cdfaac61fb8eecfd620').then((todo)=>{
  console.log(todo);
});

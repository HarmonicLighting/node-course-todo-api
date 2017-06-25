const {ObjectID} = require('mongodb');

const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require('./../server/models/todo');
const {User} = require('./../server/models/user');

// var id = '595016fc35dae399d11634081';
//
// if (!ObjectID.isValid(id)){
//   console.log('Id is not valid');
// }
//
// Todo.find({
//   _id: id
// }).then((todos)=>{
//   console.log('Todos',todos);
// });
//
// Todo.findOne({
//   _id: id
// }).then((todo)=>{
//   console.log('Todo',todo);
// });
//
// Todo.findById(id).then((todo)=>{
//   if (!todo) {
//     return console.log('Id not found.');
//   }
//   console.log('Todo by Id',todo);
// }).catch((e)=>{
//   console.log(e);
// });

User.findById('594c5bf6fc1cce937d67c644').then((user)=>{
  if (!user) {
    return console.log('User Id not found');
  }
  console.log('User by Id',user);
},(e)=>{
  console.log(e);
}).catch((e)=>console.log(e));

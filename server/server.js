require('./config/config');

const PORT = process.env.PORT;

const _ = require('lodash');

const express = require('express');
const bodyParser = require('body-parser');

const {ObjectID} = require('mongodb');
var {mongoose} = require('./db/mongoose');

var {Todo} = require('./models/todo');
var {User} = require('./models/user');
var {authenticate} = require('./middleware/authenticate');

var app = express();
app.use(bodyParser.json());

app.post('/todos',(req,res)=>{

  var todo = new Todo({
    text:req.body.text
  });

  todo.save().then((doc)=>{
    res.send(doc);
  },(e)=>{
    res.status(400).send(e);
  });
});

app.get('/todos',(req,res)=>{
  Todo.find().then((todos)=>{
    res.send({todos});
  },(e)=>{
    res.status(400).send(e);
  });
});

//GET /todos/1234123465dfsda
app.get('/todos/:id',(req,res)=>{
  var id = req.params.id;

  //Valid id using isValid
    //if not 404 - send back empty send

  if(!ObjectID.isValid(id)){
    //console.log('Not valid');
    return res.status(404).send();
  }
  Todo.findById(id).then((todo)=>{
    if (!todo) {
      //console.log('Id '+id+' not found.');
      return res.status(404).send();
    }
    //console.log('Id '+id+' found!');
    res.send({todo});
  }).catch((e)=>{
    console.log('Error encountered');
    res.status(400).send();
  });
});

app.delete('/todos/:id',(req,res)=>{
  // get the Id
  var id = req.params.id;


  // validate the id -> not valid? return 404
  if(!ObjectID.isValid(id)){
    //console.log('Not valid');
    return res.status(404).send();
  }
  Todo.findByIdAndRemove(id).then((todo)=>{
    if (!todo) {
      //console.log('Id '+id+' not found.');
      return res.status(404).send();
    }
    //console.log('Id '+id+' found!');
    res.send({todo});
  }).catch((e)=>{
    console.log('Error encountered while removing '+ id);
    res.status(400).send();
  });

});

app.patch('/todos/:id',(req,res)=>{
  const id = req.params.id;
  var body = _.pick(req.body,['text','completed']);

  if (!ObjectID.isValid(id)) {
    return res.status(400).send();
  }

  if (_.isBoolean(body.completed) && body.completed) {
    body.completedAt = new Date().getTime();
  }else {
    body.completed = false;
    body.completedAt = null;
  }

  Todo.findByIdAndUpdate(id,{$set:body},{new: true}).then((todo)=>{
    if (!todo) {
      return res.status(404).send();
    }

    res.send({todo});
  }).catch((e)=>res.status(400).send());
});

// POST /users

app.post('/users',(req,res)=>{
  var body = _.pick(req.body,['email','password']);
  var user = new User(body);

  user.save().then((user)=>{
    return user.generateAuthToken();
  }).then((token) => {
    res.header('x-auth',token).send(user);
  }).catch((e)=>{
    res.status(400).send(e);
  });
});

app.post('/users/login',(req,res)=>{
  var body = _.pick(req.body,['email','password']);
  console.log('Email', body.email);
  console.log('Pass', body.password);
  if (!body.email || !body.password){
    console.log('Error. Email or password not given.');
    return res.status(400).send();
  }

  User.findByCredentials(body.email,body.password).then((user)=>{
    console.log('User '+body.email+' Authenticated!');
    return user.generateAuthToken().then((token) => {
      res.header('x-auth',token).send(user);
    });
  }).catch((e)=>{
    res.status(400).send();
  });

});

app.get('/users/me',authenticate,(req,res)=>{
  res.send(req.user);
});

app.listen(PORT,()=>{
  console.log('Started on port',PORT);
});

module.exports = {app};

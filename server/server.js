const PORT = process.env.PORT || 3000;

var express = require('express');
var bodyParser = require('body-parser');

const {ObjectID} = require('mongodb');
var {mongoose} = require('./db/mongoose');

var {Todo} = require('./models/todo');
var {User} = require('./models/user');

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
    res.send(todo);
  }).catch((e)=>{
    console.log('Error encountered while removing '+ id);
    res.status(400).send();
  });

});

app.listen(PORT,()=>{
  console.log('Started on port',PORT);
});

module.exports = {app};

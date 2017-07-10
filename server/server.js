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

// Add headers
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, content-type, x-auth');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Request headers you wish to allow to be exposed
    res.setHeader('Access-Control-Expose-Headers', 'x-auth');

    // Pass to next layer of middleware
    next();
});

app.post('/todos',authenticate, async (req,res) => {

  var todo = new Todo({
    text:req.body.text,
    _creator: req.user._id
  });

  try {
    const doc = await todo.save();
    res.send(doc);
  } catch (e) {
    res.status(400).send(e);
  }
});

app.get('/todos',authenticate, async (req,res) => {

  try {
    const todos = await Todo.find({
      _creator: req.user._id
    });
    res.send({todos});
  } catch (e) {
    res.status(400).send(e);
  }
});

//GET /todos/1234123465dfsda
app.get('/todos/:id', authenticate, async (req,res) => {
  var id = req.params.id;

  //Valid id using isValid
    //if not 404 - send back empty send

  if(!ObjectID.isValid(id)){
    //console.log('Not valid');
    return res.status(404).send();
  }

  try {
    const todo = await Todo.findOne({
      _id: id,
      _creator: req.user._id
    });
    if (!todo) {
      return res.status(404).send();
    }
    res.send({todo});
  } catch (e) {
    res.status(400).send();
  }
});

app.delete('/todos/:id', authenticate, async (req,res) => {
  // get the Id
  var id = req.params.id;


  // validate the id -> not valid? return 404
  if(!ObjectID.isValid(id)){
    //console.log('Not valid');
    return res.status(404).send();
  }

  try {
    const todo = await Todo.findOneAndRemove({
      _id: id,
      _creator: req.user._id
    });
    if (!todo) {
      return res.status(404).send();
    }
    res.send({todo});
  } catch (e) {
    res.status(400).send();
  }
});

app.patch('/todos/:id', authenticate, async (req,res) => {
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

  try {
    todo = await Todo.findOneAndUpdate({
      _id:id,
      _creator: req.user._id},
      {
        $set:body
      },
      {
        new: true
      });

      if (!todo) {
        return res.status(404).send();
      }

      res.send({todo});

  } catch (e) {
    res.status(400).send();
  }
});

// POST /users

app.post('/users', async (req,res) => {

  var body = _.pick(req.body,['email','password']);
  var user = new User(body);

  try {
    user = await user.save();
    const token = await user.generateAuthToken();
    res.header('x-auth',token).send(user);
  } catch (e) {
    res.status(400).send(e);
  }
});

app.get('/users/me',authenticate, (req,res) => {
  res.send(req.user);
});

app.post('/users/login', async (req,res) => {
  const body = _.pick(req.body,['email','password']);

  if (!body.email || !body.password){
    return res.status(400).send();
  }

  try {
    const user = await User.findByCredentials(body.email,body.password);
    const token = await user.generateAuthToken();
    res.header('x-auth',token)
    .send(user);
  } catch (e) {
    res.status(400).send();
  }
});

app.delete('/users/me/token', authenticate, async (req,res) => {
  try {
    await req.user.removeToken(req.token);
    res.status(200).send();
  } catch (e) {
    res.status(400).send();
  }
});

app.listen(PORT,()=>{
  console.log('Started on port',PORT);
});

module.exports = {app};

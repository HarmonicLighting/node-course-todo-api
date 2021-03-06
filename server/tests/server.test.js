const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');
const {User} = require('./../models/user');
const {todos,populateTodos, users, populateUsers} = require('./seed/seed');

beforeEach(populateUsers);
beforeEach(populateTodos);

describe('post /todos',()=>{
  it('Should create a new todo',(done)=>{
    var text = 'Text todo text';

    request(app)
      .post('/todos')
      .set('x-auth',users[0].tokens[0].token)
      .send({text})
      .expect(200)
      .expect((res)=>{
        expect(res.body.text).toBe(text);
      })
      .end((err,res)=>{
        if (err) {
          return done(err);
        }

        Todo.find({text}).then((todos)=>{
          expect(todos.length).toBe(1);
          expect(todos[0].text).toBe(text);
          done();
        }).catch((e)=>done(e));

      });
  });

  it('Should not create todo with invalid body data',(done)=>{

    request(app)
      .post('/todos')
      .set('x-auth',users[0].tokens[0].token)
      .send({})
      .expect(400)
      .end((err,res)=>{
        if (err) {
          return done(err);
        }

        Todo.find().then((todos)=>{
          expect(todos.length).toBe(2);
          done();
        }).catch((e)=>done(e));

      });
  });

});

describe('GET /todos',()=>{
  it('Should get all todos',(done)=>{
    request(app)
      .get('/todos')
      .set('x-auth',users[0].tokens[0].token)
      .expect(200)
      .expect((res)=>{
        expect(res.body.todos.length).toBe(1);
      })
      .end(done);
  });
});

describe('GET /todos/:id',()=>{
  it('Should return todo doc',(done)=>{
    request(app)
      .get('/todos/'+todos[0]._id.toHexString())
      .set('x-auth',users[0].tokens[0].token)
      .expect(200)
      .expect((res)=>{
        expect(res.body.todo.text).toBe(todos[0].text)
      })
      .end(done);
  });

  it('Should return 404 if todo not found',(done)=>{
    //Make sure you get the 404 back
    request(app)
      .get('/todos/'+new ObjectID().toHexString())
      .set('x-auth',users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('Should return 404 for non-object ids',(done)=>{
    request(app)
      .get('/todos/'+new ObjectID().toHexString()+'0')
      .set('x-auth',users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('Shoud not return todo doc created by other user', (done) => {
    request(app)
      .get('/todos/'+todos[1]._id.toHexString())
      .set('x-auth',users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });

});

describe('PATCH /todos/:id',()=>{

  it("Should update todo's text attribute",(done)=>{
    var hexId = todos[0]._id.toHexString();
    const text = 'Updated text';

    request(app)
      .patch('/todos/' + hexId)
      .set('x-auth',users[0].tokens[0].token)
      .send({text})
      .expect(200)
      .expect((res)=>{
        expect(res.body.todo._id).toBe(hexId);
        expect(res.body.todo.text).toBe(text);
        expect(res.body.todo.completed).toBe(false);
        expect(res.body.todo.completedAt).toBe(null);
      })
      .end((err,res)=>{
        if(err){
          return done(err);
        }
        Todo.findById(hexId).then((todo)=>{
          expect(todo.text).toBe(text);
          expect(todo.completed).toBe(false);
          expect(todo.completedAt).toBe(null);
          done();
        }).catch((e) => done(e));
      });

  });

  it("Should not update a todo from a different user",(done)=>{
    var hexId = todos[0]._id.toHexString();
    const text = 'Updated text';

    request(app)
      .patch('/todos/' + hexId)
      .set('x-auth',users[1].tokens[0].token)
      .send({text})
      .expect(404)
      .end((err,res)=>{
        if(err){
          return done(err);
        }
        Todo.findById(hexId).then((todo)=>{
          expect(todo.text).toNotBe(text);
          done();
        }).catch((e) => done(e));
      });

  });

  it("Should update todo's completed attribute to true",(done)=>{
    var hexId = todos[0]._id.toHexString();
    const completed = true;

    request(app)
      .patch('/todos/' + hexId)
      .set('x-auth',users[0].tokens[0].token)
      .send({completed})
      .expect(200)
      .expect((res)=>{
        expect(res.body.todo._id).toBe(hexId);
        expect(res.body.todo.text).toBe(todos[0].text);
        expect(res.body.todo.completed).toBe(true);
        expect(res.body.todo.completedAt).toBeA('number');
      })
      .end((err,res)=>{
        if(err){
          return done(err);
        }
        Todo.findById(hexId).then((todo)=>{
          expect(todo.text).toBe(todos[0].text);
          expect(todo.completed).toBe(true);
          expect(todo.completedAt).toBeA('number');
          done();
        }).catch((e) => done(e));
      });

  });

  it("Should update todo's completed attribute to false",(done)=>{
    var hexId = todos[1]._id.toHexString();
    const completed = false;

    request(app)
      .patch('/todos/' + hexId)
      .set('x-auth',users[1].tokens[0].token)
      .send({completed})
      .expect(200)
      .expect((res)=>{
        expect(res.body.todo._id).toBe(hexId);
        expect(res.body.todo.text).toBe(todos[1].text);
        expect(res.body.todo.completed).toBe(false);
        expect(res.body.todo.completedAt).toBe(null);
      })
      .end((err,res)=>{
        if(err){
          return done(err);
        }
        Todo.findById(hexId).then((todo)=>{
          expect(todo.text).toBe(todos[1].text);
          expect(todo.completed).toBe(false);
          expect(todo.completedAt).toBe(null);
          done();
        }).catch((e) => done(e));
      });

  });

  it('Should return 404 if todo not found',(done)=>{
    //Make sure you get the 404 back
    request(app)
      .patch('/todos/'+new ObjectID().toHexString())
      .set('x-auth',users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('Should return 400 for non-object id\'s',(done)=>{
    request(app)
      .patch('/todos/'+new ObjectID().toHexString()+'0')
      .set('x-auth',users[0].tokens[0].token)
      .expect(400)
      .end(done);
  });

});

describe('DELETE /todos/:id',()=>{

  it('Should delete todo doc',(done)=>{
    const hexId = todos[1]._id.toHexString();
    request(app)
      .delete('/todos/'+ hexId)
      .set('x-auth', users[1].tokens[0].token)
      .expect(200)
      .expect((res)=>{
        expect(res.body.todo._id).toBe(hexId);
      })
      .end((err,res)=>{
        if(err){
          return done(err);
        }

        Todo.findById(hexId).then((todo)=>{
          expect(todo).toNotExist();
          done();
        }).catch((e) => done(e));
      });
  });

  it('Should not delete todo doc belonging to another user',(done)=>{
    const hexId = todos[0]._id.toHexString();
    request(app)
      .delete('/todos/'+ hexId)
      .set('x-auth', users[1].tokens[0].token)
      .expect(404)
      .end((err,res)=>{
        if(err){
          return done(err);
        }

        Todo.findById(hexId).then((todo)=>{
          expect(todo).toExist();
          done();
        }).catch((e) => done(e));
      });
  });

  it('Should return 404 if todo not found',(done)=>{
    //Make sure you get the 404 back
    request(app)
      .delete('/todos/'+new ObjectID().toHexString())
      .set('x-auth', users[1].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('Should return 404 for non-object id\'s',(done)=>{
    request(app)
      .delete('/todos/'+new ObjectID().toHexString()+'0')
      .set('x-auth', users[1].tokens[0].token)
      .expect(404)
      .end(done);
  });
});

describe('GET /users/me', () => {
  it('Should return user if authenticated', (done) => {
    request(app)
      .get('/users/me')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body._id).toBe(users[0]._id.toHexString());
        expect(res.body.email).toBe(users[0].email);
      }).end(done);
  });

  it('Should return 401 if not authenticated', (done) => {
    request(app)
      .get('/users/me')
      //.set('x-auth', users[0].tokens[0].token)
      .expect(401)
      .expect((res) => {
        expect(res.body).toEqual({});
      }).end(done);
  });
});

describe('POST /users', () => {
  it('Should create an user', (done) => {
    const email = 'example@example.com';
    const password = '123zxc';

    request(app)
      .post('/users')
      .send({email,password})
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-auth']).toExist();
        expect(res.body._id).toExist();
        expect(res.body.email).toBe(email);
      }).end((err) => {
        if (err) {
          return done(err);
        }

        User.findOne({email}).then((user) => {
          expect(user).toExist();
          expect(user.password).toNotBe(password);
          done();
        }).catch((e) => done(e));
      });
  });

  it('Should return validation errors if request has invalid email', (done) => {
    const email = 'aninvalidemailexample.com';
    const password = '123zxc';

    request(app)
      .post('/users')
      .send({email,password})
      .expect(400)
      .end((err) => {
        if (err) {
          return done(err);
        }

        User.findOne({email}).then((user) => {
          expect(user).toNotExist();
          done();
        });
      });
  });

  it('Should return validation errors if email is already registered', (done) => {
    const _id = users[0]._id;
    const email = users[0].email;
    const password = '123zxc';

    request(app)
      .post('/users')
      .send({email,password})
      .expect(400)
      .end((err) => {
        if (err) {
          return done(err);
        }

        User.findOne({_id}).then((user) => {
          expect(user).toExist();
          done();
        });
      });
  });

  it('Should return validation errors if request has invalid passoword', (done) => {
    const email = 'example@example.com';
    const password = 'inval';

    request(app)
      .post('/users')
      .send({email,password})
      .expect(400)
      .end((err) => {
        if (err) {
          return done(err);
        }

        User.findOne({email}).then((user) => {
          expect(user).toNotExist();
          done();
        });
      });
  });

});

describe('POST /users/login', () => {
  it('Should login user and return auth token', (done) => {
    request(app)
      .post('/users/login')
      .send({
        email: users[1].email,
        password: users[1].password
      })
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-auth']).toExist();
      })
      .end((err,res) => {
        if (err) {
          return done(err);
        }

        User.findById(users[1]._id).then((user) => {
          expect(user.tokens[1]).toInclude({
            access: 'auth',
            token: res.headers['x-auth']
          });
          done();
        }).catch((e) => done(e));
      });
  });

  it('Should reject invalid login', (done) => {
    request(app)
      .post('/users/login')
      .send({
        email: users[1].email,
        password: users[1].password + '1'
      })
      .expect(400)
      .expect((res) => {
        expect(res.headers['x-auth']).toNotExist();
      })
      .end((err,res) => {
        if (err) {
          return done(err);
        }

        User.findById(users[1]._id).then((user) => {
          expect(user.tokens.length).toBe(1);
          done();
        }).catch((e) => done(e));
      });
  });
});

describe('DELETE /users/me/token', () => {
  it('Should remove auth token on logout', (done) => {
    // DELETE /users/me/token
    // Set x-auth equal to token
    // 200
    // Find user, verify that tokens array has length of zero
    request(app)
      .delete('/users/me/token')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .end((err,res) => {
        if (err) {
          return done(err);
        }

        User.findById(users[0]._id).then((user) => {
          expect(user.tokens.length).toBe(0);
          done();
        }).catch((e) => done(e));
      })
  })
});

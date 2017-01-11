const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');
const {app} = require('./../server');
const {Todo} = require('./../models/todo');
const {User} = require('./../models/user');
const {dummyTodos, populateTodos, dummyUsers, populateUsers} = require('./seeds/seed');

beforeEach(populateUsers);
beforeEach(populateTodos);

describe('POST /todos', () => {
  it('should post a new todo', (done) => {
    let text = 'this is a test';

    request(app)
      .post('/todos')
      .set('x-auth', dummyUsers[0].tokens[0].token)
      .send({text})
      .expect(200)
      .expect((res) => {
        expect(res.body.text).toBe(text);
      })
      .end((err) => {
        if (err) {
          return done(err);
        }

        Todo.find({text}).then((todos) => {
          expect(todos.length).toBe(1);
          expect(todos[0].text).toBe(text);
          done();
        }).catch((e) => done(e));
    });
  });

  it('should not create a new todo when sending empty body data', (done) => {
    request(app)
      .post('/todos')
      .set('x-auth', dummyUsers[0].tokens[0].token)
      .send({})
      .expect(400)
      .end((err) => {
        if (err) {
          return done(err);
        }

        Todo.find().then((todos) => {
          expect(todos.length).toBe(3);
          done();
        }).catch((e) => done(e));
    });
  });
});

describe('GET /todos', () => {
  it('should get all todos', (done) => {
    request(app)
      .get('/todos')
      .set('x-auth', dummyUsers[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.todos.length).toBe(2);
      })
      .end(done);
  });
});

describe('GET /users/:id', () => {
  it('should get one specific todo', (done) => {
    request(app)
      .get(`/todos/${dummyTodos[1]._id}`)
      .set('x-auth', dummyUsers[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(dummyTodos[1].text);
      })
      .end(done);
  });

  it('should not return todo of another user', (done) => {
    request(app)
      .get(`/todos/${dummyTodos[2]._id}`)
      .set('x-auth', dummyUsers[0].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('should return a 404 if todo is not found', (done) => {
    let newId = new ObjectID;
    request(app)
      .get(`/todos/${newId}`)
      .set('x-auth', dummyUsers[0].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('should return a 404 if id is invalid', (done) => {
    request(app)
      .get(`/todos/42`)
      .set('x-auth', dummyUsers[0].tokens[0].token)
      .expect(404)
      .end(done);
  });
});

describe('DELETE /todos/:id', () => {
  it('should delete todo by id', (done) => {
    let deleteId = dummyTodos[0]._id.toHexString();
    request(app)
      .delete(`/todos/${deleteId}`)
      .set('x-auth', dummyUsers[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo._id).toBe(deleteId);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.findById(deleteId).then((todo) => {
          expect(todo).toNotExist();
          done();
        }).catch((e) => done(e));
    });
  });

  it('should return 404 is todo not found', (done) => {
    let newThing = new ObjectID;

    request(app)
      .delete(`/todos/${newThing}`)
      .set('x-auth', dummyUsers[0].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('should return 404 is todo has invalid id', (done) => {
    request(app)
      .delete('/todos/42')
      .set('x-auth', dummyUsers[0].tokens[0].token)
      .expect(404)
      .end(done);
  });
});

describe('UPDATE /todos/:id', () => {
  it('should update todo by id', (done) => {
    let id = dummyTodos[2]._id;
    let text = 'this is changed';

    request(app)
      .patch(`/todos/${id}`)
      .set('x-auth', dummyUsers[1].tokens[0].token)
      .send({
        completed: true,
        text: text
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(text);
        expect(res.body.todo.completed).toBe(true);
        expect(res.body.todo.completedAt).toBeA('number');
      })
      .end(done)
  });

  it('should change completed from false to true and update completedAt', (done) => {
    let id = dummyTodos[2]._id.toHexString();
    request(app)
      .patch(`/todos/${id}`)
      .set('x-auth', dummyUsers[1].tokens[0].token)
      .send({completed: true})
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.completed).toBe(true);
        expect(res.body.todo.completedAt).toBeA('number');
      })
      .end(done);
  });

  it('should changed completed property from true to false and change completedAt to null', (done) => {
    let id = dummyTodos[0]._id.toHexString();
    request(app)
      .patch(`/todos/${id}`)
      .set('x-auth', dummyUsers[0].tokens[0].token)
      .send({completed: false})
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.completed).toBe(false);
        expect(res.body.todo.completedAt).toBe(null);
      })
      .end(done);
  });
});

describe('authentication checks', () => {
  it('should return user if authenticated', (done) => {
    request(app)
      .get('/users/auth')
      .set('x-auth', dummyUsers[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body._id).toBe(dummyUsers[0]._id.toHexString());
        expect(res.body.email).toBe(dummyUsers[0].email);
      })
      .end(done);
  });

  it('should 401 if unauthenticated', (done) => {
    request(app)
      .get('/users/auth')
      .expect(401)
      .expect((res) => {
        expect(res.body).toEqual({});
      })
      .end(done);
  });
});

describe('POST /users', () => {
  it('should create a new user', (done) => {
    let email = 'email@email.com';
    let password = 'password1';

    request(app)
      .post('/users')
      .send({email, password})
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-auth']).toExist();
        expect(res.body._id).toExist();
        expect(res.body.email).toBe(email);
      })
      .end(done);
  });

  it('should return validation error if request is invalid', (done) => {
    let email = 'email@email.com';
    let password = '1';

    request(app)
      .post('/users')
      .send({email, password})
      .expect(400)
      .end(done);
  });

  it('should not create user if email is already taken', (done) => {
    request(app)
      .post('/users')
      .send({email: dummyUsers[0].email, password: 'password1'})
      .expect(400)
      .end(done);
  });
});

describe('POST /users/login', () => {
  it('should login user and return auth token', (done) => {
    request(app)
      .post('/users/login')
      .send({email: dummyUsers[1].email, password: dummyUsers[1].password})
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-auth']).toExist();
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        User.findById(dummyUsers[1]._id).then((user) => {
          expect(user.tokens[1]).toInclude({
            access: 'auth',
            token: res.headers['x-auth']
          });
          done();
        }).catch((e) => done(e));
      });
  });

  it('should reject invalid login', (done) => {
    request(app)
      .post('/users/login')
      .send({email: dummyUsers[1].email, password: 'password'})
      .expect(400)
      .expect((res) => {
        expect(res.headers['x-auth']).toNotExist();
      })
      .end(done);
  });
});

describe('DELETE /users/auth/token', () => {
  it('should delete users auth token with they log out', (done) => {
    request(app)
      .delete('/users/auth/token')
      .set('x-auth', dummyUsers[0].tokens[0].token)
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        User.findById(dummyUsers[0]._id).then((user) => {
          expect(user.tokens.length).toBe(0);
          done();
        }).catch((e) => done(e));
      });
  });
});

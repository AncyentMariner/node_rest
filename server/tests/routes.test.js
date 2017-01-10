const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');
const {app} = require('./../server');
const {Todo} = require('./../models/todo');

const dummyTodos = [{_id: new ObjectID, text: 'eat something'},
{_id: new ObjectID, text: 'pet my cats'},
{_id: new ObjectID, text: 'pick my nose'}];

beforeEach((done) => {
  Todo.remove({}).then(() => {
    return Todo.insertMany(dummyTodos)
  }).then(() => done());
});

describe('POST /todos', () => {
  it('should post a new todo', (done) => {
    let text = 'this is a test';

    request(app)
      .post('/todos')
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
      .expect(200)
      .expect((res) => {
        expect(res.body.todos.length).toBe(3);
      })
      .end(done);
  });

  it('should get one specific todo', (done) => {
    request(app)
      .get(`/todos/${dummyTodos[1]._id}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(dummyTodos[1].text);
      })
      .end(done);
  });

  it('should return a 404 if todo is not found', (done) => {
    let newId = new ObjectID;
    request(app)
      .get(`/todos/${newId}`)
      .expect(404)
      .end(done);
  });

  it('should return a 404 if id is invalid', (done) => {
    request(app)
      .get(`/todos/42`)
      .expect(404)
      .end(done);
  });
});

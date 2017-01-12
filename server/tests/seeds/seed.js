const {ObjectID} = require('mongodb');
const jwt = require('jsonwebtoken');
const {Todo} = require('./../../models/todo');
const {User} = require('./../../models/user');
const secret = process.env.JWT_SECRET;

const userOneId = new ObjectID();
const userTwoId = new ObjectID();

let dummyUsers = [{
  _id: userOneId,
  email: 'thing1@email.com',
  password: 'userOnePass',
  tokens: [{
    access: 'auth',
    token: jwt.sign({_id: userOneId, access:'auth'}, secret).toString()
  }]
}, {
  _id: userTwoId,
  email: 'thing2@email.com',
  password: 'userTwoPass',
  tokens: [{
    access: 'auth',
    token: jwt.sign({_id: userTwoId, access:'auth'}, secret).toString()
  }]
}];

const dummyTodos = [{
  _id: new ObjectID,
  text: 'eat something',
  completed: true,
  completedAt: 1000,
  _creator: userOneId
}, {
  _id: new ObjectID,
  text: 'pet my cats',
  completed: false,
  _creator: userOneId
}, {
  _id: new ObjectID,
  text: 'pick my nose',
  _creator: userTwoId
}];

const populateTodos = (done) => {
  Todo.remove({}).then(() => {
    return Todo.insertMany(dummyTodos);
  }).then(() => done());
};

const populateUsers = (done) => {
  User.remove({}).then(() => {
    let userOne = new User(dummyUsers[0]).save();
    let userTwo = new User(dummyUsers[1]).save();

    return Promise.all([userOne, userTwo]);
  }).then(() => done());
};

module.exports = {dummyTodos, populateTodos, dummyUsers, populateUsers};

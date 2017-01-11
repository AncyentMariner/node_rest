require('./config/config');
const express = require('express');
const bodyParser = require('body-parser');
const _ = require('lodash');
const {mongoose} = require('./db/mongoose');
const {ObjectID} = require('mongodb');
let {Todo} = require('./models/todo');
let {User} = require('./models/user');
let {authenticate} = require('./middleware/authenticate');

let port = process.env.PORT;
let app = express();
app.use(bodyParser.json());

//Todos Routes

//POST
app.post('/todos', (req, res) => {
  let todo = new Todo({
    text: req.body.text
  });

  todo.save().then((savedThing) => {
    res.send(savedThing);
  }, (e) => {
    res.status(400).send(e);
  });
});

//GET all
app.get('/todos', (req, res) => {
  Todo.find().then((todos) => {
    res.send({todos});
  }, (e) => {
    if (e) {
      res.status(400).send(e);
    }
  });
});

//GET one by id
app.get('/todos/:id', (req, res) => {
  let id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Todo.findById(id).then((todo) => {
    if (!todo) {
      return res.status(404).send();
    }

    res.send({todo});
  }, (e) => {
    if (e) {
      res.status(400).send();
    }
  });
});

//UPDATE
app.patch('/todos/:id', (req, res) => {
  let id = req.params.id;
  let body = _.pick(req.body, ['text', 'completed']);

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  if (_.isBoolean(body.completed) && body.completed) {
    body.completedAt = new Date().getTime();
  } else {
    body.completed = false;
    body.completedAt = null;
  }

  Todo.findByIdAndUpdate(id, {$set: body}, {new: true}).then((todo) => {
    if (!todo) {
      return res.status(404).send();
    }

    res.send({todo});
  }).catch((e) => {
    res.status(400).send();
  });
});

//DELETE
app.delete('/todos/:id', (req, res) => {
  let id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Todo.findByIdAndRemove(id).then((todo) => {
    if (!todo) {
      res.status(404).send();
    }

    res.send({todo});
  }).catch((e) => {
    return res.status(400).send();
  });
});


//Users Routes

//POST /users
app.post('/users', (req, res) => {
  let body = _.pick(req.body, ['email', 'password']);
  let user = new User(body);

  user.save().then(() => {
    return user.generateAuthToken();
  }).then((token) => {
    res.header('x-auth', token).send(user);
  }, (e) => {
    res.status(400).send(e);
  });
});

//sample authentication route
app.get('/users/auth', authenticate, (req, res) => {
  res.send(req.user);
});

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});

module.exports = {app};

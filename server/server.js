const express = require('express');
const bodyParser = require('body-parser');
const {mongoose} = require('./db/mongoose');
const {ObjectID} = require('mongodb');
const {Todo} = require('./models/todo');
const {User} = require('./models/user');

let port = process.env.PORT || 3000;
let app = express();
app.use(bodyParser.json());

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

//GET
app.get('/todos', (req, res) => {
  Todo.find().then((todos) => {
    res.send({todos});
  }, (e) => {
    if (e) {
      res.status(400).send(e);
    }
  });
});

//get one by id
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

//DELETE


//set port
app.listen(port, () => {
  console.log(`listening on port ${port}`);
});

module.exports = {app};

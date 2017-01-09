const express = require('express');
const bodyParser = require('body-parser');
const {mongoose} = require('./db/mongoose');
const {Todo} = require('./models/todo');
const {User} = require('./models/user');

let port = 3000;
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
// app.get('/todos', (req, res) => {
//
// });

//UPDATE

//DELETE


//set port
app.listen(port, () => {
  console.log(`listening on port ${port}`);
});

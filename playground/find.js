const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
  if (err) {
    return console.log('Unable to connect to mongo db server');
  }

  // db.collection('Todos').find({
  //   _id: new ObjectID('586dd785805d12f8cf67b633')
  // }).toArray().then((docs) => {
  //   console.log('Todos');
  //   console.log(JSON.stringify(docs, undefined, 2));
  // }, (err) => {
  //   console.log('unable to find documents', err);
  // });

  // db.collection('Todos').find().count().then((count) => {
  //   console.log(`Todos count: ${count}`);
  // }, (err) => {
  //   console.log('unable to find documents', err);
  // });

  db.collection('Users').find().toArray().then((count) => {
    console.log(JSON.stringify(count, undefined, 2));
  }, (err) => {
    console.log('sorry, boo', err);
  });


  console.log('Connected to mongo db server');

  db.close();
});

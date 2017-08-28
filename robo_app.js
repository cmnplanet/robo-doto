const express = require('express');
// const data = require('./data');
const MongoClient = require('mongodb').MongoClient();
// const assert = require('assert');
const path = require('path');
const bodyParser = require('body-parser');
const mustacheExpress = require('mustache-express');
const bcrypt = require('bcryptjs');
const app = express();
const profileController = require('./controllers/profile');
const unemployedController = require('./controllers/unemployed');
const employedController = require('./controllers/employed');

// Mustache Boiler Plate
app.engine('mustache', mustacheExpress());
app.set('views', './views');
app.set('view engine', 'mustache');

// Setting up the style sheet
app.use(express.static('public'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// Mongo Boiler Plate

// Connection Url
var url = 'mongodb://localhost:27017/return-dir';

// !! Only run this once to set up mongo
// Use connect method to connect to the server
// MongoClient.connect(url)
// .then(function(db) {
//   console.log("Connected Mongo to the Server!");
//   return db.collection("users").insertMany(data.users);
// });

app.get('/', function(req, res){
  MongoClient.connect(url)
    .then(function(db) {
      db.collection('users')
        .find().toArray()
        .then(function(data) {
          db.close();
          res.render('index', {users: data});
        });
    });
});

app.get('/login', function(req, res){
  res.render('login');
});

app.post('/login', function(req, res){
  let username = req.body.username
  let password = req.body.password
  MongoClient.connect(url)
  .then(function(db){
    db.collection('users')
    .findOne({username: username})
      .then(function(data){
        db.close()
        if(bcrypt.compareSync(password, data.passwordHash)){

          res.redirect('/');
        } else {
          res.send('nope')
        }
      })
  })
});

app.get('/create/user', function(req, res){
  res.render('createuser');
});

app.post('/create/user', function(req, res){
  let username = req.body.username;
  let password = bcrypt.hashSync(req.body.password, 8);
  MongoClient.connect(url)
  .then(function(db){
    db.collection('users')
    .insertOne({username: username, passwordHash: password})
    .then(function(user){
      console.log(user);
    })
    // let user = db.collection('users').findOne({username: username});
    // console.log(user);
    db.close();
  });
});

// Don't fully understand controllers, so on hold for now
// app.use('/unemployed', unemployedController);
// app.use('/employed', employedController);
// app.use('/profile', profileController);

app.listen(3000, function(){
  console.log('Can you hear it');
});

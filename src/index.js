'use strict';

// load modules
const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
//const router = express.Router();

// load models
const User = require('./models/user.js');
const Course = require('./models/course.js');
const Review = require('./models/review.js');

const app = express();

// make req.body and res.body readable by our app
app.use(bodyParser.json())

// set our port
app.set('port', process.env.PORT || 5000);

// morgan gives us http request logging
app.use(morgan('dev'));

// mongodb connection
mongoose.connect("mongodb://localhost:27017/course-api");
const db = mongoose.connection;

// database connection error
db.on('error', (error) => {
  console.error("connection error:", error);
});

// message about successful connection to the database
db.once('open', () => {
  console.log("database connection is successful!");
});

/*************Routes*******************************/
// send a friendly greeting for the root route
app.get('/', (req, res, next) => {
  res.json({
    message: 'Welcome to the Course Review API'
  });
});

// this route returns the currently authenticated user
app.get('/api/users', (req, res, next) => {
  res.json({
    message: 'authenticated user!'
  });
});

// this route creates a user, sets the location header to "/", and returns no content
app.post('/api/users', (req, res, next) => {
  // Check whether a user filled in all fields

  // create a "user" object
  const userData = {
    fullName: req.body.fullName,
    emailAddress: req.body.emailAddress,
    password: req.body.password
  }

  User.create(userData, (error, user) => {
    return res.redirect('/');
  });

});

// this route returns the list of courses and contains only "_id" and "title" properties of each course
app.get('/api/courses', (req, res, next) => {
  Course.find({}, '_id title', (err, courses) => {
    res.json(courses);
  });
});

// this route returns all course properties and related documents for the provided course ID
app.get('/api/courses/:courseId', (req, res, next) => {
  console.log(req.params.courseId);
  Course.findById(req.params.courseId, (err, document) => {
    res.json(document);
  });
});

/***********************************/

// uncomment this route in order to test the global error handler
app.get('/error', function (req, res) {
  throw new Error('Test error');
});

// send 404 if no other route matched
app.use((req, res) => {
  res.status(404).json({
    message: 'Route Not Found'
  })
})

// global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message,
    error: {}
  });
});

// start listening on our port
const server = app.listen(app.get('port'), () => {
  console.log(`Express server is listening on port ${server.address().port}`);
});

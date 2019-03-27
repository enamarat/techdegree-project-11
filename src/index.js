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
// if no user is authenticated, list of all users will be returned
app.get('/api/users', (req, res, next) => {
  User.find({}, '_id fullName', (err, courses) => {
    res.json(courses);
  });
});

// this route creates a user, sets the location header to "/" and returns no content
app.post('/api/users', (req, res, next) => {
  // check whether a user's information is filled in all fields
  if (req.body.fullName &&
      req.body.emailAddress &&
      req.body.password) {
        // create a "user" object with properties provided by the request
        const userData = {
          fullName: req.body.fullName,
          emailAddress: req.body.emailAddress,
          password: req.body.password
        }

        // if email of a newly created users mathces email of a existing user, throw an error
        // User.find({}, 'emailAddress', (err, emails) => {
        //   emails.map(email => {
        //     console.log(email);
        //     if (req.body.emailAddress === email.emailAddress) {
        //       const err = new Error('The typed email already exists!');
        //       err.status = 400;
        //       return next(err);
        //     } else {
        //       User.create(userData, (err, user) => {
        //         res.redirect('/');
        //       });
        //     }
        //   });
        // });

        User.create(userData, (err, user) => {
          if(err) {
            err.message = 'The entered email already exists!';
            err.status = 400;
            return next(err);
          } else {
            res.redirect('/');
          }
        });
  } else {
    const err = new Error('All fields required!');
    err.status = 400;
    return next(err);
  }

});

// this route returns the list of courses and contains only "_id" and "title" properties of each course
app.get('/api/courses', (req, res, next) => {
  Course.find({}, '_id title', (err, courses) => {
    res.json(courses);
  });
});

// this route returns all course properties and related documents for the provided course ID
app.get('/api/courses/:courseId', (req, res, next) => {
  Course.findById(req.params.courseId, (err, document) => {
    res.json(document);
  });
});

// this route creates a course, sets the location header, and returns no content
app.post('/api/courses', (req, res, next) => {
  const course = new Course(req.body);
  course.save((err, course) => {
    if (err) {
      return next(err);
    }
    res.json(course);
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
    error: err
  });
});

// start listening on our port
const server = app.listen(app.get('port'), () => {
  console.log(`Express server is listening on port ${server.address().port}`);
});

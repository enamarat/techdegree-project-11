'use strict';

// load modules
const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const auth = require('basic-auth');

// load models
const User = require('./models/user.js');
const Review = require('./models/review.js');
const Course = require('./models/course.js');


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

/*************** Middleware functions **************/
function authenticateUser(req, res, next) {
    const credentials = auth(req);
    if (credentials) {
        User.authenticate(credentials.name, credentials.pass, function(err, user) {
            if(err) {
              return next(err);
            } else {
              //console.log(credentials);
              req.currentUser = user;
              next();
            }
        });
    } else {
        const err = new Error('Email or password are not provided!');
        err.status = 401;
        return next(err);
    }
}

/*************Routes*******************************/
// send a friendly greeting for the root route
app.get('/', (req, res, next) => {
  res.json({
    message: 'Welcome to the Course Review API'
  });
});

// this route returns the currently authenticated user
app.get('/api/users', authenticateUser, (req, res, next) => {
   res.json(req.currentUser);
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
        User.create(userData, (err, user) => {
          if(err) {
            err.message = 'The entered email already exists!';
            err.status = 400;
            return next(err);
          } else {
            res.location('/');
            res.status(201);
            res.end();
            //res.redirect('/');
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
// app.get('/api/courses/:courseId', (req, res, next) => {
//   Course.findById(req.params.courseId, (err, document) => {
//     res.json(document);
//   });
// });

app.get('/api/courses/:courseId', (req, res, next) => {
  Course.findById(req.params.courseId)
  .populate('reviews')
  .exec(function(err, data){
    if (err) {
      return next(err);
    } else {
        res.json(data);
    }
  });
});

// this route creates a course, sets the location header and returns no content
app.post('/api/courses', authenticateUser, (req, res, next) => {
  const course = new Course(req.body);
  course.user = req.currentUser._id;
  course.save((err, course) => {
    if (err) {
      err.status = 400;
      return next(err);
    }
    res.location('/api/courses');
    res.status(201);
    res.end();
   //res.redirect('/api/courses');
  });
});

// this route updates a course and returns no content
app.put('/api/courses/:courseId', authenticateUser, (req, res, next) => {
  Course.findOneAndUpdate({'_id': req.params.courseId}, { '$set': {
    user: req.currentUser._id,
    title: req.body.title,
    description: req.body.description,
    estimatedTime: req.body.estimatedTime,
    steps: req.body.steps,
    reviews: req.body.reviews
  }}, (err) => {
    if (err) {
      err.status = 400;
      return next(err);
    }
    res.location('/api/courses');
    res.end();
    //res.redirect('/api/courses');
  });
});

// this route creates a review for the specified course ID, sets the location header to the related course and returns no content
app.post('/api/courses/:courseId/reviews', authenticateUser, (req, res, next) => {
  Course.findOne({'_id': req.params.courseId}, 'reviews', (err, document) => {
    if (err) {
      err.status = 400;
      return next(err);
    }

    const review = new Review(req.body);
    review.user = req.currentUser._id;
    review.save((err) => {
      if (err) {
        err.status = 400;
        return next(err);
      }
    });

    if (document.reviews === null) {
      document.reviews = [];
    }
    document.reviews.push(review);
    document.save();
    res.location(`/api/courses/${req.params.courseId}`);
    res.end();
    //res.redirect(`/api/courses/${req.params.courseId}`);
  });

});

/***********************************/


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

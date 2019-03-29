const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;


const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true
  },
  emailAddress: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  }
});

// hash passwords before saving users to a database
userSchema.pre('save', function(next) {
  let user = this;
  bcrypt.hash(user.password, saltRounds, function(err, hash) {
    if (err) {
      return next(err);
    }
    user.password = hash;
    next();
  });
});



/* compare provided email and password with database and authenticate user
if there is a match */
userSchema.statics.authenticate = function(email, password, callback) {
  this.findOne({emailAddress: email}).exec(function(err, user){
    if(err) {
      return callback(err);
    } else if (!user) {
      let err = new Error('User not found');
      err.status = 401;
      return callback(err);
    }

    bcrypt.compare(password, user.password, function(err, result){
      if (result === true) {
        return callback(null, user);
      } else {
        const err = new Error('Wrong email or password!');
        err.status = 401;
        return callback(err);
      }
    });
  });
}

const User = mongoose.model('User', userSchema);
module.exports = User;

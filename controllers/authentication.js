const passport = require('passport')
const mongoose = require('mongoose')
const User = mongoose.model('User')

const register = (req, res) => {
  if(!req.body.username || !req.body.email || !req.body.password) {
    return res
      .status(400)
      .json({
        'messsage': 'All fields are required',
      })
  }

  const user = new User()
  user.username = req.body.username
  user.email = req.body.email
  user.setPassword(req.body.password)
  user.save((err) => {
    if(!err) {
      const token = user.generateJwt()
      return res
        .status(200)
        .json(token)
    } else {
      return res
        .status(404)
        .json(err)
    }
  })
}

const login = (req, res) => {
  if(req.body.email || req.body.password) {
    passport.authenticate('local', (err, user, info) => {
      if(err) {
        return res
        .status(404)
        .json(err)
      }
      if(user) {
        const token = user.generateJwt()
        return res
          .status(200)
          .json(token)
      } else {
        return res
          .status(401)
          .json(info)
      }
      
    }) (req, res)
  } else {
    return res
      .status(400)
      .json({
        'message': 'All fields are required'
      })
  }
}

const deleteUser = (req, res) => {
  if (req.params.email) {
    User
      .findOneAndRemove({
        email: req.params.email
      })
      .exec((err, user) => {
        if (user) {
          return user
        } else if (err) {
          return res
            .status(404)
            .json(err)
        } else {
          return res
            .status(404)
            .json({
              'message': 'User not found'
            })
        }
      })
  }
}

const getAuthor = (req, res) => {
  if(req.payload && req.payload.email) {
    User
      .findOne({
        email: req.payload.email
      })
      .exec((err, user) => {
        if(user) {
          return user
        } else if(err) {
          return res
            .status(404)
            .json(err)
        } else {
          return res
            .status(404)
            .json({
              'message': 'User not found'
            })
        }
      })
  } else {
    return res
      .status(404)
      .json({
        'message': 'User not found'
      })
  }
}

module.exports = {
  register,
  login,
  deleteUser,
  getAuthor
}
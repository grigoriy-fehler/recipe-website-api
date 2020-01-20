require('dotenv').config()
const express = require('express')
const path = require('path')
const passport = require('passport')
require('./models/db')
require('./config/passport')

apiRouter = require('./routes/index')

const app = express()

app.use(passport.initialize())
app.use(express.json())

// Allow CORS Requests
app.use('/api', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://www.recipe.g-f.dev')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, Options')
  next()
})

app.use('/api', apiRouter)

app.get('*', (req, res, next) => {
  res.sendFile(path.join(__dirname, 'public', 'dist', 'recipe-website', 'index.html'))
})

// Error handlers

// Catch unauthorised errors
app.use((err, req, res, next) => {
  if(err.name === 'UnauthorizedError') {
    res
      .status(401)
      .json({
        'message': `${err.name}: ${err.message}`
      })
  }
})

let server = app.listen(process.env.PORT || 3000, (err, req, res) => {
  console.log(`Running at: http://localhost:${server.address().port}`)
})
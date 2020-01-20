const mongoose = require('mongoose')
require('./recipes')
require('./users')

// connect to database
const dbURI = process.env.MONGODB_URI
mongoose.connect(dbURI, {
  useNewUrlParser: true,
  useFindAndModify: false,
  useCreateIndex: true,
  useUnifiedTopology: true
})

// monitore the connection events
mongoose.connection.on('connected', () => {
  console.log(`Mongoose connected to ${dbURI}`)
})

mongoose.connection.on('error', (err) => {
  console.log(`Moongoose connection error: ${err}`)
})

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected')
})

// close the connection
const shutdown = (msg, callback) => {
  mongoose.connection.close(() => {
    console.log(`Mongoose disconnected through ${msg}`)
    callback()
  })
}

// on application termination
process.on('SIGINT', () => {
  shutdown('app termination', () => {
    process.exit(0)
  })
})

// on Heroku shutdown
process.on('SIGTERM', () => {
  shutdown('Heroku app shutdown', () => {
    process.exit(0)
  })
})
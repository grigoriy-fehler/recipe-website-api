const mongoose = require('mongoose')

const ingredientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    required: true
  }
})

const reviewSchema = new mongoose.Schema({
  author: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true
  },
  text: String,
  createdOn: {
    type: Date,
    'default': Date.now
  }
})

const recipeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: false
  },
  author: {
    type: String,
    required: true
  },
  cooktime: {
    type: Number,
    required: true
  },
  difficulty: {
    type: Number,
    required: true
  },
  servings: {
    type: Number,
    required: true
  },
  instructions: {
    type: Array,
    required: true
  },
  rating: {
    type: Array,
    'default': 0,
    min: 0,
    max: 5
  },
  ingredients: [ingredientSchema],
  reviews: [reviewSchema]
})

recipeSchema.index({'$**': 'text'})

mongoose.model('Recipe', recipeSchema)
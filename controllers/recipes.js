const mongoose = require('mongoose')
const Recipe = mongoose.model('Recipe')

// '/api/recipes'
const listAll = (req, res) => {
  Recipe.find({}, (err, recipe) => {
    if (!recipe) {
      return res
        .status(404)
        .json({
          'message': 'No recipe found'
        })
    } else if (err) {
      return res
        .status(400)
        .json(err)
    } else {
      return res
        .status(200)
        .json(recipe)
    }
  })
}

// '/api/recipes'
const createOne = (req, res) => {
  const postData = {
    name: req.body.name,
    image: req.body.image,
    author: req.body.author,
    cooktime: req.body.cooktime,
    servings: req.body.servings,
    difficulty: req.body.difficulty,
    ingredients: req.body.ingredients,
    instructions: req.body.instructions
  }
  Recipe.create([postData], (err, recipes) => {
    if (err) {
      return res
        .status(400)
        .json(err)
    } else {
      console.log(recipes)
      return res
        .status(201)
        .json(recipes)
    }
  })
}

// '/api/recipe/:recipeId'
const readOne = (req, res) => {
  Recipe
    .findById(req.params.recipeId)
    .exec((err, recipe) => {
      if (!recipe) {
        return res
          .status(404)
          .json({
            'message': 'recipe not found'
          })
      } else if (err) {
        return res
          .status(404)
          .json(err)
      }
      return res
        .status(200)
        .json(recipe)
    })
}

// '/api/recipe/:recipeId'
const updateOne = (req, res) => {
  if (!req.params.recipeId) {
    return res
      .status(404)
      .json({
        'message': 'not found, recipeId is required'
      })
  }
  Recipe
    .findById(req.params.recipeId)
    .select('-reviews -rating')
    .exec((err, recipe) => {
      if (!recipe) {
        return res
          .status(404)
          .json({
            'message': 'recipeId not found'
          })
      } else if (err) {
        return res
          .status(400)
          .json(err)
      }

      recipe.name = req.body.name
      recipe.image = req.body.image
      recipe.cooktime = req.body.cooktime
      recipe.difficulty = req.body.difficulty
      recipe.servings = req.body.servings
      recipe.ingredients = req.body.ingredients
      recipe.instructions = req.body.instructions
      
      recipe.save((err, rec) => {
        if (err) {
          return res
            .status(404)
            .json(err)
        } else {
          return res
            .status(200)
            .json(rec)
        }
      })
    })
}

// '/api/recipe/:recipeId'
const deleteOne = (req, res) => {
  const recipeId = req.params.recipeId
  if (!recipeId) {
    return res
      .status(404)
      .json({
        'message': 'no recipe'
      })
  } else {
    Recipe
      .findByIdAndRemove(recipeId)
      .exec((err, recipe) => {
        if (err) {
          return res
            .status(404)
            .json(err)
        }
        return res
          .status(204)
          .json(null)
      })
  }
}

const searchMany = (req, res) => {
  const searchTerm = req.params.searchTerm.replace('search=', '')
  console.log(searchTerm)
  if (!searchTerm) {
    return res
      .status(404)
      .json({
        'message': 'no search term'
      })
  } else {
    Recipe
      .find({$text: {$search: searchTerm}})
      .exec((err, recipe) => {
        if (err) {
          return res
            .status(404)
            .json(err)
        }
        return res
          .status(200)
          .json(recipe)
      })
  }
}

module.exports = {
  listAll,
  createOne,
  readOne,
  updateOne,
  deleteOne,
  searchMany
}
const mongoose = require('mongoose')
const Recipe = mongoose.model('Recipe')
const getAuthor = require('../controllers/authentication').getAuthor

// '/api/recipe/:recipeId/reviews'
const listAll = (req, res) => {
  Recipe
    .findById(req.params.recipeId)
    .select('name reviews')
    .exec((err, recipe) => {
      if (!recipe) {
        return res
          .status(404)
          .json({
            'message': 'Recipe not found'
          })
      } else if (err) {
        return res
          .status(400)
          .json(err)
      }
      if (recipe.reviews && recipe.reviews.length > 0) {
        const review = recipe.reviews.id(req.params.reviewId)
        if (!review) {
          return res
            .status(400)
            .json({
              'message': 'Review not found'
            })
        } else {
          response = {
            recipe: {
              name: recipe.name,
              id: req.params.recipeId
            },
            review
          }
          return res
            .status(200)
            .json(response)
        }
      } else {
        return res
          .status(404)
          .json({
            'message': 'No reviews found'
          })
      }
    })
}

// '/api/recipe/:recipeId/reviews'
const createOne = (req, res) => {
  const recipeId = req.params.recipeId
  if (recipeId) {
    Recipe
      .findById(recipeId)
      .select('reviews')
      .exec((err, recipe) => {
        if (err) {
          return res
            .status(400)
            .json(err)
        } else {
          if (!recipe) {
            return res
              .status(404)
              .json({
                'message': 'Recipe not found'
              })
          } else {
            const rating = req.body.rating
            const text = req.body.text
            const author = req.body.author
            recipe.reviews.push({
              author,
              rating,
              text
            })
            recipe.save((err, recipe) => {
              if (!err) {
                const thisReview = recipe.reviews.slice(-1).pop()
                updateAverageRating(recipe.id)
                return res
                  .status(201)
                  .json(thisReview)
              } else {
                return res
                  .status(400)
                  .json(err)
              }
            })
          }
        }
      })
  } else {
    return res
      .status(404)
      .json({
        'message': 'Recipe not found'
      })
  }
}

// '/api/recipe/:recipeId/comment/:reviewId'
const updateOne = (req, res) => {
  if (!req.params.recipeId || !req.params.reviewId) {
    return res
      .status(404)
      .json({
        'message': 'Not found, recipeId and reviewId are both required'
      })
  }
  Recipe
    .findById(req.params.recipeId)
    .select('reviews')
    .exec((err, recipe) => {
      if (!recipe) {
        return res
          .status(404)
          .json({
            'message': 'Recipe not found'
          })
      } else if (err) {
        return res
          .status(400)
          .json(err)
      }
      if (recipe.reviews && recipe.reviews.length > 0) {
        const thisReview = recipe.reviews.id(req.params.reviewId)
        if (!thisReview) {
          return res
            .status(404)
            .json({
              'message': 'Review not found'
            })
        } else {
          thisReview.author = req.body.author
          thisReview.rating = req.body.rating
          thisReview.text = req.body.text
          recipe.save((err) => {
            if (!err) {
              updateAverageRating(recipe.id)
              return res
                .status(200)
                .json(thisReview)
            } else {
              return res
                .status(404)
                .json(err)
            }
          })
        }
      } else {
        return res
          .status(404)
          .json({
            'message': 'No review to update'
          })
      }
    })
}

// '/api/recipe/:recipeId/comment/:reviewId'
const deleteOne = (req, res) => {
  const {recipeId, reviewId} = req.params
  if (!recipeId || !reviewId) {
    return res
      .status(404)
      .json({
        'message': 'Not found, recipeId and reviewId are both required'
      })
  }
  Recipe
    .findById(recipeId)
    .select('reviews')
    .exec((err, recipe) => {
      if (!recipe) {
        return res
          .status(404)
          .json({
            'message': 'Recipe not found'
          })
      } else if (err) {
        return res
          .status(400)
          .json(err)
      }
      if (recipe.reviews && recipe.reviews.length > 0) {
        if (!recipe.reviews.id(reviewId)) {
          return res
            .status(404)
            .json({
              'message': 'Review not found'
            })
        } else {
          recipe.reviews.id(reviewId).remove()
          recipe.save((err) => {
            if (!err) {
              updateAverageRating(recipe.id)
              return res
                .status(204)
                .json(null)
            } else {
              return res
                .status(404)
                .json(err)
            }
          })
        }
      } else {
        return res
          .status(404)
          .json({
            'message': 'No review to delete'
          })
      }
    })
}

const updateAverageRating = (recipeId) => {
  Recipe
    .findById(recipeId)
    .select('rating reviews')
    .exec((err, recipe) => {
      if (!err) {
        if (recipe.reviews && recipe.reviews.length > 0) {
          const count = recipe.reviews.length
          const total = recipe.reviews.reduce((acc, {rating}) => {
            return acc + rating
          }, 0)
      
          recipe.rating = parseInt(total / count, 10)
          recipe.save((err) => {
            if (!err) {
              console.log(`Average rating updated to ${recipe.rating}`)
            } else {
              console.log(err)
            }
          })
        }
      } else {
        console.log(err)
      }
    })
}

module.exports = {
  listAll,
  createOne,
  updateOne,
  deleteOne
}
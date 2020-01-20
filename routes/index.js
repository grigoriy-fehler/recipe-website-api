const express = require('express')
const router = express.Router()
const jwt = require('express-jwt')
const auth = jwt({
  secret: process.env.JWT_SECRET,
  userProperty: 'payload'
})

const ctrRecipes = require('../controllers/recipes')
const ctrReviews = require('../controllers/reviews')
const ctrAuth = require('../controllers/authentication')

// Recipe Routes
router
  .route('/recipes')
  .get(ctrRecipes.listAll)
  .post(auth, ctrRecipes.createOne)

router
  .route('/recipe/:recipeId')
  .get(ctrRecipes.readOne)
  .put(auth, ctrRecipes.updateOne)
  .delete(auth, ctrRecipes.deleteOne)

// Search Recipes
router
  .route('/:searchTerm')
  .get(ctrRecipes.searchMany)

// Reviews
router
  .route('/recipe/:recipeId/reviews')
  .get(ctrReviews.listAll)
  .post(auth, ctrReviews.createOne)

router
  .route('/recipe/:recipeId/review/:reviewId')
  .put(auth, ctrReviews.updateOne)
  .delete(auth, ctrReviews.deleteOne)

// Users
router.post('/user/register', ctrAuth.register)
router.post('/user/login', ctrAuth.login)
router.delete('/user/delete/:email', ctrAuth.deleteUser)

module.exports = router
const datalib = require('./datalib.js')
const utils = require('./utils.js')

// TODO: For User & Recipe post method
//   - Check payload for script tags before saving

const handlers = {}

handlers.ping = function(data, callback) {
	setTimeout(() => { callback(200) }, 5000)
}

handlers.notFound = function(data, callback) {
	callback(404)
}

// R E C I P E   F U N C T I O N S /////////////////////////////////////////////

handlers.recipes = {}

handlers.recipes.route = function(data, callback) {
	const methods = ['post', 'get', 'put', 'delete', 'options']
	if (methods.indexOf(data.method) > -1)
		handlers.recipes[data.method](data, callback)
	else
		callback(405)
}

// TODO:
//   - Scale images to 300x200px and save as thumbnail
//   - Save original image separately from recipe
//   - Save ingredients separately from recipe
handlers.recipes.post = async (data, callback) => {
	const id = Math.random().toString(16).slice(2)
	const name = typeof(data.payload.name) == 'string' ?
		data.payload.name : false
	const image = typeof(data.payload.image) == 'string' ?
		data.payload.image : false
	const author = typeof(data.payload.author) == 'string' ?
		data.payload.author : false
	const cookingTime = typeof(data.payload.cookingTime) == 'string' ?
		data.payload.cookingTime : false
	const difficulty = typeof(data.payload.difficulty) == 'string' ?
		data.payload.difficulty : false
	const servings = typeof(data.payload.servings) == 'string' ?
		data.payload.servings : false
	const instructions = typeof(data.payload.instructions) == 'object' ?
		data.payload.instructions : false
	const ingredients = typeof(data.payload.ingredients) == 'object' ?
		data.payload.ingredients : false

	const dataIsOk = id && name && image && author && cookingTime &&
		difficulty && servings && instructions && ingredients

	if (!dataIsOk) {
		callback(400, { 'error': 'Missing required fields!' })
		return
	}

	try {
		const recipeData = {
			'id': id,
			'name': name,
			'image': image,
			'author': author,
			'cookingTime': cookingTime,
			'difficulty': difficulty,
			'servings': servings,
			'instructions': instructions,
			'ratings': [],
			'ingredients': ingredients,
			'reviews': []
		}

		await datalib.create('recipes', id, recipeData)
		callback(200)
	} catch (error) {
		callback(400, { 'error': error })
	}
}

handlers.recipes.get = async (data, callback) => {
	const recipeId = typeof(data.search) == 'string' ?
		data.search.replace('?', '') : false

	if (!recipeId) {
		try {
			const recipeList = await datalib.list('recipes')
			let recipes = []
			for (const recipeName of recipeList) {
				const recipe = await datalib.read('recipes', recipeName)
				recipes.push(recipe)
			}
			callback(200, recipes)
		} catch (error) {
			callback(400, { 'error': error })
		}
	} else {
		try {
			const recipe = await datalib.read('recipes', recipeId)
			callback(200, recipe)
		} catch (error) {
			callback(400, { 'error': error })
		}
	}
}

handlers.recipes.put = function(data, callback) {
}

// TODO: Check for user password
handlers.recipes.delete = async (data, callback) => {
	const recipeId = typeof(data.search) == 'string' ?
		data.search.replace('?', '') : false

	if (!recipeId) {
		// TODO: Check status code
		callback(400, { 'error': 'Missing recipe id!' })
		return
	}

	try {
		await datalib.delete('recipes', recipeId)
		callback(200)
	} catch (error) {
		callback(400, { 'error': error })
	}
}

// TODO: Check request
handlers.recipes.options = function(data, callback) {
	callback(204)
}

// U S E R   F U N C T I O N S /////////////////////////////////////////////////

// TODO:
//   - Authenticate user with JWT
//   - Use email instead of username for login

handlers.users = {}

handlers.users.route = function(data, callback) {
	const methods = ['post', 'delete']
	if (methods.indexOf(data.method) > -1)
		handlers.users[data.method](data, callback)
	else
		callback(405)
}

// TODO:
//   - Hash all user data
//   - Use salt for hashing
//   - Hash multiple times
//   - Use better hash function
handlers.users.post = async (data, callback) => {
	const username = typeof(data.payload.username) == 'string' &&
		data.payload.username.trim().length > 0 ?
		data.payload.username.trim() : false
	
	const reqPassword = typeof(data.payload.password) == 'string' &&
		data.payload.password.trim().length > 0 ?
		data.payload.password.trim() : false

	if (username && reqPassword) {    // Login User
		const hashedPassword = utils.hash(reqPassword)

		if (!hashedPassword) {
			callback(500, { 'error': 'Could not hash the user\'s password' })
			return
		}

		const userData = {
			'username': username,
			'password': hashedPassword
		}

		login(userData, (statusCode, payload) => {
			callback(statusCode, payload)
		})
	} else {                                    // Register User
		const password1 = typeof(data.payload.password1) == 'string' &&
			data.payload.password1.trim().length > 0 ?
			data.payload.password1.trim() : false
		const password2 = typeof(data.payload.password2) == 'string' &&
			data.payload.password2.trim().length > 0 ?
			data.payload.password2.trim() : false

		const password = password1 == password2 ? password1 : false

		if (!username || !password) {
			callback(400, { 'error': 'Missing required fields' })
			return
		}

		const userData = {
			'username': username,
			'password': password
		}

		register(userData, (statusCode, payload) => {
			callback(statusCode, payload)
		})
	}
}

async function login(data, callback) {
	try {
		const userData = await datalib.read('users', data.username)
		if (userData.password !== data.password) {
			callback(403, { 'error': 'Wrong credentials' })
			return
		}

		delete userData.password
		callback(200, userData)
	} catch (error) {
		callback(400, { 'error': 'User does not exist or wrong credentials' })
	}
}

async function register(data, callback) {
	const userExists = await datalib.exists('users', data.username)
	if (userExists) {
		callback(400, { 'error': 'A user with that username already exists.' })
		return
	}

	try {
		const hashedPassword = utils.hash(data.password)

		if (!hashedPassword) {
			callback(500, { 'error': 'Could not hash the user\'s password' })
			return
		}

		const userData = {
			'username': data.username,
			'password': hashedPassword
		}

		await datalib.create('users', data.username, userData)
		delete userData.password
		callback(200, userData)
	} catch (error) {
		callback(500, { 'error': 'Could not register User' })
	}
}

handlers.users.delete = async (data, callback) => {
}

module.exports = handlers

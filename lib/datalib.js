const fs = require('fs').promises
const path = require('path')

const utils = require('./utils.js')

const datalib = {}

datalib.basedir = path.join(__dirname, '/../data/')

datalib.create = async (dir, file, data) => {
	try {
		const fileHandle = await fs.open(`${datalib.basedir}${dir}/${file}.json`, 'wx')
		if (!fileHandle) {
			throw new Error("Could not create new file, it may already exist.")
		}

		const jsonData = JSON.stringify(data)

		await fs.writeFile(fileHandle, jsonData)
		await fileHandle.close()
	} catch (error) {
		throw error
	}
}

datalib.read = async (dir, file) => {
	try {
		const jsonFile = `${datalib.basedir}${dir}/${file}.json`
		const data = await fs.readFile(jsonFile, 'utf-8')
		return utils.jsonToObject(data)
	} catch	(error) {
		throw error
	}
}

datalib.update = function(dir, file, callback) {
}

datalib.delete = async (dir, file) => {
	try {
		await fs.unlink(`${datalib.basedir}${dir}/${file}.json`)
	} catch (error) {
		throw error
	}
}

datalib.list = async (dir) => {
	try {
		const files = await fs.readdir(`${datalib.basedir}${dir}/`)
		let filenames = []
		for (const file of files) {
			filenames.push(file.replace('.json', ''))
		}
		return filenames
	} catch (error) {
		throw error
	}
}

datalib.exists = async (dir, file) => {
	return fs.access(`${datalib.basedir}${dir}/${file}.json`)
		.then(() => true)
		.catch(() => false)
}

module.exports = datalib
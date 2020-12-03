const mongoose = require('mongoose')


const categorySchema = new mongoose.Schema({
    category: String
})

const categoryModel = new mongoose.model('Category', categorySchema)

module.exports = categoryModel

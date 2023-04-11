const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    type: String,
    title: String,
    url: String,
    authorName: String,
    publishDate: String,
    originalPublishDate: String
})

const data = mongoose.model('article', schema)

module.exports = data;
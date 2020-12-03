const mongoose = require('mongoose')


const articleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        index: 'text'
    },
    desc: {
        type: String,
        required: true,
        index: 'text'
    },
    content: {
        type: String,
        required: true
    },
    // author: {
    //     type: String,
    //     required: true
    // },
    time: {
        type: Date,
        default: Date.now
    },
    authorId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    category: {
        type: String,
        required: true
    },
    weights: {
        type: Number,
        default: 0
    },
    publish: {
        type: Boolean,
        default: false
    }
})

const articleModel = new mongoose.model('article', articleSchema)

// articleSchema.index({ title: "text", desc: "text" })
module.exports = articleModel

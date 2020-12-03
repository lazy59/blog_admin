const mongoose = require('mongoose')


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: Number,           //1代表editor，2代表admin
        required: true
    },
    avatar: {
        type: String,
        default: ''
    }
})

const userModel = new mongoose.model('User', userSchema)

module.exports = userModel

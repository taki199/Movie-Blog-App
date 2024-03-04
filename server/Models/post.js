const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const PostSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    admin: {
        type: Schema.Types.ObjectId,
        ref: 'User' // Reference to the User model
    }
});

module.exports = mongoose.model('Post', PostSchema);

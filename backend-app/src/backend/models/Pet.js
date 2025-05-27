import mongoose from 'mongoose';

//Pet info and memory
/*
a single memory page:
pet's name
the AI generated story
pet photos
timeline of visited locations
user who created it
 */
const mongoose = require('mongoose');

const memorySchema = new mongoose.Schema({
    userId: String,
    petName: String,
    story: String,
    photos: [String],
    locationVisits: [{
        locationId: String,
        date: Date,
        comment: String
    }],
    createdAt: Date
});

module.exports = mongoose.model('Memory', memorySchema);


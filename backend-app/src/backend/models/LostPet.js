

//Lost pet
/*
user can report to POST/api/lostpets/report
nearby user get real time alerts via socket.io
map shows unresolved lost pet sightings
once resolved, user can call PATCH/api/lostpets/:id/resolve
 */

const mongoose = require('mongoose');

const lostPetSchema = new mongoose.Schema({
    userId: String,
    petDescription: String,
    lastSeenLocation: {
        lat: Number,
        lng: Number
    },
    time: Date,
    contact: String,
    resolved: { type: Boolean, default: false }
});

module.exports = mongoose.model('LostPet', lostPetSchema);

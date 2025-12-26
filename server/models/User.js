const mongoose = require('mongoose');

const RideHistorySchema = new mongoose.Schema({
    date: { type: Date, default: Date.now },
    pickupLocation: {
        lat: Number,
        lng: Number,
        address: String
    },
    dropoffLocation: {
        name: String,
        address: String,
        lat: Number,
        lng: Number
    },
    duration: String,
    status: { type: String, default: 'Completed' }
});

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // In real app, hash this!
    role: {
        type: String,
        enum: ['driver', 'admin', 'hospital', 'police'],
        required: true
    },
    name: { type: String },
    vehicleId: { type: String }, // For drivers
    // Embedded history for drivers
    history: [RideHistorySchema]
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);

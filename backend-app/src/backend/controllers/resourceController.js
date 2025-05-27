

//Manages parks, vets, stores, etc.

const Resource = require('../models/Resource');

// Create a new location resource
exports.createResource = async (req, res) => {
    const { name, type, coordinates, tags } = req.body;
    try {
        const resource = await Resource.create({
            name,
            type,
            coordinates,
            tags
        });
        res.status(201).json(resource);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Get all locations (with optional query filtering)
exports.getResources = async (req, res) => {
    try {
        const filters = req.query || {};
        const results = await Resource.find(filters);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: 'Failed to load resources' });
    }
};

// Add a user review to a resource
exports.addReview = async (req, res) => {
    const { rating, comment } = req.body;
    const userId = req.user.uid;

    try {
        const resource = await Resource.findById(req.params.id);
        if (!resource) return res.status(404).json({ error: 'Resource not found' });

        resource.reviews.push({ userId, rating, comment });
        await resource.save();
        res.json(resource);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};


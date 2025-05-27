import Pet from '../models/Pet.js';


/*
this file contains the logic behind each route - what to do when someone uploads a photo, creates a memory page, or calls the API
 */


const Memory = require('../models/Pet');
const axios = require('axios');

// Generate AI-based memory story
exports.generateMemoryStory = async (req, res) => {
    const { petName, notes } = req.body;
    try {
        const prompt = `Write a warm, emotional story about a pet named ${petName}. Include these memories: "${notes}".`;
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-4',
            messages: [{ role: 'user', content: prompt }]
        }, {
            headers: {
                Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
            }
        });
        const story = response.data.choices[0].message.content;
        res.json({ story });
    } catch (err) {
        res.status(500).json({ error: 'AI generation failed', detail: err.message });
    }
};

// Upload photo to S3 (handled by multer in middleware)
exports.uploadPhoto = async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    res.json({ url: req.file.location });
};

// Create memory page in DB
exports.createMemory = async (req, res) => {
    const { petName, story, photos, locationVisits } = req.body;
    try {
        const memory = await Memory.create({
            userId: req.user.uid,
            petName,
            story,
            photos,
            locationVisits,
            createdAt: new Date()
        });
        res.status(201).json(memory);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Get all memories for the logged-in user
exports.getUserMemories = async (req, res) => {
    try {
        const memories = await Memory.find({ userId: req.user.uid }).sort({ createdAt: -1 });
        res.json(memories);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch memories' });
    }
};


const Card = require("../models/Card");

exports.createCard = async (req, res) => {
  try {
    const card = await Card.create(req.body);
    res.status(201).json(card);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getCards = async (req, res) => {
  try {
    const cards = await Card.find().populate('place').populate('createdBy', 'name email');
    res.json(cards);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get cards by user ID
exports.getCardsByUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log('Backend: Getting cards for user:', userId);
    
    const cards = await Card.find({ createdBy: userId }).populate('place');
    console.log('Backend: Found cards for user:', cards.length);
    res.status(200).json(cards);
  } catch (err) {
    console.error('Backend: Error getting cards by user:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.getCardById = async (req, res) => {
  try {
    const card = await Card.findById(req.params.id);
    if (!card) return res.status(404).json({ error: "Card not found" });
    res.json(card);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

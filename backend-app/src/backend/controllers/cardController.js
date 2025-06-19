const Card = require("../models/Card");

exports.createCard = async (req, res) => {
  try {
    const card = await Card.create({ ...req.body, user: req.user.uid });
    res.status(201).json(card);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getCards = async (req, res) => {
  try {
    const query = req.query.place ? { place: req.query.place } : { user: req.user.uid };
    const cards = await Card.find(query);
    res.json(cards);
  } catch (err) {
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

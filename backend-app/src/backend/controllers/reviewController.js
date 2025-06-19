const Review = require("../models/Review");

exports.addReview = async (req, res) => {
  try {
    const review = await Review.create({ ...req.body, user: req.user.uid });
    res.status(201).json(review);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getReviewsForPlace = async (req, res) => {
  try {
    const reviews = await Review.find({ place: req.params.placeId });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

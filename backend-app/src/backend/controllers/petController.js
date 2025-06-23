const Pet = require("../models/Pet");

// Create a new pet
exports.createPet = async (req, res) => {
  try {
    const { owner, name, species, breed, gender, birthDate, profileImage, personalityTraits, notes } = req.body;

    const newPet = await Pet.create({
      owner,
      name,
      species,
      breed,
      gender,
      birthDate,
      profileImage,
      personalityTraits,
      notes,
    });

    res.status(201).json(newPet);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all pets
exports.getAllPets = async (req, res) => {
  try {
    const pets = await Pet.find();
    res.status(200).json(pets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get pet by ID
exports.getPetById = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);
    if (!pet) return res.status(404).json({ error: "Pet not found" });
    res.status(200).json(pet);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update pet
exports.updatePet = async (req, res) => {
  try {
    const updatedPet = await Pet.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updatedPet) return res.status(404).json({ error: "Pet not found" });
    res.status(200).json(updatedPet);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete pet
exports.deletePet = async (req, res) => {
  try {
    const deletedPet = await Pet.findByIdAndDelete(req.params.id);
    if (!deletedPet) return res.status(404).json({ error: "Pet not found" });
    res.status(200).json({ message: "Pet deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//upload pet photo
exports.uploadPetPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    return res.status(200).json({ imageUrl: req.file.location });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

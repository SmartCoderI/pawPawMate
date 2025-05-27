

//Handles lost pet alerts

const LostPet = require('../models/LostPet');

// Create a new lost pet report
exports.reportLostPet = async (req, res) => {
    const { petDescription, lastSeenLocation, time, contact } = req.body;

    try {
        const report = await LostPet.create({
            userId: req.user.uid,
            petDescription,
            lastSeenLocation,
            time,
            contact
        });

        // Optionally: Emit alert via Socket.io
        req.app.get('io')?.emit('lost-pet-alert', report);

        res.status(201).json(report);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Get all lost pet alerts
exports.getAllReports = async (req, res) => {
    try {
        const reports = await LostPet.find({ resolved: false }).sort({ time: -1 });
        res.json(reports);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch lost pets' });
    }
};

// Resolve (mark as found)
exports.resolvePet = async (req, res) => {
    try {
        const pet = await LostPet.findByIdAndUpdate(
            req.params.id,
            { resolved: true },
            { new: true }
        );
        if (!pet) return res.status(404).json({ error: 'Report not found' });
        res.json(pet);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update report' });
    }
};


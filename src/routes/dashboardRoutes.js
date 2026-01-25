// src/routes/dashboardRoutes.js
const express = require('express');
const router = express.Router();
const Reservation = require('../models/Reservation');
const { requireAuth } = require('../middleware/authMiddleware'); // adapte le chemin si besoin

router.get('/dashboard', requireAuth, async (req, res, next) => {
  try {
    const user = req.session.user;

    const today = new Date();

    const reservationsDb = await Reservation.find({
      endDate: { $gte: today }
    }).sort({ startDate: 1 });

    const reservations = reservationsDb.map(r => ({
      catwayNumber: r.catwayNumber,
      clientName: r.clientName,
      boatName: r.boatName,
      startDateFormatted: r.startDate.toLocaleDateString('fr-FR'),
      endDateFormatted: r.endDate.toLocaleDateString('fr-FR'),
      status: 'en_cours'
    }));

    const currentDate = today.toLocaleDateString('fr-FR');

    res.render('dashboard', {
      user,
      currentDate,
      reservations
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

// src/routes/reservationRoutes.js
const express = require('express');
const router = express.Router();
const Reservation = require('../models/Reservation');

// Lister toutes les réservations d'un catway
// GET /catways/:catwayId/reservations
router.get('/', async (req, res, next) => {
  try {
    const catwayNumber = req.params.catwayId;

    const reservations = await Reservation.find({ catwayNumber }).sort({
      startDate: 1
    });

    res.json(reservations);
  } catch (err) {
    next(err);
  }
});

// Récupérer une réservation précise d'un catway
// GET /catways/:catwayId/reservations/:reservationId
router.get('/:reservationId', async (req, res, next) => {
  try {
    const { reservationId } = req.params;

    const reservation = await Reservation.findById(reservationId);

    if (!reservation) {
      return res.status(404).json({ message: 'Réservation non trouvée' });
    }

    res.json(reservation);
  } catch (err) {
    next(err);
  }
});

// Créer une réservation pour un catway
// POST /catways/:catwayId/reservations
router.post('/', async (req, res, next) => {
  try {
    const catwayNumber = req.params.catwayId;
    const { clientName, boatName, startDate, endDate } = req.body;

    const reservation = await Reservation.create({
      catwayNumber,
      clientName,
      boatName,
      startDate,
      endDate
    });

    res.status(201).json(reservation);
  } catch (err) {
    next(err);
  }
});

// Mettre à jour une réservation d'un catway
// PUT /catways/:catwayId/reservations/:reservationId
router.put('/:reservationId', async (req, res, next) => {
  try {
    const { reservationId } = req.params;
    const { clientName, boatName, startDate, endDate } = req.body;

    const updated = await Reservation.findByIdAndUpdate(
      reservationId,
      { clientName, boatName, startDate, endDate },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Réservation non trouvée' });
    }

    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// Supprimer une réservation d'un catway
// DELETE /catways/:catwayId/reservations/:reservationId
router.delete('/:reservationId', async (req, res, next) => {
  try {
    const { reservationId } = req.params;

    const deleted = await Reservation.findByIdAndDelete(reservationId);

    if (!deleted) {
      return res.status(404).json({ message: 'Réservation non trouvée' });
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;

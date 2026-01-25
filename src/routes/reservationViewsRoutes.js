const express = require('express');
const router = express.Router();
const Reservation = require('../models/Reservation');
const Catway = require('../models/Catway');

// Middleware d’authentification (même logique que pour catways)
function requireAuth(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.redirect('/');
  }
  next();
}

// LISTE : GET /app/reservations
router.get('/reservations', requireAuth, async (req, res, next) => {
  try {
    const reservationsDb = await Reservation.find().sort({ startDate: 1 });
    const reservations = reservationsDb.map(r => ({
      _id: r._id,
      catwayNumber: r.catwayNumber,
      clientName: r.clientName,
      boatName: r.boatName,
      startDate: r.startDate.toISOString().substring(0, 10),
      endDate: r.endDate.toISOString().substring(0, 10)
    }));

    const user = {
      username: req.session.username,
      email: req.session.userEmail
    };

    res.render('reservations/index', {
      title: 'Réservations',
      user,
      reservations
    });
  } catch (err) {
    next(err);
  }
});

// FORM NEW : GET /app/reservations/new
router.get('/reservations/new', requireAuth, async (req, res, next) => {
  try {
    const catways = await Catway.find().sort({ catwayNumber: 1 });
    const user = {
      username: req.session.username,
      email: req.session.userEmail
    };

    res.render('reservations/new', {
      title: 'Nouvelle réservation',
      user,
      catways,
      errors: null
    });
  } catch (err) {
    next(err);
  }
});

// CREATE : POST /app/reservations
router.post('/reservations', requireAuth, async (req, res, next) => {
  try {
    const { catwayNumber, clientName, boatName, startDate, endDate } = req.body;
    await Reservation.create({
      catwayNumber,
      clientName,
      boatName,
      startDate,
      endDate
    });
    res.redirect('/app/reservations');
  } catch (err) {
    const catways = await Catway.find().sort({ catwayNumber: 1 });
    const user = {
      username: req.session.username,
      email: req.session.userEmail
    };
    res.render('reservations/new', {
      title: 'Nouvelle réservation',
      user,
      catways,
      errors: err.message
    });
  }
});

// FORM EDIT : GET /app/reservations/:id/edit
router.get('/reservations/:id/edit', requireAuth, async (req, res, next) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) return res.redirect('/app/reservations');

    const catways = await Catway.find().sort({ catwayNumber: 1 });
    const user = {
      username: req.session.username,
      email: req.session.userEmail
    };

    res.render('reservations/edit', {
      title: 'Modifier réservation',
      user,
      catways,
      reservation,
      errors: null
    });
  } catch (err) {
    next(err);
  }
});

// UPDATE : POST /app/reservations/:id
router.post('/reservations/:id', requireAuth, async (req, res, next) => {
  try {
    const { catwayNumber, clientName, boatName, startDate, endDate } = req.body;
    await Reservation.findByIdAndUpdate(req.params.id, {
      catwayNumber,
      clientName,
      boatName,
      startDate,
      endDate
    });
    res.redirect('/app/reservations');
  } catch (err) {
    const reservation = await Reservation.findById(req.params.id);
    const catways = await Catway.find().sort({ catwayNumber: 1 });
    const user = {
      username: req.session.username,
      email: req.session.userEmail
    };
    res.render('reservations/edit', {
      title: 'Modifier réservation',
      user,
      catways,
      reservation,
      errors: err.message
    });
  }
});

// DELETE : POST /app/reservations/:id/delete
router.post('/reservations/:id/delete', requireAuth, async (req, res, next) => {
  try {
    await Reservation.findByIdAndDelete(req.params.id);
    res.redirect('/app/reservations');
  } catch (err) {
    next(err);
  }
});

module.exports = router;

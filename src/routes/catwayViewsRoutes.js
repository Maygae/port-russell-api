// src/routes/catwayViewsRoutes.js
const express = require('express');
const router = express.Router();
const Catway = require('../models/Catway');

// On protège les vues avec la session
function requireAuth(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.redirect('/');
  }
  next();
}

// Liste des catways : GET /app/catways
router.get('/catways', requireAuth, async (req, res, next) => {
  try {
    const catways = await Catway.find().sort({ catwayNumber: 1 });

    const user = {
      username: req.session.username,
      email: req.session.userEmail
    };

    res.render('catways/index', {
      title: 'Catways',
      user,
      catways
    });
  } catch (err) {
    next(err);
  }
});

// Formulaire de création : GET /app/catways/new
router.get('/catways/new', requireAuth, (req, res) => {
  const user = {
    username: req.session.username,
    email: req.session.userEmail
  };

  res.render('catways/new', {
    title: 'Nouveau catway',
    user,
    errors: null
  });
});

// Création : POST /app/catways
router.post('/catways', requireAuth, async (req, res, next) => {
  try {
    const { catwayNumber, catwayType, catwayState } = req.body;
    await Catway.create({ catwayNumber, catwayType, catwayState });
    res.redirect('/app/catways');
  } catch (err) {
    const user = {
      username: req.session.username,
      email: req.session.userEmail
    };
    res.render('catways/new', {
      title: 'Nouveau catway',
      user,
      errors: err.message
    });
  }
});

// Formulaire d’édition : GET /app/catways/:id/edit
router.get('/catways/:id/edit', requireAuth, async (req, res, next) => {
  try {
    const catway = await Catway.findById(req.params.id);
    if (!catway) return res.redirect('/app/catways');

    const user = {
      username: req.session.username,
      email: req.session.userEmail
    };

    res.render('catways/edit', {
      title: 'Modifier catway',
      user,
      catway,
      errors: null
    });
  } catch (err) {
    next(err);
  }
});

// Mise à jour : POST /app/catways/:id
router.post('/catways/:id', requireAuth, async (req, res, next) => {
  try {
    const { catwayState } = req.body;
    await Catway.findByIdAndUpdate(req.params.id, { catwayState });
    res.redirect('/app/catways');
  } catch (err) {
    const catway = await Catway.findById(req.params.id);
    const user = {
      username: req.session.username,
      email: req.session.userEmail
    };
    res.render('catways/edit', {
      title: 'Modifier catway',
      user,
      catway,
      errors: err.message
    });
  }
});

// Suppression : POST /app/catways/:id/delete
router.post('/catways/:id/delete', requireAuth, async (req, res, next) => {
  try {
    await Catway.findByIdAndDelete(req.params.id);
    res.redirect('/app/catways');
  } catch (err) {
    next(err);
  }
});

module.exports = router;

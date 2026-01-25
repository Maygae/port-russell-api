// src/routes/authRoutes.js
// Routes d'authentification (login / logout)

const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User');

const router = express.Router();

/**
 * POST /auth/login
 * Body : { email, password }
 * Si OK : crée une session et redirige vers /dashboard.
 */
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).send('email et password sont obligatoires');
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).send('Identifiants invalides');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).send('Identifiants invalides');
    }

    // Stocker les infos dans la session
    req.session.userId = user._id;
    req.session.userRole = user.role;
    req.session.username = user.username;
    req.session.userEmail = user.email;

    // Redirection vers le tableau de bord
    res.redirect('/dashboard');
  } catch (err) {
    next(err);
  }
});

/**
 * GET /auth/logout (ou POST si tu préfères)
 * Détruit la session puis redirige vers la page d'accueil.
 */
router.get('/logout', (req, res, next) => {
  req.session.destroy(err => {
    if (err) {
      return next(err);
    }
    res.clearCookie('connect.sid');
    res.redirect('/');
  });
});

module.exports = router;

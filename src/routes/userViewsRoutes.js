const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Même middleware que pour les autres vues
function requireAuth(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.redirect('/');
  }
  next();
}

// LISTE : GET /app/users
router.get('/users', requireAuth, async (req, res, next) => {
  try {
    const users = await User.find().sort({ email: 1 });

    const user = {
      username: req.session.username,
      email: req.session.userEmail
    };

    res.render('users/index', {
      title: 'Utilisateurs',
      user,
      users
    });
  } catch (err) {
    next(err);
  }
});

// FORM NEW : GET /app/users/new
router.get('/users/new', requireAuth, (req, res) => {
  const user = {
    username: req.session.username,
    email: req.session.userEmail
  };

  res.render('users/new', {
    title: 'Nouvel utilisateur',
    user,
    errors: null
  });
});

// CREATE : POST /app/users
router.post('/users', requireAuth, async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    await User.create({ username, email, password });
    res.redirect('/app/users');
  } catch (err) {
    const user = {
      username: req.session.username,
      email: req.session.userEmail
    };
    res.render('users/new', {
      title: 'Nouvel utilisateur',
      user,
      errors: err.message
    });
  }
});

// FORM EDIT : GET /app/users/:id/edit
router.get('/users/:id/edit', requireAuth, async (req, res, next) => {
  try {
    const userDoc = await User.findById(req.params.id);
    if (!userDoc) return res.redirect('/app/users');

    const user = {
      username: req.session.username,
      email: req.session.userEmail
    };

    res.render('users/edit', {
      title: 'Modifier utilisateur',
      user,
      userToEdit: userDoc,
      errors: null
    });
  } catch (err) {
    next(err);
  }
});

// UPDATE : POST /app/users/:id
router.post('/users/:id', requireAuth, async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    const update = { username, email };
    if (password && password.trim() !== '') {
      update.password = password;
    }

    await User.findByIdAndUpdate(req.params.id, update);
    res.redirect('/app/users');
  } catch (err) {
    const userDoc = await User.findById(req.params.id);
    const user = {
      username: req.session.username,
      email: req.session.userEmail
    };
    res.render('users/edit', {
      title: 'Modifier utilisateur',
      user,
      userToEdit: userDoc,
      errors: err.message
    });
  }
});

// DELETE : POST /app/users/:id/delete
router.post('/users/:id/delete', requireAuth, async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.redirect('/app/users');
  } catch (err) {
    next(err);
  }
});

module.exports = router;

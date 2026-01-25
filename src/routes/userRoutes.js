// src/routes/userRoutes.js
// Routes REST pour la gestion des utilisateurs de la capitainerie

const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User');

const router = express.Router();
const SALT_ROUNDS = 10;

/**
 * GET /users
 * Récupérer tous les utilisateurs.
 */
router.get('/', async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ username: 1 });
    res.json(users);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /users/:email
 * Récupérer un utilisateur par son email.
 */
router.get('/:email', async (req, res, next) => {
  try {
    const email = req.params.email.toLowerCase();
    const user = await User.findOne({ email }).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    res.json(user);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /users
 * Créer un nouvel utilisateur.
 * Body JSON : { username, email, password, role? }
 */
router.post('/', async (req, res, next) => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        message: 'username, email et password sont obligatoires'
      });
    }

    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return res.status(409).json({ message: 'Email déjà utilisé' });
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(409).json({ message: 'Nom d’utilisateur déjà utilisé' });
    }

    // Hash du mot de passe
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const user = new User({
      username,
      email,
      password: hashedPassword,
      role: role || 'staff'
    });

    const saved = await user.save();
    const { password: _, ...userWithoutPassword } = saved.toObject();

    res.status(201).json(userWithoutPassword);
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /users/:email
 * Mettre à jour un utilisateur (par email).
 * Body JSON : { username?, password?, role? }
 */
router.put('/:email', async (req, res, next) => {
  try {
    const email = req.params.email.toLowerCase();
    const { username, password, role } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    if (username) user.username = username;
    if (typeof role === 'string') user.role = role;

    if (password) {
      user.password = await bcrypt.hash(password, SALT_ROUNDS);
    }

    const updated = await user.save();
    const { password: _, ...userWithoutPassword } = updated.toObject();

    res.json(userWithoutPassword);
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /users/:email
 * Supprimer un utilisateur par son email.
 */
router.delete('/:email', async (req, res, next) => {
  try {
    const email = req.params.email.toLowerCase();

    const deleted = await User.findOneAndDelete({ email });
    if (!deleted) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.json({ message: 'Utilisateur supprimé' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

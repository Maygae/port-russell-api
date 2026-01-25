// src/routes/catwayRoutes.js
// Routes REST pour la gestion des catways

/**
 * Routes REST pour les catways.
 * @module routes/catwayRoutes
 */

const express = require('express');
const Catway = require('../models/Catway');
const router = express.Router();

/**
 * GET /catways
 * Récupérer la liste de tous les catways.
 */
router.get('/', async (req, res, next) => {
  try {
    const catways = await Catway.find().sort({ number: 1 });
    res.json(catways);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /catways/:id
 * Récupérer un catway par son id MongoDB.
 */
router.get('/:id', async (req, res, next) => {
  try {
    const catway = await Catway.findById(req.params.id);
    if (!catway) {
      return res.status(404).json({ message: 'Catway non trouvé' });
    }
    res.json(catway);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /catways
 * Créer un nouveau catway.
 * Body JSON : { number, type, state }
 */
router.post('/', async (req, res, next) => {
  try {
    const { number, type, state } = req.body;

    if (!number || !type || !state) {
      return res
        .status(400)
        .json({ message: 'number, type et state sont obligatoires' });
    }

    const existing = await Catway.findOne({ number });
    if (existing) {
      return res
        .status(409)
        .json({ message: 'Un catway avec ce numéro existe déjà' });
    }

    const catway = new Catway({ number, type, state });
    const saved = await catway.save();

    res.status(201).json(saved);
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /catways/:id
 * Mettre à jour un catway.
 * Seule la description de l’état (state) est modifiable, pas le numéro ni le type.
 * Body JSON : { state }
 */
router.put('/:id', async (req, res, next) => {
  try {
    const { state } = req.body;

    if (!state) {
      return res
        .status(400)
        .json({ message: 'Le champ state est obligatoire' });
    }

    const catway = await Catway.findById(req.params.id);
    if (!catway) {
      return res.status(404).json({ message: 'Catway non trouvé' });
    }

    catway.state = state;

    const updated = await catway.save();
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /catways/:id
 * Supprimer un catway.
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const deleted = await Catway.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Catway non trouvé' });
    }
    res.json({ message: 'Catway supprimé' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

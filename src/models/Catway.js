// src/models/Catway.js
// Modèle Mongoose pour les catways du port Russell

/**
 * Modèle Catway.
 * Représente une place de port (catway) avec son numéro, son type (short/long)
 * et un texte décrivant l'état.
 * @module models/Catway
 */

const mongoose = require('mongoose');

const catwaySchema = new mongoose.Schema(
  {
    // Numéro du catway (1, 2, 3, ...)
    number: {
      type: Number,
      required: true,
      unique: true,
      min: 1
    },
    // Type court/long tel que fourni dans catways.json ("short" ou "long")
    type: {
      type: String,
      required: true,
      trim: true,
      enum: ['short', 'long'] // adapté à ton JSON
    },
    // Description libre de l'état (texte)
    state: {
      type: String,
      required: true,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

const Catway = mongoose.model('Catway', catwaySchema);

module.exports = Catway;

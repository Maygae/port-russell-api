// src/config/db.js
// Configuration et connexion à MongoDB via Mongoose

const mongoose = require('mongoose');

/**
 * Fonction asynchrone pour connecter Mongoose à MongoDB.
 * Utilise la variable d'environnement MONGODB_URI.
 * @async
 * @function connectDB
 * @returns {Promise<void>}
 */
const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('La variable MONGODB_URI est absente du fichier .env');
    }

    await mongoose.connect(process.env.MONGODB_URI);

    console.log('✅ Connexion MongoDB réussie');
  } catch (error) {
    console.error('❌ Erreur de connexion MongoDB :', error.message);
    process.exit(1); // Arrête le serveur si la base n'est pas accessible
  }
};

module.exports = connectDB;

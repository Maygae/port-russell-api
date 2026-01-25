// src/scripts/importData.js
// Script pour importer catways.json et reservations.json dans MongoDB

/**
 * Script d'import des données initiales dans MongoDB.
 * À lancer manuellement : node src/scripts/importData.js
 * @module scripts/importData
 */

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

const Catway = require('../models/Catway');
const Reservation = require('../models/Reservation');

// Chargement des variables d'environnement (.env)
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI manquant dans .env');
  process.exit(1);
}

/**
 * Connexion à MongoDB via Mongoose.
 * @returns {Promise<void>}
 */
async function connect() {
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connexion MongoDB (script import) OK');
}

/**
 * Lecture d'un fichier JSON dans le dossier /data.
 * @param {string} fileName - Nom du fichier (ex: "catways.json").
 * @returns {Array<object>} Tableau d'objets JSON.
 */
function readJsonData(fileName) {
  const filePath = path.join(__dirname, '..', '..', 'data', fileName);
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw);
}

/**
 * Import des données Catway et Reservation.
 * @returns {Promise<void>}
 */
async function importData() {
  try {
    await connect();

    // Nettoyage des collections avant import (optionnel mais pratique pour les tests)
    await Catway.deleteMany({});
    await Reservation.deleteMany({});
    console.log('🧹 Collections Catway et Reservation vidées');

    // ---------------------------
    // Import des CATWAYS
    // ---------------------------

    // Lecture du fichier catways.json
    const rawCatways = readJsonData('catways.json');

    // Mapping des champs du JSON vers le modèle Mongoose Catway
    // JSON : { catwayNumber, catwayType, catwayState }
    // Modèle : { number, type, state }
    const catwaysData = rawCatways.map((c) => ({
      number: c.catwayNumber,
      type: c.catwayType,      // "short" ou "long"
      state: c.catwayState     // texte descriptif
    }));

    const createdCatways = await Catway.insertMany(catwaysData);
    console.log(`✅ ${createdCatways.length} catways importés`);

    // Création d'une map number -> _id pour lier les réservations
    const catwayMapByNumber = new Map();
    createdCatways.forEach((c) => catwayMapByNumber.set(c.number, c._id));

    // ---------------------------
    // Import des RESERVATIONS
    // ---------------------------

    // ⚠️ Ici on suppose une structure de reservations.json :
    // [
    //   {
    //     "catwayNumber": 1,
    //     "customerName": "...",
    //     "boatName": "...",
    //     "startDate": "2025-01-10",
    //     "endDate": "2025-01-15",
    //     "status": "en_cours"
    //   },
    //   ...
    // ]
    //
    // Si ta structure est différente, on adaptera ce bloc.

    const rawReservations = readJsonData('reservations.json');

    const reservationsToInsert = rawReservations.map((res) => {
      const catwayId = catwayMapByNumber.get(res.catwayNumber);
      if (!catwayId) {
        throw new Error(
          `Aucun catway trouvé pour le numéro ${res.catwayNumber} dans reservations.json`
        );
      }

      return {
        catway: catwayId,
        customerName: res.customerName,
        boatName: res.boatName,
        startDate: res.startDate,
        endDate: res.endDate,
        status: res.status || 'en_cours'
      };
    });

    const createdReservations = await Reservation.insertMany(reservationsToInsert);
    console.log(`✅ ${createdReservations.length} réservations importées`);

    console.log('🎉 Import terminé avec succès');
    process.exit(0);
  } catch (err) {
    console.error('❌ Erreur lors de l’import :', err);
    process.exit(1);
  }
}

// Lancer le script si exécuté directement
if (require.main === module) {
  importData();
}

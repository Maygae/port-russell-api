// src/app.js
// Application principale Express pour le port de plaisance Russell

const path = require('path');
const express = require('express');
const session = require('express-session');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

// Chargement des variables d'environnement
dotenv.config();

// Routes vues (EJS)
const catwayViewsRoutes = require('./routes/catwayViewsRoutes');
const reservationViewsRoutes = require('./routes/reservationViewsRoutes');
const userViewsRoutes = require('./routes/userViewsRoutes');

// Modèles Mongoose
const Reservation = require('./models/Reservation');

// Routes API (JSON)
const catwayRoutes = require('./routes/catwayRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');

// -----------------------------
// Configuration et connexion DB
// -----------------------------
connectDB();

// -----------------------------
// Création de l'application Express
// -----------------------------
const app = express();
const PORT = process.env.PORT || 3000;

// -----------------------------
// Moteur de vues EJS
// -----------------------------
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// -----------------------------
// Middleware global
// -----------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'dev_session_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 1000 * 60 * 60 // 1 heure
    }
  })
);

// Fichiers statiques
app.use(express.static(path.join(__dirname, '..', 'public')));

// -----------------------------
// Swagger
// -----------------------------
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Port Russell',
      version: '1.0.0',
      description: 'Documentation de l’API REST du port de plaisance Russell'
    }
  },
  apis: [path.join(__dirname, 'routes', '*.js')]
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// -----------------------------
// Middleware d’authentification
// -----------------------------
function requireAuth(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.redirect('/');
  }
  next();
}

// -----------------------------
// Routes API (JSON)
// -----------------------------
app.use('/auth', authRoutes);
app.use('/catways', catwayRoutes);
app.use('/catways/:catwayId/reservations', reservationRoutes);
app.use('/users', userRoutes);

// -----------------------------
// Routes vues EJS
// -----------------------------

// Accueil
app.get('/', (req, res) => {
  res.render('home', { title: 'Accueil' });
});

// Dashboard
app.get('/dashboard', requireAuth, async (req, res, next) => {
  try {
    const user = {
      id: req.session.userId,
      role: req.session.userRole,
      username: req.session.username,
      email: req.session.userEmail
    };

    const today = new Date();

    const reservationsDb = await Reservation.find({
      endDate: { $gte: today }
    }).sort({ startDate: 1 });

    const reservations = reservationsDb.map(r => ({
      catwayNumber: r.catwayNumber,
      clientName: r.clientName,
      boatName: r.boatName,
      startDateFormatted: r.startDate.toLocaleDateString('fr-FR'),
      endDateFormatted: r.endDate.toLocaleDateString('fr-FR'),
      status: r.status || 'en_cours'
    }));

    const currentDate = today.toLocaleDateString('fr-FR');

    res.render('dashboard', {
      title: 'Tableau de bord',
      user,
      reservations,
      currentDate
    });
  } catch (err) {
    next(err);
  }
});

// Vues catways / réservations / utilisateurs sous /app/...
app.use('/app', catwayViewsRoutes);
app.use('/app', reservationViewsRoutes);
app.use('/app', userViewsRoutes);

// -----------------------------
// Middleware d'erreurs
// -----------------------------
app.use((err, req, res, next) => {
  console.error('Erreur serveur :', err);

  res.status(500).json({
    error: {
      message: err && err.message ? err.message : 'Erreur serveur interne',
      status: 500
    }
  });
});

// -----------------------------
// Démarrage du serveur
// -----------------------------
app.listen(PORT, () => {
  console.log(`✅ Serveur Express démarré sur http://localhost:${PORT}`);
  console.log(`📚 Documentation Swagger : http://localhost:${PORT}/api-docs`);
});

module.exports = app;

const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema(
  {
    catway: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Catway',
      required: true
    },
    customerName: {
      type: String,
      required: true,
      trim: true
    },
    boatName: {
      type: String,
      required: true,
      trim: true
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: ['en_cours', 'terminee', 'annulee'],
      default: 'en_cours'
    }
  },
  {
    timestamps: true
  }
);

const Reservation = mongoose.model('Reservation', reservationSchema);

module.exports = Reservation;

const mongoose = require('mongoose');
const Event = require('../models/Event');
require('dotenv').config();

async function clearEvents() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to database.');

    const result = await Event.deleteMany({});
    console.log(`Successfully deleted ${result.deletedCount} events from your calendar/database.`);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

clearEvents();

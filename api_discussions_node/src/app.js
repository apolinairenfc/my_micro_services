const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const discussionRoutes = require('./routes/discussion.routes');
const errorMiddleware = require('./middlewares/error.middleware');
const mongoose = require('mongoose');

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.get('/health/db', async (req, res) => {
  try {
    await mongoose.connection.db.listCollections().toArray();
    return res.status(200).json({ status: 'ok', db: 'ok' });
  } catch (error) {
    return res.status(500).json({ status: 'ok', db: 'error' });
  }
});

app.use(discussionRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'not_found' });
});

app.use(errorMiddleware);

module.exports = app;

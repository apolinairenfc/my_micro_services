const dotenv = require('dotenv');
const app = require('./app');
const connectDb = require('./config/db');

dotenv.config();

const port = process.env.PORT || 8002;
const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
  console.error('[config] MONGO_URI is not configured');
  process.exit(1);
}

connectDb(mongoUri).then(() => {
  app.listen(port, () => {
    console.log(`[server] API #2 running on http://localhost:${port}`);
  });
});

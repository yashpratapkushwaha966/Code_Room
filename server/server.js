require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log(`Rent Near Me API running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
  });

  // Fail loudly instead of leaving the process in a broken state
  process.on('unhandledRejection', (err) => {
    console.error(`Unhandled Rejection: ${err.message}`);
    server.close(() => process.exit(1));
  });
};

start();

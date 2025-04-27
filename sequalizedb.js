const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');
dotenv.config();


// Initialize Sequelize
const sequalizeDb = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: process.env.DB_DIALECT,
  logging:false
});

// Test the connection
const testConnection = async () => {
    try {
      await sequalizeDb.authenticate();
      console.log('Connection has been established successfully.');
    } catch (error) {
      console.error('Unable to connect to the database:', error);
    }
  };
  
  testConnection();

module.exports = sequalizeDb;
const { DataTypes } = require('sequelize');
const sequalizeDb = require('../sequalizedb'); // Adjust path if necessary

const Uploadvideo = sequalizeDb.define('uploadvideo', {
    id: {
        type: DataTypes.INTEGER, 
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
   
    video_name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false, // Ensure usernames are unique
    },
    duration: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false, // Ensure usernames are unique
    },
    size: {
        type: DataTypes.STRING,
        allowNull: false,
    },   
    status: {
        type: DataTypes.STRING,
        allowNull: false,
    },   
    path: {
        type: DataTypes.STRING,
        allowNull: false,
    },   
});

// Sync the model with the database
(async () => {
    try {
        await Uploadvideo.sync(); // Creates the table if it doesn't exist
        console.log('video table has been created (if it didn\'t already exist).');
    } catch (error) {
        console.error('Unable to create table:', error);
    }
})();

module.exports =Uploadvideo;

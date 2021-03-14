const Sequelize = require('sequelize');
module.exports = new Sequelize({
    dialect: 'sqlite',
    storage: 'db/database.sqlite',
    // logging: false,
    define: {
      timestamps: false
    },
    

    pool: {
      max: 5,
      min: 0,
      idle: 10000
    }
  });

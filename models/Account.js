const Sequelize = require('sequelize');
const sequelize = require('../db/dao');


class Account extends Sequelize.Model {
    // Custom class methods here

    static generateSalt() {
        return "SALT";
    }
}

Account.init({
    id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
    role: { type: Sequelize.ENUM('EMPLOYEE', 'ADMINISTRATOR', 'PAYROLL_MANAGER') },
    password: { type: Sequelize.STRING, field: 'password_hash', defaultValue: null },
    salt: { type: Sequelize.STRING, defaultValue: null },
    firstName: { type: Sequelize.STRING, field: 'first_name' },
    lastName: { type: Sequelize.STRING, field: 'last_name' },
    email: { type: Sequelize.STRING },
    phone: { type: Sequelize.STRING, optional: true, defaultValue: null },
    contactMethod: { type: Sequelize.ENUM("EMAIL", "PHONE"), field: 'contact_method' },
}, { sequelize, tableName: 'ACCOUNT', timestamps: false });

module.exports = Account;
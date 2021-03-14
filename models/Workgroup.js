const Sequelize = require('sequelize');
const db = require('../db/dao');

const Account = require('./Account');

class Workgroup extends Sequelize.Model {
    // Custom class methods here
}

Workgroup.init({
    id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: Sequelize.STRING, unique: true },
    description: { type: Sequelize.STRING },
    maxEmployees: { type: Sequelize.INTEGER, field: 'max_employees' }
}, { sequelize: db, tableName: 'WORKGROUP', timestamps: false, modelName: 'workgroup' });

/**
 * Returns all employees in a workgroup, including their:
 *  - ID [employee_id]
 *  - Full name [name]
 */
Workgroup.prototype.getEmployees = function() {
    return db.query(
        `SELECT employee_id, (first_name || ' ' || last_name) AS name
        FROM WORKGROUP_EMPLOYEE
        JOIN ACCOUNT on WORKGROUP_EMPLOYEE.employee_id = ACCOUNT.id
        WHERE workgroup_id = ${this.id}`)
        .then(res => {
            return res[0];
        });
}

Workgroup.prototype.assignEmployees = function(employees) {
    return new Promise((resolve, reject) => {
        if (employees.length == 0) return reject("No employees to assign the shift to");
    
        var queryString = `INSERT INTO WORKGROUP_EMPLOYEE(workgroup_id, employee_id) VALUES`;
        
        var workgroup_id = this.id;

        // Form querystring
        employees.forEach((emp_id) => {
            queryString += `("${workgroup_id}", "${emp_id}"),`;
        });

        // Remove last comma from querystring & execute
        queryString = queryString.substring(0, queryString.length-1);
        db.query(queryString)
        .then(() => resolve())
        .catch((err) => reject(err));
    });
}

module.exports = Workgroup;
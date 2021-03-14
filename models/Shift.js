const Sequelize = require('sequelize');
const db = require('../db/dao');
const moment = require('moment');

const Account = require('../models/Account');
const Workplace = require('../models/Workplace');

class Shift extends Sequelize.Model {
    // Custom class methods here
}

Shift.init({
    id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
    start: { type: Sequelize.TIME, field: 'shift_start' },
    end: { type: Sequelize.TIME, field: 'shift_end' },
    workplace: { type: Sequelize.INTEGER },
    workgroup: { type: Sequelize.INTEGER, defaultValue: null },
    employee: { type: Sequelize.INTEGER, defaultValue: null }
}, { sequelize: db, tableName: 'SHIFT', timestamps: false });

/**
 * Returns a list of all shifts assigned to an employee
 * (including associated workplace details)
 */
Shift.getShiftsForEmployee = function(empId, limit=1000) {
    return new Promise((resolve, reject) => {
        Shift.findAll({
            include: [
                { model: Account, where: {id: empId}, attributes: [] },
                { model: Workplace, attributes: ['id', 'name', 'boundaries'] }
            ],
            raw: false,
            order: [['start', 'ASC']],
            limit: limit,
            }
            
            ).then((shifts, err) => {
                if (err) reject(err);
                resolve(shifts);
        });
    });
}

/**
 * Returns a list of all shifts assigned to a workgroup
 * (including associated workplace details)
 */
Shift.getShiftsForWorkgroup = function(wgID, limit=1000) {
    return new Promise((resolve, reject) => { 
        Shift.findAll({
            include: [
                { model: Account, attributes: [] },
                { model: Workplace, attributes: ['id', 'name', 'boundaries'] }
            ],
            raw: false,
            order: [['start', 'DESC']],
            limit: limit,
            where: { workgroup: wgID }
            }
            
            ).then((shifts, err) => {
                if (err) reject(err);
                resolve(shifts);
        });
    });
}

/**
 * Returns the info required for the shift select screen
 * (i.e. shift start/end, associated workplace id/name)
 * 
 * Times are converted to a human readable format
 */
Shift.getSelectScreenInfo = function() {
    return new Promise((resolve, reject) => {
        // Only select shifts that have not been fully clocked-out by all of its employees
        db.query(`
        SELECT DISTINCT SHIFT.id, shift_start AS start, shift_end AS end, workplace, Workplace.name
        FROM SHIFT
        JOIN WORKPLACE on SHIFT.workplace = WORKPLACE.id
        JOIN SHIFT_EMPLOYEE on SHIFT.id = SHIFT_EMPLOYEE.shift_id
        WHERE clockout_time IS NULL
        ORDER BY start ASC
        `, { type: db.QueryTypes.SELECT}).then((shifts) => {
            resolve(shifts);
        }).catch((err) => reject(err));
    });
}

/**
 * Clocks into or out of a shift
 *  - status ("CLOCK_IN" or "CLOCK_OUT")
 *  - shift_id
 *  - employee_id
 *  - timestamp (in unix time)
 */
Shift.updateStatus = function(status, shift_id, employee_id, timestamp) {

    return new Promise(async (resolve, reject) => {
        db.query(`
        SELECT COUNT(clockin_time) AS count FROM SHIFT_EMPLOYEE
        WHERE employee_id="${employee_id}"
            AND clockin_time IS NOT NULL
            AND clockout_time IS NULL
            AND shift_id IS NOT "${shift_id}"
        `,{ type: db.QueryTypes.SELECT}).then((numShiftsClockedInto) => {

            // If the employee is already clocked into a shift, then reject the attempt
            if (numShiftsClockedInto[0].count > 0) {
                return reject("You can only be clocked into one shift at a time");
            }
            
            // Else proceed with the clock-in/out
            else {
                db.query(`
                UPDATE SHIFT_EMPLOYEE
                SET ${status} = ${timestamp}
                WHERE shift_id = "${shift_id}" AND employee_id = "${employee_id}";
                `)
                .then(() => resolve())
                .catch((err) => reject("Something went wrong: please try again"));
            }
        });
    });
}

Shift.prototype.assignEmployees = function(employees) {
    return new Promise((resolve, reject) => {
        if (employees.length == 0) return reject("No employees to assign the shift to");
    
        var queryString = `INSERT INTO SHIFT_EMPLOYEE(shift_id, employee_id) VALUES`;
        
        var shift_id = this.id;

        // Form querystring
        employees.forEach((emp_id) => {
            queryString += `("${shift_id}", "${emp_id}"),`;
        });

        // Remove last comma from querystring & execute
        queryString = queryString.substring(0, queryString.length-1);
        db.query(queryString)
        .then(() => resolve())
        .catch((err) => reject(err));
    });
}

module.exports = Shift;
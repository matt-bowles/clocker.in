const puppeteer = require('puppeteer');
const moment = require('moment');
const db = require('../db/dao');
const Handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');
const Mailer = require('./Mailer');
const Account = require('./Account');
const Workgroup = require('./Workgroup');


class ReportGenerator { }


Handlebars.registerHelper("formattime", function(timestamp) {
    return moment.unix(timestamp).format("Do MMM. hh:mma");
});

const filepath = './pdf/output.pdf';


ReportGenerator.generateEmployeeReport = function(req, res) {

    var id = req.body.id;
    var today = moment().add(0, 'week');
    var to = today.endOf('week').unix();
    var from = today.startOf('week').unix() - (60 * 60 * 24 * 6);

    db.query(`
        SELECT (first_name || ' ' || last_name) AS name, SHIFT.id, shift_start, shift_end, WORKPLACE.name AS workplace, clockin_time, clockout_time, 
        (clockout_time-clockin_time)/60/60 AS total_hours
        FROM SHIFT
        JOIN SHIFT_EMPLOYEE ON SHIFT.id = SHIFT_EMPLOYEE.shift_id
        JOIN ACCOUNT ON SHIFT_EMPLOYEE.employee_id = ACCOUNT.id
        JOIN WORKPLACE ON SHIFT.workplace = WORKPLACE.id
        WHERE employee_id = "${id}"
            AND shift_start >= "${from}"
            AND shift_end <="${to}"
            AND clockout_time IS NOT NULL;
        `, {type: db.QueryTypes.SELECT}).then( async (shifts) => {

            var total_sum = 0;
            shifts.forEach(shift => total_sum += shift.total_hours );

            // Get employee name
            var acc = await Account.findByPk(id, {attributes: ['firstName', 'lastName'], type: db.QueryTypes.SELECT});
            var name = `${acc.dataValues.firstName} ${acc.lastName}`;

            var data = {shifts: shifts, name: name, from: from, to: to, total_sum: total_sum};

            generateReport('employee', data, () => {
                var file = fs.createReadStream(filepath);
                var filename = `${moment.now()}.pdf`;           // What the file will be named when delievered, not the actual local name
                deliverReport(req, res, filename, file);
            })
        });
}

ReportGenerator.generateWorkgroupReport = function(req, res) {
    var id = req.body.id;
    var today = moment().add(0, 'week');
    var to = today.endOf('week').unix();
    var from = today.startOf('week').unix() - (60 * 60 * 24 * 6);

    db.query(`
    SELECT SHIFT.id, ACCOUNT.id AS id, (first_name || ' ' || last_name) AS name, SUM(clockout_time-clockin_time)/60/60 AS total_hours
    FROM SHIFT
    JOIN SHIFT_EMPLOYEE ON SHIFT.id = SHIFT_EMPLOYEE.shift_id
    JOIN ACCOUNT ON SHIFT_EMPLOYEE.employee_id = ACCOUNT.id
    WHERE workgroup = "${id}"
        AND shift_start >= "${from}"
        AND shift_end <="${to}"
        AND clockout_time IS NOT NULL
        GROUP BY employee_id
        `, {type: db.QueryTypes.SELECT}).then( async (shifts) => {

            var total_sum = 0;
            shifts.forEach(shift => total_sum += shift.total_hours );

            var workgroup = await Workgroup.findByPk(id, {attributes: ['name']}, {type: db.QueryTypes.SELECT});

            data = {shifts: shifts, workgroup: workgroup, from: from, to: to, total_sum: total_sum};

            generateReport('workgroup', data, () => {
                var file = fs.createReadStream(filepath);
                var filename = `${moment.now()}.pdf`;           // What the file will be named when delievered, not the actual local name
                deliverReport(req, res, filename, file);
            })
        });
}

async function generateReport(templateName, data, _callback) {

    // Generate report using puppeteer
    var templateHtml = fs.readFileSync(path.join(process.cwd(), `./pdf/templates/${templateName}.hbs`), 'utf8');
    var compiled = Handlebars.compile(templateHtml)(data);

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    await page.setContent(compiled);
    await page.emulateMediaType('screen');
    await page.pdf({path: filepath, format: 'A4', printBackground: true});
    await browser.close();

    _callback();
}

/**
 * Delivers an already generated report to the specified delivery method.
 * @param {*} req Should contain req.body.deliver_method as "DIRECT_DOWNLOAD" or "EMAIL"
 * @param {*} res 
 * @param {*} filename The name that the file will appear to have
 * @param {*} file 
 */
function deliverReport(req, res, filename, file) {

    switch(req.body.delivery_method) {
        case "DIRECT_DOWNLOAD":
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
            file.pipe(res);
            break;
        
        case "EMAIL":
            Mailer.sendReport(req, filename, filepath).then(() => {
                req.flash('success', "Report has been sent to your email.");
                res.redirect('reports');
            }).catch((err) => {
                req.flash('danger', "Report could not be sent. Please try again");
                res.redirect('reports');
            });
            break;
    }
}

module.exports = ReportGenerator;
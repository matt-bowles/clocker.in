const nodemailer = require('nodemailer');
const Account = require('./Account');
const db = require('../db/dao');
const Sequelize = require('sequelize');

let transporter = nodemailer.createTransport({
    service: "SendinBlue",
    
    // Email credentials
    auth: {
        user: "clocker.in66@gmail.com",
        pass: "LBtFA7avrdfJ2mn0"
    },
    authType: "PLAIN",

    // SMTP setup
    pool: true,
    host: "smtp-relay.sendinblue.com",
    port: 587,
});


class Mailer { }

Mailer.sendPasswordReset = function(usercontact) {
    
    Account.findOne({attributes: ['id', 'email', 'first_name', 'last_name'], where: Sequelize.or({ id: usercontact }, { email: usercontact }) }).then((acc) => {

        if (acc) {
            // Generate mail token
            // Yes, I know it's not unique - but it's good enough for the purposes of this application
            var token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
            
            // Insert token into db
            db.query(`INSERT INTO PASSWORD_RESET_URL(token, account_id, timestamp) VALUES("${token}", ${acc.id}, strftime('%s','now'))`)
            .then(() => {
                
                var mailOptions = {
                    from: "no-reply@clocker.in",
                    to: acc.email,
                    // to: "vifif61722@reptech.org",
                    subject: "Clocker.in - password reset",
                    text: `Follow this URL to reset your Clocker.in password - http://www.clocker.in/passwordreset?token=${token}`
                }
    
                transporter.sendMail(mailOptions, function(err, info) {
                    if (err) return console.log(err) 
                    console.log(`Email sent: ${info.response}`);
                });
            });
        }
    });
}

Mailer.sendReport = async function(req, filename, path) {
    var acc = await Account.findByPk(req.session.userSession.id, {attributes: ['email']});

    var mailOptions = {
        from: "no-reply@clocker.in",
        to: acc.email,
        subject: "Your Clocker.in report",
        text: "Attached is the report that you requested.",
        attachments: [{
            filename: filename,
            path: path,
            contentType: 'application/pdf'
        }]
    };

    return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (err, info) => {
            if (err) reject(err);
            console.log(`Email sent ${info.response}`);
            resolve()
        });
    });
}

module.exports = Mailer;
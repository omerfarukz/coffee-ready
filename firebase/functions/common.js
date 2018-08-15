const functions = require('firebase-functions');
const nodemailer = require('nodemailer');

const mailTransport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: functions.config().gmail.email,
        pass: functions.config().gmail.password,
    },
});

exports.sendEmail = function(subject, text) {
    console.log("sending mail");

    const mailOptions = {
        from: "COFFEE MACHINE <noreply@firebase.com>",
        to: functions.config().to_addresses.default,
        subject: subject,
        text: text
    };

    return mailTransport.sendMail(mailOptions).then(() => {
        return console.log("Mail sent");
    });
}
'use strict';
const functions = require('firebase-functions');
const nodemailer = require('nodemailer');
const admin = require('firebase-admin');
admin.initializeApp();

const mailTransport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: functions.config().gmail.email,
        pass: functions.config().gmail.password,
    },
});

const processors = [
    sendEmailProcessor
];

exports.onCurrent = functions.database.ref('/current').onWrite(event => {
    const before = event.before.val();
    const after = event.after.val();

    if (before.age === after.age) {
        console.log("Ignored data multipication", before.age)
        return null;
    }

    for (var i = 0; i < processors.length; i++) {
        var currentProcessor = processors[i];
        try {
            console.log("Invoking: ", processors);
            currentProcessor(before, after);
        }
        catch (err) {
            console.error(err, currentProcessor);
        }
        console.log("Invoked: ", processors);
    }

    // add to history
    var item = { value: after, duration: duration };
    return admin.database().ref('/log').push(item, (e) => { return null; });
});

function sendEmailProcessor(before, after) {
    if (before.state === 0 && after.state === 1) {
        const duration = Math.floor((after.at - before.at) / 60000.0); // minutes
        if (duration > 3) {
            const content = duration > 0 ? "Cups: " + duration + "+ (beta)" : "";
            sendEmail("READY", content);
        }
    }
}

function sendEmail(subject, text) {
    console.log("sending mail");

    const mailOptions = {
        from: "COFFEE MACHINE <noreply@firebase.com>",
        to: functions.config().to_addresses.default,
        subject: subject,
        text: text
    };

    return mailTransport.sendMail(mailOptions).then(() => {
        return console.log("Mail sent", TO_ADDRESSES.DEFAULT);
    });
}
'use strict';
const functions = require('firebase-functions');
const nodemailer = require('nodemailer');

const TO_ADDRESSES = {
    DEBUG: "yourmail@gmail.com",
    COFFEE_READY: "yourmail@gmail.com"
}

const gmailEmail = functions.config().gmail.email;
const gmailPassword = functions.config().gmail.password;
const mailTransport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: gmailEmail,
        pass: gmailPassword,
    },
});

// (BETA) This function is targetted to ESP8266_V2 skecth. So, it is not ready to use for now.
exports.onOfficeMachine = functions.database.ref('/machines/office/latest/durationInSeconds').onWrite(event => {
    const durationInSeconds = parseFloat(event.after.val());

    let extraInformation = "";
    const durationInMinutes = Math.floor(parseFloat(durationInSeconds) / 60);
    if(durationInMinutes > 0)
        extraInformation = "Cups: " + durationInMinutes+ "+ (beta)";

    sendEmail("Ready !", TO_ADDRESSES.COFFEE_READY, "READY", extraInformation);
});

exports.onWriteV7 = functions.database.ref('/state').onWrite(event => {
    const before = event.before.val();
    const after = event.after.val();
    console.log("before", "after", before, after);

    const parentRef = event.before.ref.parent;
    if (parseInt(after.prediction) === 40) { // HAZIR
        let extraInformation = "";
        const boilingIn = parseFloat(before.boilingIn);
        const boilingInMinutes = Math.floor(parseFloat(boilingIn) / 60);
        if(boilingInMinutes > 0)
            extraInformation = "Cups: " + boilingInMinutes + "+ (beta)";
        
        sendEmail("Ready !", TO_ADDRESSES.COFFEE_READY, "READY", extraInformation);
    }
});


function sendChangeMail(before, after) {
    const text = "Hey, values are " + before + " and " + after + " .";
    return sendEmail("change", TO_ADDRESSES.DEBUG, "Changed", text);
}

function sendEmail(reason, to, subject, text) {
    const mailOptions = {
        from: "COFFEE MACHINE <noreply@firebase.com>",
        to: to,
    };

    mailOptions.subject = subject;
    mailOptions.text = text;
    return mailTransport.sendMail(mailOptions).then(() => {
        return console.log("Mail sent", reason, TO_ADDRESSES);
    });
}
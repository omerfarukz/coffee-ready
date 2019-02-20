const functions = require('firebase-functions');
const nodemailer = require('nodemailer');

const mailTransport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: functions.config().gmail.email,
        pass: functions.config().gmail.password,
    },
});

// both of parameters are required
exports.sendEmail = function (subject, text) {
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

// both of parameters are required
exports.sendPush = function (title, text) {
    try {
        //pushbullet
        var request = require('request');
        const options = {
            url: 'https://api.pushbullet.com/v2/pushes',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Access-Token': functions.config().pushbullet.apikey
            },
            json: {
                "body": text,
                "title": title,
                "channel_tag": functions.config().pushbullet.app,
                "type": "note"
            }
        };

        request.post(options,
            (error) => {
                if(error)
                    console.error(error);            }
        );
    } catch (error) {
        console.error("pushbullet-error", error);
    }
}
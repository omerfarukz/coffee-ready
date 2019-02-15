const functions = require('firebase-functions');
const Push = require('pushover-notifications')
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
// TODO: create notification hub interface and add pushover, pushbullet and email to that
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
            (error, response, body) => {
                if(error)
                    console.error(error);
                //console.log(error, response, body);
            }
        );
    } catch (error) {
        console.error("pushbullet-error", error);
    }

    try {
        //pushover
        const isPushoverEnabled = functions.config().pushover.enabled;

        if (!isPushoverEnabled && isPushoverEnabled !== 1) {
            console.log("Pushover is not enabled. To enable this set pushover.enabled to 1");
            return;
        }

        var push = new Push({
            user: functions.config().pushover.user,
            token: functions.config().pushover.token
        });

        var message = {
            message: (text && text.length === 0 ? "-" : text),
            title: title,
            sound: 'magic'
        };

        push.send(message, (err, result) => {
            if (err)
                console.log(err, "pushover");

            console.log(result)
        });
    } catch (error) {
        console.error(error);
    }


}
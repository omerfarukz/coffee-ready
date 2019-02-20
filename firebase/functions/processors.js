const functions = require('firebase-functions');
const common = require('./common');

/* Processors are triggered when state is changed.
 * So, when the state is changed to 1 then you have a data about 0 state on [after]
 *
 * [before] === [after]
 *  |- age      ( ulong,     device's age in milliseconds               )
 *  |- at       ( unix time, timestamp of event occured in milliseconds )
 *  |- state    ( boolean,   1 = on, 0 = off                            )
 */

function logProcessor(before, after) {
    var duration = (after.at - before.at) / 60000.0;
    console.log("duration", "before", "after", duration.toFixed(2), before, after);
}

function readyToHaveProcessor(before, after) {
    if (before !== null && before.state === 0 && after.state === 1) {
        // get duration in minutes
        const minutes = (after.at - before.at) / 60000.0;
        // is it over x minutes in power on state
        if (minutes > 2.0) {
            const content = "Your coffee is ready to have."; // TODO:
            common.sendEmail("READY", content);
            common.sendPush("READY", content);
        }
        else {
            console.log("ignored for " + minutes + " min(s)");
        }
    }
}

function brewingProcessor(before, after) {
    if (before !== null && before.state === 1 && after.state === 0) {
        const minutes = (after.at - before.at) / 60000.0;
        if (minutes > 15.0) {
            const content = "The coffee machine began working again after a long while. It's probably brewing coffee. Keep calm and get ready.";

            common.sendEmail("BREWING", content);
            common.sendPush("BREWING", content);
        }
    }
}

function debugOverPush(before, after) {
    if (functions.config().app.debug === "1") {
        if (before !== null && after !== null) {
            const minutes = (after.at - before.at) / 60000.0;
            common.sendPush("State is changed " + before.state + " to " + after.state, "min(s): " + minutes);
        }
    }
}

const processors = [
    logProcessor,
    debugOverPush,
    readyToHaveProcessor,
    brewingProcessor
];

exports.all = processors;
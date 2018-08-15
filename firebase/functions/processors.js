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
    console.log("before", "after", before, after);
}

function readyToHaveProcessor(before, after) {
    if (before !== null && before.state === 0 && after.state === 1) {
        // get duration in minutes
        const minutes = Math.floor((after.at - before.at) / 60000.0);
        // is it over 3 minutes in power on state
        if (minutes > 3) {
            // use minutes as a prediction data
            const content = minutes > 0 ? "Cups: " + minutes + "+ " : "";
            common.sendEmail("READY", content);
            common.sendPush("READY", content);
        }
    }
}

const processors = [
    logProcessor,
    readyToHaveProcessor
];

exports.all = processors;
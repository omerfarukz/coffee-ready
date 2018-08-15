const common = require('./common');

function logProcessor(before, after) {
    console.log("before", "after", before, after);
}

function readyToHaveProcessor(before, after) {
    if (before.state === 0 && after.state === 1) {
        const duration = Math.floor((after.at - before.at) / 60000.0); // minutes
        if (duration > 3) { // is it over 3 minutes in power on state
            const content = duration > 0 ? "Cups: " + duration + "+ (beta)" : "";
            common.sendEmail("READY", content);
        }
    }
}

const processors = [
    logProcessor        ,
    readyToHaveProcessor
];

exports.all = processors;
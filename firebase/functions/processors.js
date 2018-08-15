const common = require('./common');

function dummyProcessor(before, after) {
    common.sendEmail("hello from dummyProcessor","");
}

function sendEmailProcessor(before, after) {
    if (before.state === 0 && after.state === 1) {
        const duration = Math.floor((after.at - before.at) / 60000.0); // minutes
        if (duration > 3) {
            const content = duration > 0 ? "Cups: " + duration + "+ (beta)" : "";
            common.sendEmail("READY", content);
        }
    }
}

const processors = [
    dummyProcessor      ,
    sendEmailProcessor
];

exports.all = processors;
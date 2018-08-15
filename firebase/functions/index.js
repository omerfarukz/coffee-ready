'use strict';
const common = require('./common');
const processors = require('./processors');

const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.onCurrentWrite = functions.database.ref('/current').onWrite(event => {
    const before = event.before.val();
    const after = event.after.val();

    if (before.age === after.age) {
        console.log("Ignored data multipication", before.age)
        return null;
    }

    console.log("Processors", processors.all);

    for (var i = 0; i < processors.all.length; i++) {
        var currentProcessor = processors.all[i];
        try {
            console.log("Invoking: ", currentProcessor);
            currentProcessor(before, after);
        }
        catch (err) {
            console.error(err, currentProcessor);
        }
        console.log("Invoked: ", currentProcessor);
    }
    
    // add to history
    var item = { value: after, duration: (after.at - before.at) };
    return admin.database().ref('/log').push(item, (e) => { return null; });
});
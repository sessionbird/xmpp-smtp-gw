'use strict';

var Client = require('node-xmpp-client'),
    ltx = require('ltx'),
    fs = require('fs'),
    path = require('path');

var client = new Client({
    jid: 'me@example.com',
    password: 'me'
});

client.on('online', function (data) {
    console.log('Connected as ' + data.jid.user + '@' + data.jid.domain + '/' + data.jid.resource)

    var filecontent = fs.readFileSync(path.resolve(__dirname, './message.xml'));

    var stanza = ltx.parse(filecontent);
    client.send(stanza);

    // nodejs has nothing left to do and will exit
    client.end();
});

client.on('error', function (e) {
    console.error(e);
    process.exit(1);
});
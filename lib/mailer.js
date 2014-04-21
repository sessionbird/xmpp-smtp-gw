'use strict';

var util = require('util'),
    EventEmitter = require('events').EventEmitter,
    nodemailer = require("nodemailer"),
    JID = require('node-xmpp-core').JID,
    debug = require('debug')('smtp:mailer');

/**
 * Initialize your email transpor and send emails.
 * 
 * {
 *     tansport: 'SMTP',
 *     config: {
 *         host: "smtp.gmail.com", // hostname
 *         secureConnection: false, // use SSL
 *         port: 25, // port for secure SMTP
 *         auth: {
 *             user: "user@gmail.com",
 *             pass: "yourpasswort"
 *         }
 *     }
 * }
 */
var Mailer = function (options) {
    EventEmitter.call(this);

    this.options = options;
    
    this.smtptransport = null;

    if (options && options.mailer && options.mailer.transport && options.mailer.config) {
        this.smtptransport = nodemailer.createTransport(options.mailer.transport, options.mailer.config);
    } else {
        debug('mail transport is not configured');
    }
    
};

util.inherits(Mailer, EventEmitter);

/**
 * send a given mail
 *
 * e.g. setup e-mail data with unicode symbols
 *   var mail = {
 *       from: "Fred Foo ✔ <fred@example.com>", // sender address
 *       to: "john@example.com", // list of receivers
 *       subject: "Hello ✔", // Subject line
 *       text: "Hello world ✔", // plaintext body
 *       html: "<b>Hello world ✔</b>" // html body
 *   };
 */
Mailer.prototype.sendSmtp = function (mail) {

    if (this.smtptransport) {
        this.smtptransport.sendMail(mail, function (error, response) {
            if (error) {
                debug('message error: ' + error);
            } else {
                debug('message sent: ' + response.message);
            }
        });
    } else {
        debug('smpt transport is not initialized');
    }
    
};

Mailer.prototype.convertStanzaToMail = function (stanza) {
    var mail = {};

    // get the sender adress
    mail.from = this.options.sender;

    // try to extract the target email
    // get the local part and unescape the content
    mail.to = new JID(stanza.to).getLocal(true);

    // set the content
    if (stanza.subject) {
        mail.subject = stanza.subject;
    }

    // text content
    if (stanza.body) {
        mail.text = stanza.body;
    }

    // html content
    if (stanza.body) {
        mail.html = stanza.html;
    }

    debug('extracted content: ' + JSON.stringify(mail));
    return mail;
};


Mailer.prototype.stanza = function (stanza) {
    debug('recieved message: ' + stanza.root().toString());

    // check that we have a stanza, and it is a message
    if (stanza && stanza.is('message') && stanza.attrs.type !== 'error') {

        var data = {
            from: stanza.attrs.from,
            to: stanza.attrs.to,
            type: stanza.attrs.type
        };

        var subject = stanza.getChild('subject');
        if (subject) {
            data.subject = subject.text();
        }

        var body = stanza.getChild('body');
        if (body) {
            data.body = body.text();
        }

        var html = stanza.getChild('html');
        if (html) {
            var htmlbody = html.getChild('body');
            data.html = htmlbody.toString();
        }

        debug('emit stanza json: ' + JSON.stringify(data));
        this.emit('jsonstanza', data);

        var mail = this.convertStanzaToMail(data);
        this.sendSmtp(mail);


    } else {
        debug('stanza cannot be send');
    }
};


Mailer.prototype.stop = function () {
    this.smtptransport.close();
};

Mailer.prototype.chain = function (chainElement) {
    this.on('stanza',function(stanza){
        chainElement.stanza(stanza);
    });

    return chainElement;
};

module.exports = Mailer;

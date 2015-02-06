'use strict';

var util = require('util'),
  EventEmitter = require('events').EventEmitter,
  nodemailer = require('nodemailer'),
  JID = require('node-xmpp-core').JID,
  debug = require('debug')('smtp:mailer'),
  _ = require('lodash');

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

  if (options && options.mailer && options.mailer.transport === 'SMTP' && options.mailer.config) {
    this.smtptransport = nodemailer.createTransport(options.mailer.config);
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
Mailer.prototype.sendSmtp = function (data) {

  // clone data
  data = _.cloneDeep(data);

  var mail = {
    'from': this.options.sender,
    // try to extract the target email
    // get the local part and unescape the content
    'to': new JID(data.to).getLocal(true)
  };

  // remove X-Mailer header by default
  mail.xMailer = false;
  if (this.options.xMailer) {
    mail.xMailer = this.options.xMailer
  }

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

/**
 * extract stanza and generate a json object
 */
Mailer.prototype.stanza = function (stanza) {
  debug('recieved message: ' + stanza.root().toString());

  // check that we have a stanza, and it is a message
  if (stanza && stanza.is('message') && stanza.attrs.type !== 'error') {

    var data = {
      from: stanza.attrs.from,
      to: stanza.attrs.to,
      type: stanza.attrs.type
    };

    // extract optional headers
    if (stanza.attrs.replyTo) {
      data.replyTo = stanza.attrs.replyTo
    }

    if (stanza.attrs.inReplyTo) {
      data.inReplyTo = stanza.attrs.inReplyTo
    }

    if (stanza.attrs.references) {
      data.references = stanza.attrs.references
    }

    // get content
    var subject = stanza.getChild('subject');
    if (subject) {
      data.subject = subject.text();
    } else {
      subject = ''
    }

    var body = stanza.getChild('body');
    if (body) {
      data.text = body.text();
    }

    var html = stanza.getChild('html');
    if (html) {
      var htmlbody = html.getChild('body');
      data.html = htmlbody.toString();
    }

    // support inline XEP-0231: Bits of Binary attachments
    // http://xmpp.org/extensions/xep-0231.html
    var alternative = stanza.getChild('data');
    if (alternative) {
      data.alternatives = [{
        content: alternative.text(),
        contentType: alternative.attrs.type
      }]
    }

    debug('emit stanza json: ' + JSON.stringify(data));
    // emit event
    this.emit('message', data);

    // send email
    this.sendSmtp(data);

  } else {
    debug('stanza cannot be send');
  }
};


Mailer.prototype.stop = function () {
  this.smtptransport.close();
};

Mailer.prototype.chain = function (chainElement) {
  this.on('stanza', function (stanza) {
    chainElement.stanza(stanza);
  });

  return chainElement;
};

module.exports = Mailer;
'use strict';

var util = require('util'),
  EventEmitter = require('events').EventEmitter,
  debug = require('debug')('smtp:s2s'),
  S2Server = require('node-xmpp-server'),
  pem = require('pem'),
  Promise = require('bluebird');

/**
 * Implements a xmpp server-2-server dialback connection
 * accoring to XEP-0220: Server Dialback
 *
 * @see: http://xmpp.org/extensions/xep-0220.html
 */
var SmtpS2S = function (options) {
  EventEmitter.call(this);

  this.options = options;
  this.router = new S2Server.Router();
};

util.inherits(SmtpS2S, EventEmitter);

// load tls certificate or generate one
SmtpS2S.prototype.generateCert = function () {
  return new Promise(function (resolve, reject) {
    debug('generate certificate');
    pem.createCertificate({
      days: 100,
      selfSigned: true,
      organization: 'self.domain',
      organizationUnit: 'development',
      commonName: 'self.domain'

    }, function (err, keys) {
      if (err) {
        reject(err);
      } else {
        resolve(keys);
      }
    });
  });
};

SmtpS2S.prototype.configure = function () {
  debug('configure');
  var self = this;
  return new Promise(function (resolve, reject) {

    self.generateCert().then(function (keys) {
      debug('load creadentials');
      self.router.loadCredentials(
        self.domain,
        keys.serviceKey,
        keys.certificate);

      resolve();

    }).
    catch(function (err) {
      reject(err);
    });
  });
};

SmtpS2S.prototype.start = function () {
  debug('start');
  var self = this;
  return new Promise(function (resolve) {
    debug('start s2s router');

    // register route
    self.router.register(self.options.domain, function (stanza) {

      debug('got stanza: ' + stanza.toString());
      self.emit('stanza', stanza);

    });

    debug('server started');
    resolve(self);
  });
};

SmtpS2S.prototype.stop = function () {
  debug('stop');
  // nothing to do
};

SmtpS2S.prototype.chain = function (chainElement) {
  this.on('stanza', function (stanza) {
    chainElement.stanza(stanza);
  });

  return chainElement;
};

module.exports = SmtpS2S;
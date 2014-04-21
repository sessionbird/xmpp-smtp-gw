'use strict';

var util = require('util'),
    EventEmitter = require('events').EventEmitter,
    Component = require('node-xmpp-component'),
    Promise = require('bluebird'),
    debug = require('debug')('smtp:component');

/**
 * Implements a xmpp component according to 
 * XEP-0114: Jabber Component Protocol
 *
 * @see http://xmpp.org/extensions/xep-0114.html
 */
var SmtpComponent = function (options) {
    EventEmitter.call(this);
    this.component = new Component({
        jid: options.connection.jid,
        password: options.connection.password,
        host: options.connection.host,
        port: options.connection.port,
        reconnect: options.connection.reconnect
    });
};

util.inherits(SmtpComponent, EventEmitter);

SmtpComponent.prototype.configure = function () {
    debug('configure');
    return new Promise(function(resolve){
        // nothing to do here
        resolve();
    });
};

SmtpComponent.prototype.start = function () {
    debug('start');
    var self = this;
    return new Promise(function(resolve){

        // register event listener
        self.component.on('online', function () {

            debug('Component is online');

            self.component.on('stanza', function (stanza) {
                debug('got stanza: ' + stanza.toString());
                self.emit('stanza', stanza);
            });

        });

        self.component.on('offline', function () {
            debug('Component is offline');
        });

        self.component.on('connect', function () {
            debug('Component is connected');
        });

        self.component.on('reconnect', function () {
            debug('Component reconnects …');
        });

        self.component.on('disconnect', function (e) {
            debug('Component is disconnected', e);
        });

        self.component.on('error', function (e) {
            console.error(e);
            debug(e);
            // TODO emit error
        });

        resolve(self);
    });
};

SmtpComponent.prototype.stop = function () {
    debug('stop');
    this.component.end();
};

SmtpComponent.prototype.chain = function (chainElement) {
    this.on('stanza',function(stanza){
        chainElement.stanza(stanza);
    });

    return chainElement;
};

module.exports = SmtpComponent;
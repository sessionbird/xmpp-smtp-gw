# XMPP SMTP Gateway

A xmpp gateway to send emails from your xmpp messenger.

## Description

I needed a simple and lightweight xmpp -> smpt gateway, but could not find a good one. This module enables me to send simple emails right from my chat messenger.

## Architecture 

- No–frills
- Support for subject & body as specified in [RFC 3921](http://xmpp.org/rfcs/rfc3921.html#stanzas-extended) and [RFC 6121](http://tools.ietf.org/html/rfc6121#section-5.2)
- Support for html content: [XEP 0071](http://www.xmpp.org/extensions/xep-0071.html)
- Support for [XEP-0106: JID Escaping](http://xmpp.org/extensions/xep-0106.html) as email adress e.g.user@host.com is represented in a jid as user\40host.com@smtp.example.com
- Outbound SMTP gateway only
- No templating because we support XEP 0071
- Run as [XEP-0114: Jabber Component](http://xmpp.org/extensions/xep-0114.html) or [XEP-0220: Server Dialback](http://xmpp.org/extensions/xep-0220.html)

## Run it

    # install it as a global component
    npm install -g xmpp-smtp-gw
    xmpp-smtp-gw configfile

    # start it from the installation directory
    node bin/xmpp-smtp-gw config/component.json
    # start with debugging
    DEBUG=* node bin/xmpp-smtp-gw config/component.json

    # This project also ships with a `Procfile` and plays well 
    # with foreman 
    foreman start 

[foreman](http://ddollar.github.io/foreman/) enables you to generate upstart scripts for your node project. Further information is available at [UPSTART-EXPORT](http://ddollar.github.io/foreman/#UPSTART-EXPORT)

## Configuration

This module delivers as a XMPP component () or XMPP s2s component. Both components behave similar.

## Notes

Be aware that it this module does not generate different content types for images. Either use inline images via data urls or use external hosted images.

## Tests

### Grunt 

The gateway comes with jshint and mocha test. Just run 

    grunt test

### Vagrant

The integration with prosody is tested with vagrant and Ubuntu 12.04.

    vagrant up

This will:

 - Boot up Ubuntu 12.04
 - Install Prosody
 - Prepares Prosody to accept a component `smtp.example.com` (Prosody config) or talk with an domain `xmppsmtpgateway.com` (bind dns config) via a server-2-server connection.

Afterwards you need to add the following entry to your hosts file in `/etc/hosts`:

    192.168.55.10   example.com

Once you got this try to `ping example.com` and you should see a connection to 192.168.55.10. As a next step you need to configure the SMTP server in `config/component.json` and `config/s2s.json`. Just add the server and the mailbox credentials in `mailer.config`

Now we are ready to prepare the XMPP messages. Configure `test/client/component/message.xml` and `test/client/s2s/message.xml` with a proper target. e.g. change `romeo\40example.com@smtp.example.com` to `youremail@smpt.example.com`. The local part of the jid needs to be escaped according to [XEP-0106: JID Escaping](http://xmpp.org/extensions/xep-0106.html).

**Test the XMPP Component**

    vagrant ssh
    cd /vagrant
    foreman start

    # open a new terminal and start
    node test/client/component/send.js

**Test the XMPP Server-2-Server**

    # on your machine 
    DEBUG=* node bin/xmpp-smtp-gw config/s2s.json

    # open a new terminal and start
    node test/client/s2s/send.js

**Send messages from XMPP messenger**

If you would like to send emails directy from your xmpp client, configure the user `me@example.com` with the password `me` in your favorite XMPP messenger and send a message to `user\40host.com@smtp.example.com` (component) or `user\40host.com@xmppsmtpgateway.com` depending on the setup you use.

## Future features

- Thread support  

## Author

- Christoph Hartmann

## License

MIT

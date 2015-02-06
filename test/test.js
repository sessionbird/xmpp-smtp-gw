'use strict';

var assert = require('assert'),
  ltx = require('ltx'),
  fs = require('fs'),
  path = require('path'),
  stripJsonComments = require('strip-json-comments'),
  Mailer = require('../lib/mailer');

var config = null;

try {
  var filecontent = fs.readFileSync(path.resolve(__dirname, '../config/component.json'));
  var stripped = stripJsonComments(filecontent.toString('utf8'));
  config = JSON.parse(stripped);
} catch (err) {
  console.log('could not find file or parse the content:');
  console.error(err);
}

describe('XMPP SMTP Gateway', function () {

  /*
   * <message
   *    from='juliet@example.com/balcony'
   *    id='b4vs9km4'
   *    to='romeo@example.net'
   *    type='chat'
   *    xml:lang='en'>
   *  <body>Wherefore art thou, Romeo?</body>
   * </message>
   */
  it('base message', function (done) {

    var message = "\
        <message \
           from='juliet@example.com/balcony' \
           id='b4vs9km4' \
           to='romeo@example.net' \
           type='chat' \
           xml:lang='en'> \
         <body>Wherefore art thou, Romeo?</body> \
        </message>";

    var stanza = ltx.parse(message);

    var mailer = new Mailer(config);
    mailer.on('message', function (mail) {
      assert.equal(mail.from, 'juliet@example.com/balcony');
      assert.equal(mail.to, 'romeo@example.net');
      assert.equal(mail.type, 'chat');
      assert.equal(mail.text, 'Wherefore art thou, Romeo?');
      done();
    });
    mailer.stanza(stanza);
  });

  /*
   * <message
   *    from='juliet@example.com/balcony'
   *    id='z94nb37h'
   *    to='romeo@example.net'
   *    type='chat'
   *    xml:lang='en'>
   *  <body>Wherefore art thou, Romeo?</body>
   *  <body xml:lang='cs'>
   *     Pro&#x010D;e&#x017D; jsi ty, Romeo?
   *   </body>
   * </message>
   */
  it('multilang message', function (done) {
    var message = "\
        <message \
           from='juliet@example.com/balcony' \
           id='z94nb37h' \
           to='romeo@example.net' \
           type='chat' \
           xml:lang='en'> \
         <body>Wherefore art thou, Romeo?</body> \
         <body xml:lang='cs'> \
            Pro&#x010D;e&#x017D; jsi ty, Romeo? \
          </body> \
        </message>";

    var stanza = ltx.parse(message);

    var mailer = new Mailer(config);
    mailer.on('message', function (mail) {
      assert.equal(mail.from, 'juliet@example.com/balcony');
      assert.equal(mail.to, 'romeo@example.net');
      assert.equal(mail.type, 'chat');
      assert.equal(mail.text, 'Wherefore art thou, Romeo?');
      done();
    });
    mailer.stanza(stanza);
  });

  /*
   * <message
   *    from='juliet@example.com/balcony'
   *    id='c8xg3nf8'
   *    to='romeo@example.net'
   *    type='chat'
   *    xml:lang='en'>
   *  <subject>I implore you!</subject>
   *  <body>Wherefore art thou, Romeo?</body>
   * </message>
   */
  it('subject & body', function (done) {

    var message = "\
        <message \
           from='juliet@example.com/balcony' \
           id='c8xg3nf8' \
           to='romeo@example.net' \
           type='chat' \
           xml:lang='en'> \
         <subject>I implore you!</subject> \
         <body>Wherefore art thou, Romeo?</body> \
        </message>";

    var stanza = ltx.parse(message);

    var mailer = new Mailer(config);
    mailer.on('message', function (mail) {
      assert.equal(mail.from, 'juliet@example.com/balcony');
      assert.equal(mail.to, 'romeo@example.net');
      assert.equal(mail.type, 'chat');
      assert.equal(mail.subject, 'I implore you!');
      assert.equal(mail.text, 'Wherefore art thou, Romeo?');
      done();
    });
    mailer.stanza(stanza);

  });

  /*
   * <message
   *    from='juliet@example.com/balcony'
   *    to='romeo@example.net'
   *    type='chat'
   *    xml:lang='en'>
   *  <subject>I implore you!</subject>
   *  <subject xml:lang='cs'>
   *    &#x00DA;p&#x011B;nliv&#x011B; pros&#x00ED;m!
   *  </subject>
   *  <body>Wherefore art thou, Romeo?</body>
   *  <body xml:lang='cs'>
   *     Pro&#x010D;e&#x017E; jsi ty, Romeo?
   *  </body>
   *  <thread parent='e0ffe42b28561960c6b12b944a092794b9683a38'>
   *    0e3141cd80894871a68e6fe6b1ec56fa
   *  </thread>
   * </message>
   */

  it('subject & body & thread', function (done) {

    var message = "\
        <message \
           from='juliet@example.com/balcony' \
           to='romeo@example.net' \
           type='chat' \
           xml:lang='en'> \
         <subject>I implore you!</subject> \
         <subject xml:lang='cs'> \
           &#x00DA;p&#x011B;nliv&#x011B; pros&#x00ED;m! \
         </subject> \
         <body>Wherefore art thou, Romeo?</body> \
         <body xml:lang='cs'> \
            Pro&#x010D;e&#x017E; jsi ty, Romeo? \
         </body> \
         <thread parent='e0ffe42b28561960c6b12b944a092794b9683a38'> \
           0e3141cd80894871a68e6fe6b1ec56fa \
         </thread> \
        </message>";

    var stanza = ltx.parse(message);

    var mailer = new Mailer(config);
    mailer.on('message', function (mail) {
      assert.equal(mail.from, 'juliet@example.com/balcony');
      assert.equal(mail.to, 'romeo@example.net');
      assert.equal(mail.type, 'chat');
      assert.equal(mail.subject, 'I implore you!');
      assert.equal(mail.text, 'Wherefore art thou, Romeo?');
      done();
    });
    mailer.stanza(stanza);

  });

  /*
   * <message
   *    from='juliet@example.com/balcony'
   *    to='romeo@example.net'
   *    type='chat'
   *    xml:lang='en'>
   *  <body>Wherefore art thou, Romeo?</body>
   *  <html xmlns='http://jabber.org/protocol/xhtml-im'>
   *    <body xmlns='http://www.w3.org/1999/xhtml'>
   *      <p>Wherefore <span style='font-style: italic'>art</span>
   *      thou, <span style='color:red'>Romeo</span>?</p>
   *    </body>
   *  </html>
   * </message>
   */
  it('body & html', function (done) {

    var message = "\
        <message \
           from='juliet@example.com/balcony' \
           to='romeo@example.net' \
           type='chat' \
           xml:lang='en'> \
         <body>Wherefore art thou, Romeo?</body> \
         <html xmlns='http://jabber.org/protocol/xhtml-im'> \
           <body xmlns='http://www.w3.org/1999/xhtml'> \
             <p>Wherefore <span style='font-style: italic'>art</span> \
             thou, <span style='color:red'>Romeo</span>?</p> \
           </body>\
         </html> \
        </message>";

    var stanza = ltx.parse(message);

    var mailer = new Mailer(config);
    mailer.on('message', function (mail) {
      assert.equal(mail.from, 'juliet@example.com/balcony');
      assert.equal(mail.to, 'romeo@example.net');
      assert.equal(mail.type, 'chat');
      assert.equal(mail.text, 'Wherefore art thou, Romeo?');

      var html = "<body xmlns='http://www.w3.org/1999/xhtml'> \
             <p>Wherefore <span style='font-style: italic'>art</span> \
             thou, <span style='color:red'>Romeo</span>?</p> \
           </body>";

      // using ltx we need to have the exact whitespace, maybe we should
      // really parse the content to compare the pretty print of xml
      var expectedHtml = ltx.parse(html).toString();
      var recievedHtml = ltx.parse(mail.html).toString();

      assert.equal(recievedHtml, expectedHtml);

      done();
    });
    mailer.stanza(stanza);

  });

  /*
   * <message
   *    from='juliet@example.com/balcony'
   *    to='romeo@example.net'
   *    type='chat'
   *    xml:lang='en'>
   *  <subject>I implore you!</subject>
   *  <body>Wherefore art thou, Romeo?</body>
   *  <html xmlns='http://jabber.org/protocol/xhtml-im'>
   *    <body xmlns='http://www.w3.org/1999/xhtml'>
   *      <p>Wherefore <span style='font-style: italic'>art</span>
   *      thou, <span style='color:red'>Romeo</span>?</p>
   *    </body>
   *  </html>
   * </message>
   */
  it('subject & body & html', function (done) {

    var message = "\
        <message \
           from='juliet@example.com/balcony' \
           to='romeo@example.net' \
           type='chat' \
           xml:lang='en'> \
         <subject>I implore you!</subject> \
         <body>Wherefore art thou, Romeo?</body> \
         <html xmlns='http://jabber.org/protocol/xhtml-im'>\
           <body xmlns='http://www.w3.org/1999/xhtml'> \
             <p>Wherefore <span style='font-style: italic'>art</span> \
             thou, <span style='color:red'>Romeo</span>?</p> \
           </body> \
         </html> \
        </message>";

    var stanza = ltx.parse(message);

    var mailer = new Mailer(config);
    mailer.on('message', function (mail) {
      assert.equal(mail.from, 'juliet@example.com/balcony');
      assert.equal(mail.to, 'romeo@example.net');
      assert.equal(mail.type, 'chat');
      assert.equal(mail.subject, 'I implore you!');
      assert.equal(mail.text, 'Wherefore art thou, Romeo?');

      var html = "<body xmlns='http://www.w3.org/1999/xhtml'> \
             <p>Wherefore <span style='font-style: italic'>art</span> \
             thou, <span style='color:red'>Romeo</span>?</p> \
           </body>";

      // using ltx we need to have the exact whitespace, maybe we should
      // really parse the content to compare the pretty print of xml
      var expectedHtml = ltx.parse(html).toString();
      var recievedHtml = ltx.parse(mail.html).toString();

      assert.equal(recievedHtml, expectedHtml);

      done();
    });
    mailer.stanza(stanza);
  });

  it('psi message', function (done) {

    var message = "\
        <message id='aac0a' to='romeo\\40example.com.com@smtp.example.com' from='juliet@example.com/balcony' xmlns:stream='http://etherx.jabber.org/streams'>\
        <subject>I implore you!</subject>\
        <body>Wherefore art thou, Romeo?</body>\
        <nick xmlns='http://jabber.org/protocol/nick'>juliet</nick>\
        </message>";

    var stanza = ltx.parse(message);

    var mailer = new Mailer(config);
    mailer.on('message', function (mail) {
      assert.equal(mail.from, 'juliet@example.com/balcony');
      assert.equal(mail.to, 'romeo\\40example.com.com@smtp.example.com');
      assert.equal(mail.subject, 'I implore you!');
      assert.equal(mail.text, 'Wherefore art thou, Romeo?');

      done();
    });
    mailer.stanza(stanza);

  });
});
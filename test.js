var WhoisLight = require('./index.js');

var assert = require('assert');

describe('WhoisLight', function() {
  describe('#_nameToServer(name)', function() {
    it('passing undefined returns false', function() {
      assert(WhoisLight._nameToServer() === false);
    });

    it('nonexistant TLD return false', function() {
      assert(WhoisLight._nameToServer('test.eithan') === false);
    });

    it('valid domain yields a object response', function() {
      assert(typeof WhoisLight._nameToServer('example.com') === 'object');
    });
  });

  describe('#_formatResults(res)', function() {
    // result doesnt matter.
    var exampleResult = "Domain Name: example.com\r\nDomain Expiry: 34534534\r\nblerblerbbbbbbbbbbbbe erth rth tryh tyh bb\r\nsdfgdsgdsfgdg";

    it('should parse results sucesfully', function() {
      const parsed = WhoisLight._formatResults(exampleResult);
      assert(parsed['Domain Name'] == 'example.com');
      assert(parsed['Domain Expiry'] == '34534534');
      assert(parsed['_raw'] == exampleResult);
    });
  });

  describe('#lookup([options,] name)', function() {
    it('should return record for specified domain', async function() {
      const data = await WhoisLight.lookup('example.com');
      assert(data.includes('Domain Name: EXAMPLE.COM'));
    });

    it('should return record for specified domain, using format', async function() {
      const data = await WhoisLight.lookup({ format: true }, 'example.com');
      assert(data['Domain Name'] === 'EXAMPLE.COM');
    });
  });

  describe('#bulkLookup([options,] names)', function() {
    it('should return results for all domains', async function() {
      const data = await WhoisLight.bulkLookup(['example.com', 'example.org']);
      assert(typeof data['example.com'] !== 'undefined');
      assert(typeof data['example.org'] !== 'undefined');
    });
  });
});

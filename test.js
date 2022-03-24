var WhoisLight = require("./index.js");
var util = require("./util");

var assert = require("assert");

describe("util", function () {
  describe("#chunkArray", function () {
    it("should return 2 length array with each iteration containing 5 values", function () {
      const sample = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

      const chunked = util.chunkArray(sample, 5);

      assert(chunked[0][0] === 1);
      assert(chunked[0][1] === 2);
      assert(chunked[0][2] === 3);
      assert(chunked[0][3] === 4);
      assert(chunked[0][4] === 5);

      assert(chunked[1][0] === 6);
      assert(chunked[1][1] === 7);
      assert(chunked[1][2] === 8);
      assert(chunked[1][3] === 9);
      assert(chunked[1][4] === 10);
    });

    it("should return 3 length array", function () {
      const sample = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

      const chunked = util.chunkArray(sample, 5);

      assert(chunked[0][0] === 1);
      assert(chunked[0][1] === 2);
      assert(chunked[0][2] === 3);
      assert(chunked[0][3] === 4);
      assert(chunked[0][4] === 5);

      assert(chunked[1][0] === 6);
      assert(chunked[1][1] === 7);
      assert(chunked[1][2] === 8);
      assert(chunked[1][3] === 9);
      assert(chunked[1][4] === 10);

      assert(chunked[2][0] === 11);
    });

    it("should return 2d array with signle item in top level array", function () {
      const sample = [1, 2, 3];

      const chunked = util.chunkArray(sample, 5);

      assert(chunked.length === 1);
      assert(chunked[0][0] == 1);
      assert(chunked[0][1] == 2);
      assert(chunked[0][2] == 3);
    });
  });
});

describe("WhoisLight", function () {
  describe("#_nameToServer(name)", function () {
    it("passing undefined returns null", function () {
      assert(WhoisLight._nameToServer() === null);
    });

    it("nonexistant TLD return null", function () {
      assert(WhoisLight._nameToServer("test.eithan") === null);
    });

    it("valid domain yields a object response", function () {
      assert(typeof WhoisLight._nameToServer("example.com") === "object");
    });
  });

  describe("#_formatResults(res)", function () {
    // result doesnt matter.
    var exampleResult =
      "Domain Name: example.com\r\nDomain Expiry: 34534534\r\nblerblerbbbbbbbbbbbbe erth rth tryh tyh bb\r\nsdfgdsgdsfgdg";

    it("should parse results sucesfully", function () {
      const parsed = WhoisLight._formatResults(exampleResult);
      assert(parsed["Domain Name"] == "example.com");
      assert(parsed["Domain Expiry"] == "34534534");
      assert(parsed["_raw"] == exampleResult);
    });
  });

  describe("#lookup([options,] name)", function () {
    it("should return record for specified domain", async function () {
      const data = await WhoisLight.lookup("example.com");
      assert(data.includes("Domain Name: EXAMPLE.COM"));
    });

    it("should return record for specified domain, using format", async function () {
      const data = await WhoisLight.lookup({ format: true }, "example.com");
      assert(data["Domain Name"] === "EXAMPLE.COM");
    });
  });

  describe("#bulkLookup([options,] names)", function () {
    it("should return results for all domains", async function () {
      const data = await WhoisLight.bulkLookup(["example.com", "example.org"]);
      assert(typeof data["example.com"] !== "undefined");
      assert(typeof data["example.org"] !== "undefined");
    });

    it("should return formatted results for all domains", async function () {
      const data = await WhoisLight.bulkLookup({ format: true }, [
        "example.com",
        "example.org",
      ]);

      assert(typeof data["example.com"] === "object");
      assert.strictEqual(data["example.com"]["Domain Name"], "EXAMPLE.COM");

      assert(typeof data["example.org"] === "object");
      assert.strictEqual(data["example.org"]["Domain Name"], "EXAMPLE.ORG");
    });
  });
});

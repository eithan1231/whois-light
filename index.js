const { chunkArray } = require("./util");

const whoisServers = require("./servers.json");

const CRLF = "\r\n";
const LINE_BREAK = "\n";

const assert = require("assert");
const net = require("net");

class WhoisLight {
  /**
   * Gets the whois server associated with a domain name
   */
  static _nameToServer(name) {
    if (typeof name !== "string") {
      return null
    }

    const majorTldPosition = name.lastIndexOf('.');
    if (majorTldPosition === -1) {
      return null;
    }

    const majorTld = name.substring(majorTldPosition + 1);

    if (typeof whoisServers[majorTld] === 'undefined') {
      return null;
    }

    const whoisServer = whoisServers[majorTld].find(
      (whoisServer) => name.substring(name.length - whoisServer.tld.length) === whoisServer.tld
    );

    return whoisServer
  }

  /**
   * Handles the whois results returned by a whois server. Parses them. Makes
   * them feel pretty.
   */
  static _formatResults(res) {
    let ret = {};

    const lines = res.split(LINE_BREAK);

    for (const line of lines) {
      if (!line) {
        continue;
      }

      if (line.startsWith(">>>") && line.endsWith("<<<")) {
        break;
      }

      const keyEnd = line.indexOf(":");

      if (keyEnd < 0) {
        continue;
      }

      const key = line.substring(0, keyEnd).trim();

      const value = line.substring(keyEnd + 1).trim();

      if (!key || !value) {
        continue;
      }

      ret[key] = value;
    }

    // want it to be last thing
    ret["_raw"] = res;

    return ret;
  }

  /**
   * Lookups whois information on a particular domain name
   */
  static lookup(options, name) {
    if (typeof options === "string") {
      // Options was not passed. So we will assume first parameter is name.
      name = options;
    }

    // Options validation
    options = typeof options === "string" ? {} : options;
    options.timeout =
      typeof options.timeout === "undefined" ? 5000 : options.timeout;
    options.port = typeof options.port === "undefined" ? 43 : options.port;
    options.format =
      typeof options.format === "undefined" ? false : options.format;

    // Getting whois server information.
    const whoisServer = WhoisLight._nameToServer(name);
    if (!whoisServer) {
      return Promise.reject(new Error("Failed to lookup"));
    }

    const domainQuery =
      whoisServer.query === null
        ? name
        : whoisServer.query.replace("{name}", name);

    // Returning promise that does the whois network query
    return new Promise((resolve, reject) => {
      let buffer = "";

      // Create socket. Send initial query for whois record.
      const socket = net.createConnection(
        options.port,
        whoisServer.server,
        () => {
          // Send server query when connection is initiated
          socket.write(domainQuery + CRLF);
        }
      );

      // Set the socket encoding.
      socket.setEncoding("utf8");
      socket.setTimeout(options.timeout);

      // Received data event
      socket.on("data", (data) => {
        // As per specification, we send query and receive whois information.
        // This should do nothing but receive whois information.
        buffer += data;
      });

      socket.on("end", () => {
        // Specification says we have received all whois information when server
        // ends connection. In theory, we should have all our whois information
        // when this event occures.

        // fortmatting results
        socket.destroy();
        resolve(options.format ? WhoisLight._formatResults(buffer) : buffer);
      });

      // Error handling.
      socket.on("error", (err) => reject(err));

      // Server timeout.... rate limit, error, who knows?
      socket.on("timeout", () => {
        reject(new Error("Server timeout"));
      });
    });
  }

  /**
   * This will lookup bulk domain names in parallel, and return results once all
   * have returned. We RECOMMEND implementing your own parallel execution if
   * you are seeking absolute efficiency. But for simply tasks this function will
   * suffice.
   */
  static async bulkLookup(options, names) {
    if (typeof names === "undefined") {
      // Options was not passed. So we will assume first parameter is name.
      names = options;
    }

    options = typeof options === "string" ? {} : options;
    options.parellel =
      typeof options.parellel === "undefined" ? 100 : options.parellel;

    if (options.parellel > names.length) {
      // trying to start more processors than we need
      options.parellel = names.length;
    }

    // Where we store results. key is domain name, value is _formattedResults
    let results = {};
    let resultsCount = 0;

    const namesChunks = chunkArray(names, options.parellel);

    for (const namesChunk of namesChunks) {
      const resolvedNamesPromises = namesChunk.map((name) =>
        WhoisLight.lookup(options, name)
      );  

      const resolvedNames = await Promise.all(resolvedNamesPromises);

      for (const resolvedName of resolvedNames) {
        results[names[resultsCount++]] = resolvedName;
      }
    }

    return results;
  }
}

module.exports = WhoisLight;

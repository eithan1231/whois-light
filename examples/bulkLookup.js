const WhoisLight = require('../index.js');

// The domains we want to query, and options for the whois server
const domains = [
  'google.com',
  'example.com',
  'gmail.com',
  'facebook.com',
  'eithan.net',
  'eithan.me',
  'youtube.com',
  'wikipedia.org'
];

// Additional options to the query
const options = {
  // Whether or not we return a parsed key/value of the whois results
  format: true,

  // Set timeout to 10 seconds
  timeout: 10000,

  // Set the whois port, default is 43
  port: 43,

  // The amount of concurrent queries this can execute at a time. if our bulk
  // lookup, queries less than this number, this number will automaically be
  // set to the amount of domaines we are looking up.
  parellel: 100
};

(async () => {
  try {
    // Starting a simple benchmark
    const startTime = Date.now();

    // Fetching our bulk information from server
    const whoisResults = await WhoisLight.bulkLookup(options, domains);

    // Calculating and logging benchmark
    const endTime = Date.now();
    console.log(`Query successfully completed in ${endTime - startTime}ms`);

    // Printing results
    for (const domainLookup in whoisResults) {
      if(whoisResults[domainLookup]) {
        // To access any of the whois information on a particular domain, use
        // whoisResults[domainLookup]
        console.log(`Successfully queried information for ${domainLookup} who is registered with ${whoisResults[domainLookup]['Registrar']}`);
      }
    }
  }
  catch {
    console.log('Failed to query whois information');
    console.log('Ensure a network connection is established.');
  }
})();

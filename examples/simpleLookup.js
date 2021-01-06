const WhoisLight = require('../index.js');

// The domain we want to query, and options for the whois server
const domain = 'google.com';

// Additional options to the query
const options = {
  // Whether or not we return a parsed key/value of the whois results
  format: true,

  // Set timeout to 10 seconds
  timeout: 10000,

  // Set the whois port, default is 43
  port: 43,
};

(async () => {
  try {
    // Fetching whois information from server
    const whoisResults = await WhoisLight.lookup(options, domain);

    // Printing some information about this domain. Including the name, the
    // registar, when it is dur to expire, and the email address for reporting
    // abuse.
    console.log(`The domain ${whoisResults['Domain Name'].toLowerCase()} is registered with ${whoisResults['Registrar']}`);
    console.log(`Domain is due to expire, ${whoisResults['Registry Expiry Date']}`);
    console.log(`For abuse please contact, ${whoisResults['Registrar Abuse Contact Email']}`);
  }
  catch {
    console.log('Failed to query whois information');
    console.log('Ensure a network connection is established.');
  }
})();

const fs = require('fs');

const main = async () => {
  const content = fs.readFileSync('../servers.json', { encoding: 'utf-8' });
  const contentParsed = JSON.parse(content);

  const outputObject = {};

  const addToOutputObj = (majorTld, fullTld, record) => {
    if(typeof outputObject[majorTld] === 'undefined') {
      outputObject[majorTld] = [];
    }

    outputObject[majorTld].push({
      tld: fullTld,
      ...record
    });
  };

  const tlds = Object.keys(contentParsed);
  for(const tld of tlds) {
    const seperatorPosition = tld.lastIndexOf('.');

    const record = contentParsed[tld];

    if(seperatorPosition === -1) {
      addToOutputObj(tld, tld, record);
      continue;
    } 

    const majorDomain = tld.substring(seperatorPosition + 1);
    addToOutputObj(majorDomain, tld, record);
  }

  fs.writeFileSync('../servers.tmp.json', JSON.stringify(outputObject));
}

main()
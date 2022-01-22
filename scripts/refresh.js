/**
 * Script for running a domain refresh of the servers.json file
 */

const fs = require("fs");
const axios = require("axios");

const currentWhoisDomains = "../servers.json";
const icannRootZoneDatabase = "https://www.iana.org/domains/root/db";
const icannRootZoneDatabasePrefix = "https://www.iana.org";
const domainQueryOverrides = {
  ".com": "DOMAIN {name}",
  ".net": "DOMAIN {name}",
};

const fetchRootZones = async () => {
  const { data } = await axios.get(icannRootZoneDatabase);

  const rootZones = [];

  const spanString = '<span class="domain tld">';

  let lastPosition = 5000;
  while (true) {
    lastPosition = data.indexOf(spanString, lastPosition + 1);

    if (lastPosition < 0) {
      break;
    }

    const lineEnd = data.indexOf("\n", lastPosition);

    // <span class="domain tld"><a href="/domains/root/db/africa.html">.africa</a></span></td>\n
    const subject = data.substring(lastPosition, lineEnd);

    const href = subject.substring(
      subject.indexOf("/domains/root/db/"),
      subject.lastIndexOf('">')
    );

    const name = subject.substring(
      subject.indexOf('.html">') + 7,
      subject.indexOf("</a>")
    );

    rootZones.push({
      domain: name,
      url: `${icannRootZoneDatabasePrefix}${href}`,
    });
  }

  return rootZones;
};

const fetchRootZoneParsed = async (url, domain) => {
  const { data } = await axios.get(url, {
    headers: {
      "User-Agent":
        " Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36",
      Referer: icannRootZoneDatabase,
    },
  });

  const whoisServerString = "<b>WHOIS Server:</b>";
  const whoisServerTagPosition = data.indexOf(whoisServerString);
  const whoisServerTagPositionEnd = data.indexOf(
    "\n",
    whoisServerTagPosition + whoisServerString.length
  );

  let whoisServer = null;
  let whoisServerQuery = null;

  if (whoisServerTagPosition >= 0) {
    whoisServer = data.substring(
      whoisServerTagPosition + whoisServerString.length,
      whoisServerTagPositionEnd
    ).trim();

    whoisServerQuery =
      domainQueryOverrides[domain.toLowerCase()] ?? null;
  }

  return {
    domain,
    whoisServer,
    whoisServerQuery,
  };
};

const scrapeRootZones = async () => {
  const rootZones = await fetchRootZones();

  const rootZonesFetched = await Promise.all(
    rootZones.map((zoneContext) =>
      fetchRootZoneParsed(zoneContext.url, zoneContext.domain)
    )
  );

  return rootZones.map(({ domain, url }, index) => ({
    domain,
    url,
    ...rootZonesFetched[index],
  }));
};

const main = async () => {
  const currentWhoisDomainsContent = JSON.parse(
    fs.readFileSync(currentWhoisDomains, {
      encoding: "utf-8",
    })
  );

  const scrapedZones = await scrapeRootZones();
  const scrapedZonesFormatted = scrapedZones.reduce(
    (previousValue, currentValue) => {
      return {
        [currentValue.domain.substring(1).toLowerCase()]: {
          server: currentValue.whoisServer,
          query: currentValue.whoisServerQuery,
        },
        ...previousValue,
      };
    },
    {}
  );

  console.log(scrapedZonesFormatted);

  const updatedWhoisDomainsContent = {};

  // find those in the old list, not currently in the new list.
  Object.keys(currentWhoisDomainsContent).forEach((domainName) => {
    if (scrapedZonesFormatted[domainName] === undefined) {
      updatedWhoisDomainsContent[domainName] = {
        ...currentWhoisDomainsContent[domainName],
      };
    }
  });

  // Add all that are not already added.
  Object.keys(scrapedZonesFormatted).forEach((domainName) => {
    if (updatedWhoisDomainsContent[domainName] === undefined) {
      updatedWhoisDomainsContent[domainName] = {
        ...scrapedZonesFormatted[domainName],
      };
    }
  });

  Object.values(updatedWhoisDomainsContent).forEach((domainName) => {
    if(updatedWhoisDomainsContent[domainName].server) {
      updatedWhoisDomainsContent[domainName].server = updatedWhoisDomainsContent[domainName].server.trim();
    }

    if(updatedWhoisDomainsContent[domainName].query) {
      updatedWhoisDomainsContent[domainName].query = updatedWhoisDomainsContent[domainName]?.query.trim();
    }
  });

  fs.writeFileSync(
    currentWhoisDomains,
    JSON.stringify(updatedWhoisDomainsContent, null, 2)
  );

  process.exit();
};

main();

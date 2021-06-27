# Whois Light

whois-light is an extremely lightweight whois client, supporting hundreds of top-level-domains, using absolutely 0 packages.

# Example

The following example will do a quick whois lookup for example.com and print the output.

```javascript
const WhoisLight = require("whois-light");

// WhoisLight.lookup returns a native promise
WhoisLight.lookup("example.com")
  .then(function (whois) {
    // process raw whois information here
    console.log(whois);
  })
  .catch(console.error);

// Alternatively we can format the whois results from the server, and assort them into key values to easier process them.
// Please note that you may experience issues for duplicate keys, they will be overwritten.
WhoisLight.lookup({ format: true }, "example.com")
  .then(function (whois) {
    // process raw whois information here
    console.log("Domain name is, " + whois["Domain Name"]);
    console.log("Domain is due to expire, " + whois["Registry Expiry Date"]);

    // to access raw whois data from our formatted data, access the _raw key, for exmaple...
    // console.log(whois['_raw']);
  })
  .catch(console.error);
```

## WhoisLight.lookup([options, ] name)

This function will do a simple whois lookup on a particular domain. See example for simple guide on this method.

### [options ,]

Object

`format` - Whether or not you want to use the key/value formatting for returned whois data. See example. Default false, returns raw whois by default.

`timeout` - Socket timeout, measured in milliseconds. Default 5000

`port` - Whois underlying port. Default 43

### name

Domain name to query

### @returns

This function returns a promise. The resolve of this promise varies on the options.format. If this is set to true, the resolve will be a key/value object, otherwise the raw whois information.

## WhoisLight.bulkLookup([options, ] names)

### [options ,]

Object, this method implements the same options as WhoisLight.lookup options, with the addition of:

`parellel` - How many parellel workers will be fetching the whois queries.

### names

This is an array of all the domains you wish to lookup. Has no limitations

### @returns

A promise. The resolve of this promise resolves to an object. The keys of the object are domain names, and the values of the domain keys, depend on format. See above function for informaiton on format.

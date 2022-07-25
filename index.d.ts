export interface WhoisLightServerInfo {
  server: string;
  query: string | null;
}

export interface WhoisLightOptions {
  /**
   * The default timeout period in milliseconds.
   * 
   * Default: 5000
   */
  timeout?: number;

  /**
   * The default Whois UDP port.
   * 
   * Default: 43
   */
  port?: number;

  /**
   * Boolean indicating whether or not we want to format the response.
   * 
   * Default: false
   */
  format?: boolean;

  /**
   * The amount of requests that should be preformed in parallel. This is only applicable to bulkLookups.
   * 
   * Default: 100
   */
  parellel?: number;
}

export type WhoisLightRawResult = string;
export type WhoisLightFormattedResult = Record<string, string>;
export type WhoisLightBulkResult<T> = Record<string, T>

export default class WhoisLight {
  /**
   * TLD to whois server mapping.
   */
  static _nameToServer(name: string): WhoisLightServerInfo | null;
  
  /**
   * Formats raw whois response to a formatted response.
   */
  static _formatResults(res: WhoisLightRawResult): WhoisLightFormattedResult;
  
  /**
   * Performs a whois lookup for the specified domain name. Returning the raw or formatted results depending on options.formatted.
   * @param options Optional options parameter.
   * @param name Domain name to preform whois lookup on.
   * @returns Conditionally raw result or formatted result depending on options.format
   */
  static lookup(options: WhoisLightOptions, name: string): Promise<WhoisLightRawResult | WhoisLightFormattedResult>;

  /**
   * Performs a whois lookup for the specified domain name. Returning the raw whois results.
   * @param name Domain name to preform whois lookup on.
   */
  static lookup(name: string): Promise<WhoisLightRawResult>;

  /**
   * Performs a bulk whois lookup for several specified domain names. Returning the raw whois results.
   * @param options Optional options parameter.
   * @param names Domain names to preform lookup on.
   * @returns Conditionally raw result or formatted result depending on options.format
   */
   static bulkLookup(options: WhoisLightOptions, names: string[]): Promise<WhoisLightBulkResult<WhoisLightRawResult | WhoisLightFormattedResult>>;

   /**
    * Performs a bulk whois lookup for several specified domain names. Returning the raw whois results.
    * @param names Domain names to preform lookup on.
    */
   static bulkLookup(names: string[]): Promise<WhoisLightBulkResult<WhoisLightRawResult>>;
}
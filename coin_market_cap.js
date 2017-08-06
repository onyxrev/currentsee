const _        = require('lodash');
const Client   = require('node-rest-client').Client;
const client   = new Client();

const BASE_URL = "https://api.coinmarketcap.com";
const VERSION  = "v1";
const TICKER   = "ticker";
const GET      = "get";
const PRICE    = "price";
const SYMBOL   = "symbol";
const VERBATIM_KEYS = ["id", "symbol", "percent_change_24h"];

const DEFAULT_HEADERS = {
  "Content-Type": "application/json"
};

const ENDPOINTS = {
  ticker: "/ticker"
};

module.exports = class CoinMarketCap {
  constructor(options = {}) {
    this.currencySymbols    = options.currencySymbols;
    this.fiatCurrencySymbol = options.fiatCurrencySymbol;
  }

  getTicker(callback){
    get(
      TICKER,
      {
        convert: this.fiatCurrencySymbol
      },
      allCurrencies => callback(this.normalizeCurrencies(allCurrencies))
    );
  }

  shouldIncludeCurrency(currencyData){
    return _.includes(this.currencySymbols, currencyData.symbol);
  }

  normalizeCurrencies(allCurrencies){
    return _.chain(allCurrencies).
             filter(this.shouldIncludeCurrency.bind(this)).
             map(this.normalizeCurrency.bind(this)).
             keyBy(SYMBOL).
             valueOf();
  }

  normalizeCurrency(currencyData){
    return _.chain(currencyData).
             pick(VERBATIM_KEYS).
             set(PRICE, this.currencyDataPrice(currencyData)).
             valueOf();
  }

  currencyDataPrice(currencyData){
    return currencyData[`price_${this.fiatCurrencySymbol.toLowerCase()}`];
  }
};

/* private */

const get = (...args) => {
  return request(GET, ...args);
};

const request = (method, endpointName, parameters, callback) => {
  return client[method](
    urlForEndpoint(endpointName),
    {
      parameters,
      headers: DEFAULT_HEADERS
    },
    callback
  );
};

const urlForEndpoint = (endpointName) => {
  return fullURL(
    ENDPOINTS[endpointName]
  );
};

const fullURL = (path) => {
  return [
    BASE_URL,
    VERSION,
    path
  ].join("/");
};

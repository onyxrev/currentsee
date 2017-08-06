const Client   = require('node-rest-client').Client;
const client   = new Client();
const BASE_URL = "https://api.coinmarketcap.com";
const VERSION  = "v1";
const TICKER   = "ticker";
const GET      = "get";
const PRICE    = "price";
const VERBATIM_KEYS = ["id", "name", "price_btc", "rank", "symbol", "percent_change_1h", "percent_change_24h", "percent_change_7d"];

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
      (allCurrencies) => {
        callback(normalizeCurrencies(allCurrencies, this.fiatCurrencySymbol, this.currencySymbols));
      }
    );
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

const normalizeCurrencies = (allCurrencies, fiatCurrencySymbol, currencySymbols) => {
  return filterCurrencies(allCurrencies, currencySymbols).
    map(currencyData => normalizeCurrency(fiatCurrencySymbol, currencyData));
};

const filterCurrencies = (allCurrencies, currencySymbols) => {
  if (!currencySymbols) return allCurrencies;

  return allCurrencies.filter((currencyData) => {
    return currencySymbols.indexOf(currencyData.symbol) !== -1;
  });
};

const normalizeCurrency = (fiatCurrencySymbol, currencyData) => {
  const out = {};

  VERBATIM_KEYS.forEach((key) => {
    out[key] = currencyData[key];
  });

  return Object.assign(out, {
    price: currencyDataPrice(fiatCurrencySymbol, currencyData)
  });
};

const currencyDataPrice = (fiatCurrencySymbol, currencyData) => {
  return currencyData[`price_${fiatCurrencySymbol.toLowerCase()}`];
};

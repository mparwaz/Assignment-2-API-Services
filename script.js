/*
  Weather & Currency Converter App
  Author: Muhammad Parwaz
  Date: August 12, 2025

  Tools & References:
  - Weather data fetched using WeatherAPI.com current weather endpoint.
  - Currency exchange rates fetched from exchangerate-api.com.
  - LocalStorage caching with rate limiting to reduce API calls.
  - Used ChatGPT (OpenAI) for assistance in structuring API calls, error handling, and localStorage caching logic.
  - WeatherAPI docs: https://www.weatherapi.com/docs/
  - ExchangeRate-API docs: https://www.exchangerate-api.com/docs/overview
  - MDN Fetch API reference: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
*/

// === API Keys (Replace with env if deploying) ===
const WEATHER_API_KEY = "c484e3c5a2e5434db7d183314250408";
const EXCHANGE_API_KEY = "0644161d677a6c0835698940";

// === Rate Limits ===
const RATE_LIMIT = 60000; // 60 seconds

document.addEventListener("DOMContentLoaded", () => {
  fetchWeather();
  fetchCurrencies();
});

// ==== Weather Section ====
function fetchWeather() {
  const lastFetch = localStorage.getItem("weatherTimestamp");
  const now = Date.now();

  if (lastFetch && now - lastFetch < RATE_LIMIT) {
    document.getElementById("weather-data").innerHTML = localStorage.getItem("weather");
    return;
  }

  // WeatherAPI.com current weather endpoint
  const url = `https://api.weatherapi.com/v1/current.json?key=${WEATHER_API_KEY}&q=Calgary&aqi=no`;

  fetch(url)
    .then(res => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    })
    .then(data => {
      console.log("WeatherAPI.com response:", data);

      const temp = data.current.temp_c;
      const desc = data.current.condition.text;
      const time = data.location.localtime;

      const weatherHTML = `
        <p>Temperature: ${temp}°C</p>
        <p>Description: ${desc}</p>
        <p>Local Time: ${time}</p>
      `;

      document.getElementById("weather-data").innerHTML = weatherHTML;
      localStorage.setItem("weather", weatherHTML);
      localStorage.setItem("weatherTimestamp", now);
    })
    .catch(err => {
      console.error("Weather fetch error:", err);
      document.getElementById("weather-data").innerText = "Weather data unavailable.";
    });
}

// ==== Currency Exchange Section ====
function fetchCurrencies() {
  const lastFetch = localStorage.getItem("exchangeTimestamp");
  const now = Date.now();

  if (lastFetch && now - lastFetch < RATE_LIMIT) {
    const cachedRates = JSON.parse(localStorage.getItem("exchangeRates"));
    populateCurrencyDropdowns(cachedRates);
    return;
  }

  const url = `https://v6.exchangerate-api.com/v6/${EXCHANGE_API_KEY}/latest/USD`;

  fetch(url)
    .then(res => res.json())
    .then(data => {
      const rates = data.conversion_rates;
      localStorage.setItem("exchangeRates", JSON.stringify(rates));
      localStorage.setItem("exchangeTimestamp", now);
      populateCurrencyDropdowns(rates);
    })
    .catch(() => {
      alert("Failed to load exchange rates.");
    });
}

function populateCurrencyDropdowns(rates) {
  const fromSelect = document.getElementById("from-currency");
  const toSelect = document.getElementById("to-currency");

  fromSelect.innerHTML = "";
  toSelect.innerHTML = "";

  const currencies = Object.keys(rates); // First 20 currencies
  currencies.forEach(code => {
    fromSelect.add(new Option(code, code));
    toSelect.add(new Option(code, code));
  });

  fromSelect.value = "USD";
  toSelect.value = "CAD";
}

function convertCurrency() {
  const amount = parseFloat(document.getElementById("amount").value);
  const from = document.getElementById("from-currency").value;
  const to = document.getElementById("to-currency").value;
  const rates = JSON.parse(localStorage.getItem("exchangeRates"));

  if (!amount || !rates || !rates[from] || !rates[to]) {
    alert("Please enter a valid amount and try again.");
    return;
  }

  const result = (amount / rates[from]) * rates[to];
  const exchangeRate = (rates[to] / rates[from]).toFixed(4);

  document.getElementById("conversion-result").innerHTML = `
    <p>${amount} ${from} = ${result.toFixed(2)} ${to}</p>
    <p>Exchange Rate: 1 ${from} = ${exchangeRate} ${to}</p>
  `;
}

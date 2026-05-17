document.addEventListener("DOMContentLoaded", () => {

  const API_KEY = "06ac0bf7b12ee087e331f248688d4d9b";

  const cityInput = document.getElementById("cityInput");
  const weatherDiv = document.getElementById("weather");
  const weekBox = document.getElementById("weekForecast");

  // Safety check
  if (!weatherDiv) {
    console.error("weatherDiv not found!");
  }

  // EVENT
  document.getElementById("searchForm").addEventListener("submit", (e) => {
    e.preventDefault();

    if (cityInput.value.trim()) {
      getWeather();
    }
  });

  // Emoji helper
  function getWeatherEmoji(condition) {
    if (!condition) return "🌤️";

    const cond = condition.toLowerCase();

    if (cond.includes("clear")) return "☀️";
    if (cond.includes("cloud")) return "☁️";
    if (cond.includes("rain")) return "🌧️";
    if (cond.includes("snow")) return "❄️";

    return "🌤️";
  }

  // Sweet messages
  const sweetMessages = [
    "Today is a good day 💛",
    "Stay positive ☀️",
    "Drink water 🌿",
    "Something good is coming ✨"
  ];

  function getSweetMessage() {
    return sweetMessages[
      Math.floor(Math.random() * sweetMessages.length)
    ];
  }

  // DISPLAY WEATHER
  function displayWeather(data) {

    const temp = Math.round(data.main.temp);

    const condition = data.weather[0].main;

    const emoji = getWeatherEmoji(condition);

    const message = getSweetMessage();

    weatherDiv.innerHTML = `
      <h2>${data.name}</h2>

      <p class="temp">${temp} °C</p>

      <p>${emoji} ${condition}</p>

      <p>Humidity: ${data.main.humidity}%</p>

      <p class="sweet">${message}</p>
    `;
  }

  // MAIN WEATHER FUNCTION
  async function getWeather() {

    const city = cityInput.value.trim();

    if (!city) return;

    const cacheKey = `weather_${city.toLowerCase()}`;

    weatherDiv.innerHTML = "<p>Loading...</p>";

    try {

      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`
      );

      if (!response.ok) {
        throw new Error("Network error");
      }

      const data = await response.json();

      // SAVE CACHE
      localStorage.setItem(cacheKey, JSON.stringify({
        data: data,
        time: Date.now()
      }));

      displayWeather(data);

      getWeeklyForecast(city);

    } catch (error) {

      console.log("Offline mode activated:", error);

      // LOAD CACHE
      const cached = localStorage.getItem(cacheKey);

      if (cached) {

        const parsed = JSON.parse(cached);

        displayWeather(parsed.data);

        getWeeklyForecast(city);

      } else {

        weatherDiv.innerHTML =
          "<p>No internet & no cached data 😭</p>";
      }
    }
  }

  // FORECAST
  async function getWeeklyForecast(city) {

    try {

      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`
      );

      const data = await response.json();

      if (data.cod === "200") {
        displayWeek(data);
      }

    } catch (error) {

      console.log("Forecast offline or failed:", error);
    }
  }

  // DISPLAY WEEK
  function displayWeek(data) {

    weekBox.innerHTML = "";

    for (let i = 0; i < data.list.length; i += 8) {

      const day = data.list[i];

      const temp = Math.round(day.main.temp);

      const emoji = getWeatherEmoji(day.weather[0].main);

      const date = new Date(day.dt_txt).toLocaleDateString("en-US", {
        weekday: "short"
      });

      weekBox.innerHTML += `
        <div class="day">
          <p>${date}</p>
          <p>${emoji}</p>
          <p>${temp}°C</p>
        </div>
      `;
    }
  }

});
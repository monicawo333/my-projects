document.addEventListener("DOMContentLoaded", () => {

  const PHP_API_URL = "my_api.php";
  const API_KEY = "14cc08d81c32589c1e9392ca259e8396";
  
  const cityInput  = document.getElementById("cityInput");
  const weatherDiv = document.getElementById("weather");
  const weekBox    = document.getElementById("weekForecast");
  
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
    const cond = condition.toLowerCase();
    if (cond.includes("clear")) return "☀️";
    if (cond.includes("cloud")) return "☁️";
    if (cond.includes("rain"))  return "🌧️";
    if (cond.includes("snow"))  return "❄️";
    return "🌤️";
  }
  
  // Message
  const sweetMessages = [
    "Today is a good day 💛",
    "Stay positive ☀️",
    "Drink water 🌿",
    "Something good is coming ✨"
  ];
  
  function getSweetMessage() {
    return sweetMessages[Math.floor(Math.random() * sweetMessages.length)];
  }
  
  // DISPLAY WEATHER
  function displayWeather(data) {
    const temp = Math.round(data.weather_temperature);
    const condition = data.weather_description;
    const emoji = getWeatherEmoji(condition);
    const message = getSweetMessage();
  
    weatherDiv.innerHTML = `
      <h2>${data.city}</h2>
      <p class="temp">${temp} °C</p>
      <p>${emoji} ${condition}</p>
      <p>Humidity: ${data.humidity}%</p>
      <p class="sweet">${message}</p>
      <p style="font-size:11px;">Cached at: ${data.timestamp}</p>
    `;
  }
  
  // MAIN WEATHER FUNCTION (WITH OFFLINE CACHE)
  async function getWeather() {
    const city = cityInput.value.trim();
    if (!city) return;
  
    const cacheKey = `weather_${city.toLowerCase()}`;
  
    weatherDiv.innerHTML = "<p>Loading...</p>";
  
    try {
      const response = await fetch(`${PHP_API_URL}?city=${encodeURIComponent(city)}`);
  
      if (!response.ok) {
        throw new Error("Network error");
      }
  
      const data = await response.json();
  
      // SAVE TO CACHE
      localStorage.setItem(cacheKey, JSON.stringify({
        data: data,
        time: Date.now()
      }));
  
      displayWeather(data);
      getWeeklyForecast(city);
  
    } catch (error) {
      console.log("Offline mode activated:", error);
  
      // LOAD FROM CACHE
      const cached = localStorage.getItem(cacheKey);
  
      if (cached) {
        const parsed = JSON.parse(cached);
        displayWeather(parsed.data);
        getWeeklyForecast(city);
      } else {
        weatherDiv.innerHTML = "<p>No internet & no cached data 😭</p>";
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
      const emoji = getWeatherEmoji(day.weather[0].description);
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
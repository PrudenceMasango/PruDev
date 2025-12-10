function refreshWeather(response) {
  console.log("API response:", response);
  const data = response && response.data ? response.data : {};

  const temperatureElement = document.querySelector("#temperature");
  const cityElement = document.querySelector("#city");
  const descriptionElement = document.querySelector("#description");
  const humidityElement = document.querySelector("#humidity");
  const windSpeedElement = document.querySelector("#wind-speed");
  const timeElement = document.querySelector("#time");
  const iconElement = document.querySelector("#icon");

  const temp = data.temperature && (typeof data.temperature.current !== 'undefined' ? data.temperature.current : data.temperature);
  if (temperatureElement) temperatureElement.innerText = (typeof temp !== 'undefined' && temp !== null) ? Math.round(temp) : 'N/A';

  if (cityElement) cityElement.innerText = data.city || '';

  if (timeElement) {
    if (data.time) {
      const date = new Date(data.time * 1000);
      timeElement.innerText = formatDate(date);
    } else {
      timeElement.innerText = '';
    }
  }

  const description = (data.condition && (data.condition.description || data.condition)) || data.description || '';
  if (descriptionElement) descriptionElement.innerText = description;

  const humidity = (data.temperature && data.temperature.humidity) || data.humidity || null;
  if (humidityElement) humidityElement.innerText = humidity !== null && typeof humidity !== 'undefined' ? `${humidity}%` : '-';

  const windSpeed = (data.wind && (data.wind.speed || data.wind)) || data.wind_speed || null;
  if (windSpeedElement) windSpeedElement.innerText = windSpeed !== null && typeof windSpeed !== 'undefined' ? `${windSpeed} km/h` : '-';

  if (iconElement) {
    const iconUrl = (data.condition && (data.condition.icon_url || data.condition.icon)) || data.icon_url || null;
    if (iconUrl && typeof iconUrl === 'string') {
      let src = iconUrl;
      if (!/^https?:\/\//i.test(src)) {
      
        src = src.startsWith('/') ? src : `http://shecodes-assets.s3.amazonaws.com/api/weather/icons/${src}`;
      }
      iconElement.innerHTML = `<img src="${src}" class="weather-app-icon" alt="weather icon"/>`;
    } else {
      iconElement.innerText = getEmojiForDescription(description);
    }
  }
}

function formatDate(date) {
  let minutes = date.getMinutes();
  let hours = date.getHours();
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const day = days[date.getDay()];
  if (minutes < 10) minutes = `0${minutes}`;
  return `${day} ${hours}:${minutes}`;
}

function getEmojiForDescription(desc) {
  if (!desc) return '🌤️';
  const s = desc.toLowerCase();
  if (s.includes('clear') || s.includes('sun')) return '☀️';
  if (s.includes('cloud')) return '☁️';
  if (s.includes('rain') || s.includes('drizzle')) return '🌧️';
  if (s.includes('snow')) return '❄️';
  if (s.includes('thunder') || s.includes('storm')) return '⛈️';
  if (s.includes('mist') || s.includes('fog') || s.includes('haze')) return '🌫️';
  return '🌤️';
}

function searchCity(city) {
  if (!city || !city.toString().trim()) {
    alert('Please enter a city name.');
    return;
  }
  const q = encodeURIComponent(city.toString().trim());
  const apiKey = '0504o4893c18ff9e4aa1abac210t3155';
  const apiUrl = `https://api.shecodes.io/weather/v1/current?query=${q}&key=${apiKey}&units=metric`;
  console.log('Requesting', apiUrl);
  const temperatureElement = document.querySelector('#temperature');
  if (temperatureElement) temperatureElement.innerText = 'Loading...';

  axios
    .get(apiUrl)
    .then((response) => {
      refreshWeather(response);
      // Fetch forecast for the same city
      getForecast(q);
    })
    .catch((err) => {
      console.error('API Error:', err);
      if (err.response) {
        alert(`Could not fetch weather for "${city}" (server returned ${err.response.status}).`);
      } else if (err.request) {
        alert(`No response from weather API for "${city}". Check network/CORS.`);
      } else {
        alert(`Request error: ${err.message}`);
      }
      if (temperatureElement) temperatureElement.innerText = '-';
    });
}

function handleSearchSubmit(event) {
  event.preventDefault();
  const searchInput = document.querySelector('#search-form-input');
  if (searchInput) searchCity(searchInput.value);
}

function getForecast(city) {
  const apiKey = '0504o4893c18ff9e4aa1abac210t3155';
  const apiUrl = `https://api.shecodes.io/weather/v1/forecast?query=${city}&key=${apiKey}&units=metric`;
  console.log('Fetching forecast:', apiUrl);
  axios
    .get(apiUrl)
    .then((response) => displayForecast(response))
    .catch((err) => {
      console.error('Forecast API Error:', err);
    });
}

function formatDay(timestamp) {
  const date = new Date(timestamp * 1000);
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return days[date.getDay()];
}

function displayForecast(response) {
  console.log('Forecast response:', response.data);
  let forecastHtml = '';

  if (response.data && response.data.daily && Array.isArray(response.data.daily)) {
    response.data.daily.forEach(function(day, index) {
      if (index < 5) {
        const iconUrl = day.condition && day.condition.icon_url ? day.condition.icon_url : '';
        const maxTemp = day.temperature && typeof day.temperature.maximum !== 'undefined' ? Math.round(day.temperature.maximum) : '-';
        const minTemp = day.temperature && typeof day.temperature.minimum !== 'undefined' ? Math.round(day.temperature.minimum) : '-';

        forecastHtml += `
          <div class="weather-forecast-day">
            <div class="weather-forecast-date">${formatDay(day.time)}</div>
            <div class="weather-forecast-icon-wrapper">
              ${iconUrl ? `<img src="${iconUrl}" class="weather-forecast-icon" alt="weather" />` : '🌤️'}
            </div>
            <div class="weather-forecast-temperatures">
              <div class="weather-forecast-temperature"><strong>${maxTemp}°</strong></div>
              <div class="weather-forecast-temperature">${minTemp}°</div>
            </div>
          </div>
        `;
      }
    });
  }

  const forecastElement = document.querySelector('.weather-forecast');
  if (forecastElement) {
    forecastElement.innerHTML = forecastHtml || '<p>No forecast data available</p>';
  }
}

const searchFormElement = document.querySelector('#search-form');
if (searchFormElement) searchFormElement.addEventListener('submit', handleSearchSubmit);

searchCity('Paris');
getForecast('Paris');



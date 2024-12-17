// Get the elements from the HTML
const searchBtn = document.getElementById('search-btn');
const cityInput = document.getElementById('city-input');
const cityElement = document.getElementById('city');
const tempElement = document.getElementById('temp');
const descriptionElement = document.getElementById('description');
const humidityElement = document.getElementById('humidity');
const windElement = document.getElementById('wind');
const iconElement = document.getElementById('weather-icon');
const loadingElement = document.getElementById('loading');
const feelsLikeElement = document.getElementById('feels-like');
const locationBtn = document.getElementById('location-btn');
const apiKey = '5b4399be6944a8272f25b59c641ca1ba';  


// Trigger search when the search button is clicked
searchBtn.addEventListener('click', function () {
  const cityName = cityInput.value.trim();
  console.log(`Search button clicked. City: ${cityName}`); // Debug log
  if (cityName) {
    getWeather(cityName);
  } else {
    alert('Please enter a city name!');
  }
});

// Trigger search when the Enter key is pressed
cityInput.addEventListener('keydown', function (event) {
  if (event.key === 'Enter') {
    const cityName = cityInput.value.trim();
    console.log(`Enter key pressed. City: ${cityName}`); // Debug log
    if (cityName) {
      getWeather(cityName);
    } else {
      alert('Please enter a city name!');
    }
  }
});

// Get the toggle button element
const toggleForecastBtn = document.getElementById('toggle-forecast-btn');

// Function to toggle hourly forecast visibility
function toggleHourlyForecast() {
  const hourlyContainer = document.getElementById('hourly-forecast');
  
  if (hourlyContainer.style.display === 'none') {
    hourlyContainer.style.display = 'flex'; // Show the forecast
    toggleForecastBtn.textContent = 'Hide Hourly Forecast'; // Update button text
  } else {
    hourlyContainer.style.display = 'none'; // Hide the forecast
    toggleForecastBtn.textContent = 'Show Hourly Forecast'; // Update button text
  }
}

// Add event listener to the toggle button
toggleForecastBtn.addEventListener('click', toggleHourlyForecast);

// Event listener for the location
locationBtn.addEventListener('click', getLocationWeather);

// Event listener to change the temperature unit 
// Variable to track current unit: true for Celsius, false for Fahrenheit
let isCelsius = true;

// Get the unit toggle button
const unitToggleBtn = document.getElementById('unit-toggle-btn');

// Add event listener to toggle the unit
unitToggleBtn.addEventListener('click', () => {
  isCelsius = !isCelsius;  // Toggle the unit flag

  // Update the button text based on the current unit
  unitToggleBtn.textContent = isCelsius ? 'Switch to °F' : 'Switch to °C';

  // Re-fetch and update weather data with the new unit
  const currentCity = cityElement.textContent.replace('Weather in ', '').trim();
  if (currentCity) {
    getWeather(currentCity);  // Re-fetch weather with the new unit
  } else {
    getLocationWeather();  // Fetch location-based weather with the new unit
  }
});


// Function to update the weather data in the UI
function updateWeatherUI(data, unit, uvIndex) {
  const { name, main, weather, wind } = data;
  const iconCode = weather[0].icon;
  const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

  const temp = isCelsius ? main.temp : (main.temp * 9/5) + 32; // Convert to Fahrenheit when needed

  cityElement.textContent = `Weather in ${name}`;
  tempElement.textContent = `Temperature: ${main.temp}°C`;
  descriptionElement.textContent = `Condition: ${weather[0].description}`;
  humidityElement.textContent = `Humidity: ${main.humidity}%`;
  windElement.textContent = `Wind speed: ${wind.speed} m/s`;

  // Show the weather icon
  iconElement.src = iconUrl;
  iconElement.style.display = 'block'; // Show the icon

  if (uvIndex !== undefined) {
    const uvElement = document.getElementById('uv-index');
    uvElement.textContent = `UV Index: ${uvIndex}`;
  }
}

// Function to get weather for the user's location
async function getLocationWeather() {
  // Disable the location button and show loading
  locationBtn.textContent = 'Fetching Location...';
  locationBtn.disabled = true;
  loadingElement.style.display = 'block'; // Show loading spinner

  if (navigator.geolocation) {
    // Get current location
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        console.log('Latitude:', latitude, 'Longitude:', longitude);

        // URL to fetch current weather based on geolocation
        const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;

        // URL to fetch 5-day forecast for hourly data
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;

        try {
          // Fetch current weather
          const currentWeatherResponse = await fetch(currentWeatherUrl);
          const currentWeatherData = await currentWeatherResponse.json();

          // Fetch UV index
          const uvUrl = `https://api.openweathermap.org/data/2.5/uvi?lat=${latitude}&lon=${longitude}&appid=${apiKey}`;
          const uvResponse = await fetch(uvUrl);
          const uvData = await uvResponse.json();
          const uvIndex = uvData.value;

          // Fetch hourly forecast
          const forecastResponse = await fetch(forecastUrl);
          const forecastData = await forecastResponse.json();

          console.log('Location-based weather data:', currentWeatherData);
          console.log('Hourly forecast data:', forecastData);

          // Update the UI with current weather and UV index
          updateWeatherUI(currentWeatherData, 'metric', uvIndex);

          // Update hourly forecast
          updateHourlyForecast(forecastData);

        } catch (error) {
          console.error('Error fetching location-based weather:', error);
          alert('Something went wrong while fetching location-based weather.');
        } finally {
          // Reset loading and button state
          loadingElement.style.display = 'none';
          locationBtn.textContent = 'Use My Location';
          locationBtn.disabled = false;
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        alert(`Error: ${error.message}`);
        loadingElement.style.display = 'none';
        locationBtn.textContent = 'Use My Location';
        locationBtn.disabled = false;
      }
    );
  } else {
    alert('Geolocation is not supported by your browser.');
    loadingElement.style.display = 'none';
    locationBtn.textContent = 'Use My Location';
    locationBtn.disabled = false;
  }
}

function updateHourlyForecast(forecastData) {
  const hourlyContainer = document.getElementById('hourly-forecast');
  hourlyContainer.innerHTML = ''; // Clear previous data

  const tempUnit = isCelsius ? '°C' : '°F';

  forecastData.list.slice(0, 8).forEach(hour => {
    const time = new Date(hour.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const temp = isCelsius ? hour.main.temp : (hour.main.temp * 9 / 5) + 32;
    const icon = hour.weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${icon}@2x.png`;
    const description = hour.weather[0].description;

    const hourlyDiv = document.createElement('div');
    hourlyDiv.classList.add('hourly-forecast-item');
    hourlyDiv.innerHTML = `
      <p>${time}</p>
      <img src="${iconUrl}" alt="Weather Icon" />
      <p>${temp}${tempUnit}</p>
      <p>${description}</p>
    `;
    hourlyContainer.appendChild(hourlyDiv);
  });

  // Show the toggle button
  toggleForecastBtn.style.display = 'block';
  toggleForecastBtn.textContent = 'Show Hourly Forecast';
  hourlyContainer.style.display = 'none'; // Hide hourly forecast initially
}

// Function to fetch weather data
async function getWeather(city) {
  loadingElement.style.display = 'block'; // Show loading text
  iconElement.style.display = 'none'; // Hide icon initially

  const unit = isCelsius ? 'metric' : 'imperial'; // Toggle between units
  const tempUnit = isCelsius ? '°C' : '°F';

  // API URL for 5-day forecast
  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=${unit}`;

  try {
      const response = await fetch(url);
      const data = await response.json();

      console.log('API Response:', data); // Debugging line

      // Check if city not found
      if (data.cod === '404') {
          alert('City not found!');
          return;
      }

      // Extract latitude and longitude for UV index fetch
      const { lat, lon } = data.city.coord;

      // Fetch UV index
      const uvUrl = `https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${apiKey}`;
      const uvResponse = await fetch(uvUrl);
      const uvData = await uvResponse.json();

      // Extract first forecast entry for current weather
      const cityName = data.city.name;
      const { main, weather, wind } = data.list[0];
      const iconCode = weather[0].icon;
      const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

      // Update main weather information
      cityElement.textContent = `Weather in ${cityName}`;
      tempElement.textContent = `Temperature: ${main.temp}${tempUnit}`;
      descriptionElement.textContent = `Condition: ${weather[0].description}`;
      humidityElement.textContent = `Humidity: ${main.humidity}%`;
      windElement.textContent = `Wind speed: ${wind.speed} m/s`;
      feelsLikeElement.textContent = `Feels Like: ${main.feels_like}${tempUnit}`;
      iconElement.src = iconUrl;
      iconElement.style.display = 'block';

      // Update UV index
      const uvElement = document.getElementById('uv-index');
      uvElement.textContent = `UV Index: ${uvData.value}`;

      // Hourly forecast
      const hourlyContainer = document.getElementById('hourly-forecast');
      hourlyContainer.innerHTML = ''; // Clear previous data

      data.list.slice(0, 8).forEach(hour => {
          const time = new Date(hour.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const temp = hour.main.temp;
          const icon = hour.weather[0].icon;
          const iconUrl = `https://openweathermap.org/img/wn/${icon}@2x.png`;
          const description = hour.weather[0].description;

          const hourlyDiv = document.createElement('div');
          hourlyDiv.classList.add('hourly-forecast-item');
          hourlyDiv.innerHTML = `
              <p>${time}</p>
              <img src="${iconUrl}" alt="Weather Icon" />
              <p>${temp}${tempUnit}</p>
              <p>${description}</p>
          `;
          hourlyContainer.appendChild(hourlyDiv);
      });

      // Toggle button for hourly forecast
      toggleForecastBtn.style.display = 'block';
      toggleForecastBtn.textContent = 'Show Hourly Forecast';
      hourlyContainer.style.display = 'none';

  } catch (error) {
      console.error('Error fetching weather data:', error);
      alert('Something went wrong while fetching the weather data!');
  } finally {
      loadingElement.style.display = 'none';
  }
}


// Navigation Funktionen
function initNavigation() {
  const navToggle = document.getElementById("navToggle");
  const navMenu = document.getElementById("navMenu");

  if (navToggle && navMenu) {
    console.log("Navigation Elemente gefunden");

    navToggle.addEventListener("click", function () {
      console.log("Nav Toggle geklickt");
      navMenu.classList.toggle("active");
      this.classList.toggle("active");
    });

    // Schließe Menü, wenn außerhalb geklickt wird
    document.addEventListener("click", function (e) {
      const isNavToggle = e.target.closest("#navToggle");
      const isNavMenu = e.target.closest("#navMenu");

      if (!isNavToggle && !isNavMenu && navMenu.classList.contains("active")) {
        navMenu.classList.remove("active");
        navToggle.classList.remove("active");
      }
    });
  } else {
    console.error("Navigation-Elemente nicht gefunden!");
  }
}

// Dark Mode Funktionen
function initDarkMode() {
  const themeToggle = document.getElementById("themeToggle");
  const themeIcon = document.querySelector(".theme-icon");

  if (!themeToggle || !themeIcon) {
    console.error("Theme Toggle Elemente nicht gefunden!");
    return;
  }

  // Lade gespeicherte Theme-Einstellung
  const savedTheme = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  // Setze initiales Theme
  const initialTheme = savedTheme || (prefersDark ? "dark" : "light");
  setTheme(initialTheme);

  // Theme Toggle Event Listener
  themeToggle.addEventListener("click", function () {
    console.log("Theme Toggle geklickt");

    // Animation hinzufügen
    this.classList.add("rotating");
    setTimeout(() => {
      this.classList.remove("rotating");
    }, 300);

    // Theme wechseln
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";

    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  });

  // Reagiere auf System-Theme Änderungen
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", function (e) {
      if (!localStorage.getItem("theme")) {
        setTheme(e.matches ? "dark" : "light");
      }
    });
}

// Theme setzen
function setTheme(theme) {
  const themeIcon = document.querySelector(".theme-icon");

  document.documentElement.setAttribute("data-theme", theme);

  if (theme === "dark") {
    themeIcon.textContent = "☀️";
    console.log("Dark Mode aktiviert");
  } else {
    themeIcon.textContent = "🌙";
    console.log("Light Mode aktiviert");
  }
}

// Smooth Scroll für interne Links (Bonus)
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
      });
    }
  });
});

// API Tab Navigation
function initAPITabs() {
  const tabBtns = document.querySelectorAll(".tab-btn");
  const tabPanels = document.querySelectorAll(".tab-panel");

  tabBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      const targetTab = this.getAttribute("data-tab");

      // Remove active class from all buttons and panels
      tabBtns.forEach((b) => b.classList.remove("active"));
      tabPanels.forEach((p) => p.classList.remove("active"));

      // Add active class to clicked button and corresponding panel
      this.classList.add("active");
      document.getElementById(`${targetTab}-panel`).classList.add("active");

      // Load API data when tab becomes active
      loadAPIData(targetTab);
    });
  });

  // Load initial tab data
  loadAPIData("world");
}

// Load API Data based on active tab
function loadAPIData(tabName) {
  console.log(`Loading ${tabName} API data...`);

  switch (tabName) {
    case "world":
      loadWorldMap();
      break;
    case "weather":
      loadWeatherData();
      break;
    case "crypto":
      loadCryptoData();
      break;
    case "movies":
      loadMovieData();
      break;
  }
}

// =======================================
// D3.js WORLD MAP - CLEAN & FIXED VERSION
// =======================================

async function loadWorldMap() {
  console.log("Loading D3.js world map...");

  const worldLoading = document.getElementById("world-loading");
  const mapContainer = document.getElementById("world-map");
  const locationInfo = document.getElementById("location-info");

  // Show loading
  worldLoading.style.display = "flex";
  mapContainer.innerHTML = "";
  locationInfo.innerHTML = "";

  try {
    // Get user location first
    const userLocation = await getUserLocation();
    console.log("User location:", userLocation);

    // Create D3 map
    await createSimpleD3Map(userLocation);

    // Display location info
    displayLocationInfo(userLocation);

    // Hide loading
    worldLoading.style.display = "none";
  } catch (error) {
    console.error("Error loading world map:", error);
    showMapError();
  }
}

// Get user location (improved error handling)
function getUserLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation not supported"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        try {
          // Get location details from API
          const locationDetails = await getLocationDetails(lat, lon);

          resolve({
            latitude: lat,
            longitude: lon,
            accuracy: position.coords.accuracy,
            ...locationDetails,
          });
        } catch (error) {
          // Fallback without API
          resolve({
            latitude: lat,
            longitude: lon,
            accuracy: position.coords.accuracy,
            city: "Your City",
            country: "Your Country",
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          });
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  });
}

// Get location details from reverse geocoding API
async function getLocationDetails(lat, lon) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`
    );

    if (!response.ok) throw new Error("Geocoding failed");

    const data = await response.json();
    const address = data.address || {};

    return {
      city: address.city || address.town || address.village || "Unknown City",
      country: address.country || "Unknown Country",
      state: address.state || address.region || "",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
  } catch (error) {
    console.error("Geocoding error:", error);
    return {
      city: "Unknown City",
      country: "Unknown Country",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
  }
}

// Create Simple D3.js Map
async function createSimpleD3Map(userLocation) {
  const container = document.getElementById("world-map");

  // Clean & consistent container
  container.innerHTML = `
    <div class="d3-map-wrapper">
      <div class="d3-map-header">
        <h3>🗺️ D3.js Interactive World Map</h3>
        <p>Powered by D3.js data visualization</p>
      </div>
      <div id="d3-svg-container"></div>
      <div class="d3-map-controls">
        <button class="d3-btn" onclick="zoomIn()">🔍 Zoom In</button>
        <button class="d3-btn" onclick="zoomOut()">🔍 Zoom Out</button>
        <button class="d3-btn" onclick="resetView()">🎯 Reset</button>
      </div>
    </div>
  `;

  // D3.js Map Configuration
  const width = 800;
  const height = 400;

  // Create SVG with D3
  const svg = d3
    .select("#d3-svg-container")
    .append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .style("background", "linear-gradient(180deg, #87CEEB 0%, #4682B4 100%)")
    .style("border-radius", "12px");

  // Create projection
  const projection = d3
    .geoNaturalEarth1()
    .scale(130)
    .translate([width / 2, height / 2]);

  const path = d3.geoPath().projection(projection);

  // Store globally for controls
  window.d3Svg = svg;
  window.d3Projection = projection;
  window.d3Path = path;
  window.userLocation = userLocation;

  // Create main group for zoom
  const mapGroup = svg.append("g").attr("class", "map-group");
  window.d3MapGroup = mapGroup;

  try {
    // Load simple world data
    console.log("Loading world data...");

    const worldData = await d3.json(
      "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"
    );

    console.log("World data loaded successfully");

    // Draw countries with D3
    mapGroup
      .selectAll("path")
      .data(worldData.features)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("fill", "#2d5a27")
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 0.5)
      .style("cursor", "pointer")
      .on("mouseover", function (event, d) {
        d3.select(this).transition().duration(200).attr("fill", "#4CAF50");

        // Show country name
        showCountryTooltip(event, d.properties.NAME || "Unknown Country");
      })
      .on("mouseout", function (event, d) {
        d3.select(this).transition().duration(200).attr("fill", "#2d5a27");

        hideCountryTooltip();
      });

    // Add user location marker with D3
    addD3LocationMarker(mapGroup, projection, userLocation);

    // Add zoom behavior
    addD3Zoom(svg, mapGroup);

    console.log("D3 map created successfully");
  } catch (error) {
    console.error("Error creating D3 map:", error);

    // Fallback: Create simple SVG world
    createFallbackSVGWorld(mapGroup, width, height, userLocation);
  }
}

// Fallback if external data fails
function createFallbackSVGWorld(mapGroup, width, height, userLocation) {
  console.log("Creating fallback SVG world...");

  // Draw simple world shapes with D3
  const continents = [
    { name: "North America", x: 150, y: 120, width: 200, height: 150 },
    { name: "South America", x: 200, y: 270, width: 100, height: 180 },
    { name: "Europe", x: 350, y: 100, width: 80, height: 80 },
    { name: "Africa", x: 350, y: 180, width: 120, height: 200 },
    { name: "Asia", x: 430, y: 80, width: 250, height: 200 },
    { name: "Australia", x: 580, y: 300, width: 100, height: 60 },
  ];

  // Draw continents with D3
  mapGroup
    .selectAll(".continent")
    .data(continents)
    .enter()
    .append("ellipse")
    .attr("class", "continent")
    .attr("cx", (d) => d.x + d.width / 2)
    .attr("cy", (d) => d.y + d.height / 2)
    .attr("rx", (d) => d.width / 2)
    .attr("ry", (d) => d.height / 2)
    .attr("fill", "#2d5a27")
    .attr("stroke", "#ffffff")
    .attr("stroke-width", 2)
    .style("cursor", "pointer")
    .on("mouseover", function (event, d) {
      d3.select(this).transition().duration(200).attr("fill", "#4CAF50");

      showCountryTooltip(event, d.name);
    })
    .on("mouseout", function (event, d) {
      d3.select(this).transition().duration(200).attr("fill", "#2d5a27");

      hideCountryTooltip();
    });

  // Add user location to fallback world
  addD3LocationMarker(mapGroup, null, userLocation, width, height);
}

// Add D3 Location Marker
function addD3LocationMarker(
  mapGroup,
  projection,
  userLocation,
  fallbackWidth,
  fallbackHeight
) {
  let userX, userY;

  if (projection) {
    // Use real projection
    const coords = projection([userLocation.longitude, userLocation.latitude]);
    if (coords) {
      userX = coords[0];
      userY = coords[1];
    } else {
      userX = fallbackWidth ? fallbackWidth / 2 : 400;
      userY = fallbackHeight ? fallbackHeight / 2 : 200;
    }
  } else {
    // Fallback positioning
    userX = fallbackWidth / 2;
    userY = fallbackHeight / 2;
  }

  // Create location group with D3
  const locationGroup = mapGroup
    .append("g")
    .attr("class", "user-location-group");

  // Pulsing circle with D3 animation
  locationGroup
    .append("circle")
    .attr("cx", userX)
    .attr("cy", userY)
    .attr("r", 0)
    .attr("fill", "none")
    .attr("stroke", "#ff4444")
    .attr("stroke-width", 2)
    .attr("opacity", 1)
    .transition()
    .duration(2000)
    .ease(d3.easeLinear)
    .attr("r", 30)
    .attr("opacity", 0)
    .on("end", function () {
      // Repeat animation
      d3.select(this)
        .attr("r", 0)
        .attr("opacity", 1)
        .transition()
        .duration(2000)
        .ease(d3.easeLinear)
        .attr("r", 30)
        .attr("opacity", 0)
        .on("end", arguments.callee);
    });

  // Location dot
  locationGroup
    .append("circle")
    .attr("cx", userX)
    .attr("cy", userY)
    .attr("r", 8)
    .attr("fill", "#ff4444")
    .attr("stroke", "#ffffff")
    .attr("stroke-width", 3);

  // Clean location text with D3
  locationGroup
    .append("text")
    .attr("x", userX)
    .attr("y", userY - 20)
    .attr("text-anchor", "middle")
    .attr("fill", "#ffffff")
    .attr("font-size", "14px")
    .attr("font-weight", "bold")
    .attr("stroke", "#000000")
    .attr("stroke-width", 3)
    .attr("paint-order", "stroke")
    .text(`📍 ${userLocation.city}, ${userLocation.country}`);
}

// Display location information
function displayLocationInfo(location) {
  const locationInfo = document.getElementById("location-info");

  const currentTime = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  locationInfo.innerHTML = `
    <div class="location-info-grid">
      <div class="info-card primary">
        <div class="card-header">
          <span class="card-icon">📍</span>
          <h4>Current Location</h4>
        </div>
        <div class="card-content">
          <div class="location-name">
            <strong>${location.city}</strong>
            <span class="country-name">${location.country}</span>
          </div>
          <div class="accuracy-info">
            <span class="accuracy-icon">🎯</span>
            Accuracy: ±${Math.round(location.accuracy || 0)}m
          </div>
        </div>
      </div>
      
      <div class="info-card">
        <div class="card-header">
          <span class="card-icon">🕒</span>
          <h4>Current Time</h4>
        </div>
        <div class="card-content">
          <div class="time-display" id="live-time">${currentTime}</div>
          <div class="date-display">${currentDate}</div>
        </div>
      </div>
      
      <div class="info-card">
        <div class="card-header">
          <span class="card-icon">🌐</span>
          <h4>Coordinates</h4>
        </div>
        <div class="card-content">
          <div class="coord-pair">
            <span class="coord-type">Lat:</span>
            <span class="coord-val">${location.latitude.toFixed(4)}°</span>
          </div>
          <div class="coord-pair">
            <span class="coord-type">Lng:</span>
            <span class="coord-val">${location.longitude.toFixed(4)}°</span>
          </div>
        </div>
      </div>
      
      <div class="info-card">
        <div class="card-header">
          <span class="card-icon">🌍</span>
          <h4>Time Zone</h4>
        </div>
        <div class="card-content">
          <div class="timezone-info">
            ${location.timezone?.split("/").pop() || "Local Time"}
          </div>
          <div class="timezone-full">
            ${
              location.timezone ||
              Intl.DateTimeFormat().resolvedOptions().timeZone
            }
          </div>
        </div>
      </div>
    </div>
  `;

  // Start live time updates
  startTimeUpdates();
}

// Live time updates
function startTimeUpdates() {
  const timeInterval = setInterval(() => {
    const timeElement = document.getElementById("live-time");
    if (timeElement) {
      timeElement.textContent = new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } else {
      clearInterval(timeInterval);
    }
  }, 1000);
}

// D3 Zoom functionality
function addD3Zoom(svg, mapGroup) {
  const zoom = d3
    .zoom()
    .scaleExtent([0.5, 4])
    .on("zoom", function (event) {
      const { transform } = event;
      mapGroup.attr("transform", transform);
    });

  svg.call(zoom);
  window.d3Zoom = zoom;
}

// Control functions for D3 map
function zoomIn() {
  if (window.d3Svg && window.d3Zoom) {
    window.d3Svg.transition().duration(300).call(window.d3Zoom.scaleBy, 1.5);
  }
}

function zoomOut() {
  if (window.d3Svg && window.d3Zoom) {
    window.d3Svg.transition().duration(300).call(window.d3Zoom.scaleBy, 0.67);
  }
}

function resetView() {
  if (window.d3Svg && window.d3Zoom) {
    window.d3Svg
      .transition()
      .duration(500)
      .call(window.d3Zoom.transform, d3.zoomIdentity);
  }
}

// Tooltip functions
function showCountryTooltip(event, countryName) {
  let tooltip = d3.select("#country-tooltip");
  if (tooltip.empty()) {
    tooltip = d3
      .select("body")
      .append("div")
      .attr("id", "country-tooltip")
      .style("position", "absolute")
      .style("background", "rgba(0, 0, 0, 0.8)")
      .style("color", "white")
      .style("padding", "8px 12px")
      .style("border-radius", "6px")
      .style("font-size", "14px")
      .style("pointer-events", "none")
      .style("opacity", 0)
      .style("z-index", 1000);
  }

  tooltip
    .html(countryName)
    .style("left", event.pageX + 10 + "px")
    .style("top", event.pageY - 10 + "px")
    .transition()
    .duration(200)
    .style("opacity", 1);
}

function hideCountryTooltip() {
  d3.select("#country-tooltip").transition().duration(200).style("opacity", 0);
}

// Error handling
function showMapError() {
  const worldLoading = document.getElementById("world-loading");
  worldLoading.innerHTML = `
    <div class="error-container">
      <div class="error-icon">🌍</div>
      <h3>Location Unavailable</h3>
      <p>Unable to access your location. Please check your browser settings.</p>
      <button class="retry-btn" onclick="loadWorldMap()">
        🔄 Try Again
      </button>
    </div>
  `;
}

// Weather API Configuration - ENHANCED with search
const WEATHER_API_KEY = "26a537a75391d0402d26b5d488a752f6";
const WEATHER_BASE_URL = "https://api.openweathermap.org/data/2.5/weather";
const FORECAST_BASE_URL = "https://api.openweathermap.org/data/2.5/forecast";
const GEO_BASE_URL = "https://api.openweathermap.org/geo/1.0/direct";

// Popular Swiss cities as default (but now searchable!)
const DEFAULT_CITIES = [
  { name: "Visp", country: "CH", lat: 46.2937, lon: 7.8842 },
  { name: "Bern", country: "CH", lat: 46.9481, lon: 7.4474 },
  { name: "Zurich", country: "CH", lat: 47.3769, lon: 8.5417 },
  { name: "Geneva", country: "CH", lat: 46.2044, lon: 6.1432 },
  { name: "Basel", country: "CH", lat: 47.5596, lon: 7.5886 },
  { name: "Lugano", country: "CH", lat: 46.0037, lon: 8.9511 },
];

async function loadWeatherData() {
  console.log("Loading weather data...");

  const weatherGrid = document.getElementById("weather-grid");
  const loading = document.getElementById("weather-loading");

  // Show loading
  loading.style.display = "flex";
  weatherGrid.innerHTML = "";

  try {
    // Fetch weather for default cities
    const weatherPromises = DEFAULT_CITIES.map((city) =>
      fetchWeatherForCity(city.lat, city.lon, city.name, city.country)
    );

    const weatherData = await Promise.all(weatherPromises);

    // Hide loading
    loading.style.display = "none";

    // Display weather interface with search
    displayWeatherInterface(weatherData);
  } catch (error) {
    console.error("Error loading weather data:", error);
    loading.innerHTML = `
      <div style="text-align: center; color: var(--accent-color);">
        <h3>⚠️ Weather data unavailable</h3>
        <p>Please check your internet connection or try again later.</p>
      </div>
    `;
  }
}

// Fetch weather for specific coordinates
async function fetchWeatherForCity(lat, lon, cityName = "", country = "") {
  const url = `${WEATHER_BASE_URL}?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Weather API error: ${response.status}`);
  }

  const data = await response.json();
  return {
    ...data,
    cityName: cityName || data.name,
    country: country || data.sys.country,
  };
}

// Search cities by name
async function searchCities(query) {
  if (!query || query.length < 2) {
    // If search is empty, load default cities
    const weatherPromises = DEFAULT_CITIES.map((city) =>
      fetchWeatherForCity(city.lat, city.lon, city.name, city.country)
    );
    const weatherData = await Promise.all(weatherPromises);
    displayWeatherCards(weatherData);
    return;
  }

  const url = `${GEO_BASE_URL}?q=${encodeURIComponent(
    query
  )}&limit=6&appid=${WEATHER_API_KEY}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.status}`);
    }

    const cities = await response.json();

    if (cities.length === 0) {
      displayWeatherCards([]);
      return;
    }

    // Fetch weather for found cities
    const weatherPromises = cities.map((city) =>
      fetchWeatherForCity(city.lat, city.lon, city.name, city.country)
    );

    const weatherData = await Promise.all(weatherPromises);
    displayWeatherCards(weatherData);

    // Update search info
    const searchInfo = document.getElementById("weather-search-info");
    if (searchInfo) {
      searchInfo.textContent = `Found weather for ${cities.length} cities matching "${query}"`;
    }
  } catch (error) {
    console.error("Error searching cities:", error);
    displayWeatherCards([]);
  }
}

// Display weather interface with search
function displayWeatherInterface(initialWeatherData) {
  const weatherGrid = document.getElementById("weather-grid");

  weatherGrid.innerHTML = `
    <div class="weather-header">
      <h3>🌤️ Weather Search Engine</h3>
      <div class="weather-search">
        <input type="text" 
               id="weather-search" 
               placeholder="Search any city... (e.g. 'London', 'Paris', 'Tokyo')" 
               oninput="handleWeatherSearch(this.value)">
        <span class="search-icon">🔍</span>
      </div>
      <p class="search-info" id="weather-search-info">Showing popular Swiss cities</p>
    </div>
    
    <div class="weather-cards" id="weather-cards">
      <!-- Weather cards will be loaded here -->
    </div>
    
    <div class="weather-footer">
      <p class="weather-disclaimer">
        🌤️ Real-time weather data from OpenWeatherMap API
      </p>
    </div>
  `;

  // Display initial weather data
  displayWeatherCards(initialWeatherData);
}

// Display weather cards (enhanced version)
function displayWeatherCards(weatherData) {
  const weatherCards = document.getElementById("weather-cards");

  if (!weatherData || weatherData.length === 0) {
    weatherCards.innerHTML = `
      <div class="no-results">
        <h3>🌍 No cities found</h3>
        <p>Try searching for a different city...</p>
      </div>
    `;
    return;
  }

  weatherCards.innerHTML = weatherData
    .map(
      (weather) => `
    <div class="weather-card enhanced">
      <div class="weather-card-header">
        <div class="weather-location">
          <h4>${weather.cityName}</h4>
          <span class="weather-country">${getCountryName(
            weather.country
          )}</span>
        </div>
        <div class="weather-icon">
          <img src="https://openweathermap.org/img/wn/${
            weather.weather[0].icon
          }@2x.png" 
               alt="${weather.weather[0].description}">
        </div>
      </div>
      
      <div class="weather-temp">
        <span class="temp-main">${Math.round(weather.main.temp)}°C</span>
        <span class="temp-feels">Feels like ${Math.round(
          weather.main.feels_like
        )}°C</span>
      </div>
      
      <div class="weather-description">
        ${
          weather.weather[0].description.charAt(0).toUpperCase() +
          weather.weather[0].description.slice(1)
        }
      </div>
      
      <div class="weather-details">
        <div class="detail-item">
          <span class="detail-icon">💧</span>
          <span class="detail-value">${weather.main.humidity}%</span>
          <span class="detail-label">Humidity</span>
        </div>
        <div class="detail-item">
          <span class="detail-icon">💨</span>
          <span class="detail-value">${Math.round(
            weather.wind.speed * 3.6
          )} km/h</span>
          <span class="detail-label">Wind</span>
        </div>
        <div class="detail-item">
          <span class="detail-icon">🌡️</span>
          <span class="detail-value">${Math.round(
            weather.main.pressure
          )} hPa</span>
          <span class="detail-label">Pressure</span>
        </div>
      </div>
      
      <div class="weather-minmax">
        <span class="temp-min">Min: ${Math.round(
          weather.main.temp_min
        )}°C</span>
        <span class="temp-max">Max: ${Math.round(
          weather.main.temp_max
        )}°C</span>
      </div>
      
      <div class="weather-actions">
        <button class="weather-btn primary full-width" onclick="showWeatherDetails(${
          weather.coord.lat
        }, ${weather.coord.lon}, '${weather.cityName}', '${weather.country}')">
          <span class="btn-icon">📊</span>
          <span class="btn-text">5-Day Forecast</span>
        </button>
      </div>
    </div>
  `
    )
    .join("");
}

// Handle weather search with debouncing
let weatherSearchTimeout;
function handleWeatherSearch(query) {
  clearTimeout(weatherSearchTimeout);
  weatherSearchTimeout = setTimeout(() => {
    searchCities(query);
  }, 500); // Wait 500ms after user stops typing
}

// Get country name from country code
function getCountryName(countryCode) {
  const countries = {
    CH: "Switzerland",
    DE: "Germany",
    FR: "France",
    IT: "Italy",
    AT: "Austria",
    US: "United States",
    GB: "United Kingdom",
    CA: "Canada",
    AU: "Australia",
    JP: "Japan",
    CN: "China",
    IN: "India",
    BR: "Brazil",
    RU: "Russia",
    ES: "Spain",
    NL: "Netherlands",
    BE: "Belgium",
    SE: "Sweden",
    NO: "Norway",
    DK: "Denmark",
    FI: "Finland",
    IS: "Iceland",
    IE: "Ireland",
    PT: "Portugal",
  };

  return countries[countryCode] || countryCode;
}

// Show detailed weather forecast
async function showWeatherDetails(lat, lon, cityName, country) {
  try {
    // Show loading in modal
    showWeatherModal("loading");

    const forecastResponse = await fetch(
      `${FORECAST_BASE_URL}?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`
    );
    const forecastData = await forecastResponse.json();

    // Show weather details in modal
    showWeatherModal("details", forecastData, cityName, country);
  } catch (error) {
    console.error("Error fetching weather forecast:", error);
    showWeatherModal("error");
  }
}

function showWeatherModal(
  type,
  forecastData = null,
  cityName = "",
  country = ""
) {
  // Remove existing modal
  const existingModal = document.getElementById("weather-modal");
  if (existingModal) {
    existingModal.remove();
  }

  let modalContent = "";

  if (type === "loading") {
    modalContent = `
      <div class="modal-content loading">
        <div class="spinner"></div>
        <p>Loading weather forecast...</p>
      </div>
    `;
  } else if (type === "error") {
    modalContent = `
      <div class="modal-content error">
        <h3>⚠️ Error</h3>
        <p>Sorry, couldn't load weather forecast. Please try again.</p>
        <button class="modal-close-btn" onclick="closeWeatherModal()">Close</button>
      </div>
    `;
  } else if (type === "details" && forecastData) {
    // Process forecast data - group by days
    const dailyForecasts = processForecastData(forecastData.list);

    modalContent = `
      <div class="modal-content details weather-modal-content">
        <button class="modal-close-x" onclick="closeWeatherModal()">×</button>
        
        <div class="weather-modal-header">
          <h2>🌤️ ${cityName}, ${getCountryName(country)}</h2>
          <p class="forecast-subtitle">5-Day Weather Forecast</p>
        </div>
        
        <div class="forecast-grid">
          ${dailyForecasts
            .map(
              (day) => `
            <div class="forecast-day">
              <div class="forecast-date">
                <span class="day-name">${day.dayName}</span>
                <span class="day-date">${day.date}</span>
              </div>
              <div class="forecast-icon">
                <img src="https://openweathermap.org/img/wn/${
                  day.icon
                }@2x.png" alt="${day.description}">
              </div>
              <div class="forecast-temps">
                <span class="forecast-high">${Math.round(day.tempMax)}°</span>
                <span class="forecast-low">${Math.round(day.tempMin)}°</span>
              </div>
              <div class="forecast-desc">${day.description}</div>
              <div class="forecast-details">
                <div class="forecast-detail">
                  <span class="detail-icon">💧</span>
                  <span>${day.humidity}%</span>
                </div>
                <div class="forecast-detail">
                  <span class="detail-icon">💨</span>
                  <span>${Math.round(day.windSpeed * 3.6)} km/h</span>
                </div>
              </div>
            </div>
          `
            )
            .join("")}
        </div>
        
        <button class="modal-close-btn" onclick="closeWeatherModal()">Close</button>
      </div>
    `;
  }

  // Create modal
  const modal = document.createElement("div");
  modal.id = "weather-modal";
  modal.className = "weather-modal";
  modal.innerHTML = modalContent;

  // Add to page
  document.body.appendChild(modal);

  // Close on background click
  modal.addEventListener("click", function (e) {
    if (e.target === modal) {
      closeWeatherModal();
    }
  });

  // Show modal with animation
  setTimeout(() => modal.classList.add("show"), 10);
}

function closeWeatherModal() {
  const modal = document.getElementById("weather-modal");
  if (modal) {
    modal.classList.remove("show");
    setTimeout(() => modal.remove(), 300);
  }
}

// Process forecast data into daily forecasts
function processForecastData(forecastList) {
  const dailyData = {};

  forecastList.forEach((item) => {
    const date = new Date(item.dt * 1000);
    const dayKey = date.toDateString();

    if (!dailyData[dayKey]) {
      dailyData[dayKey] = {
        date: date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        dayName: date.toLocaleDateString("en-US", { weekday: "short" }),
        tempMax: item.main.temp_max,
        tempMin: item.main.temp_min,
        humidity: item.main.humidity,
        windSpeed: item.wind.speed,
        icon: item.weather[0].icon,
        description: item.weather[0].description,
      };
    } else {
      // Update min/max temperatures
      dailyData[dayKey].tempMax = Math.max(
        dailyData[dayKey].tempMax,
        item.main.temp_max
      );
      dailyData[dayKey].tempMin = Math.min(
        dailyData[dayKey].tempMin,
        item.main.temp_min
      );
    }
  });

  return Object.values(dailyData).slice(0, 5); // Return first 5 days
}

// Crypto API Configuration
const CRYPTO_API_BASE = "https://api.coingecko.com/api/v3";
const EXCHANGE_RATE_API = "https://api.exchangerate-api.com/v4/latest/USD";

const CRYPTO_CURRENCIES = [
  "bitcoin",
  "ethereum",
  "binancecoin",
  "ripple",
  "cardano",
  "solana",
  "polkadot",
  "dogecoin",
  "chainlink",
];

async function loadCryptoData() {
  console.log("Loading crypto data...");

  const cryptoGrid = document.getElementById("crypto-grid");
  const loading = document.getElementById("crypto-loading");

  // Show loading
  loading.style.display = "flex";
  cryptoGrid.innerHTML = "";

  try {
    // Fetch crypto data and CHF exchange rate
    const [cryptoData, exchangeRates] = await Promise.all([
      fetchCryptoData(),
      fetchExchangeRates(),
    ]);

    // Hide loading
    loading.style.display = "none";

    // Display crypto cards
    displayCryptoCards(cryptoData, exchangeRates);
  } catch (error) {
    console.error("Error loading crypto data:", error);
    loading.innerHTML = `
      <div style="text-align: center; color: var(--accent-color);">
        <h3>⚠️ Crypto data unavailable</h3>
        <p>Please check your internet connection or try again later.</p>
      </div>
    `;
  }
}

async function fetchCryptoData() {
  const cryptoIds = CRYPTO_CURRENCIES.join(",");
  const url = `${CRYPTO_API_BASE}/simple/price?ids=${cryptoIds}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Crypto API error: ${response.status}`);
  }

  return await response.json();
}

async function fetchExchangeRates() {
  const response = await fetch(EXCHANGE_RATE_API);
  if (!response.ok) {
    throw new Error(`Exchange Rate API error: ${response.status}`);
  }

  const data = await response.json();
  return data.rates.CHF; // USD to CHF rate
}

function displayCryptoCards(cryptoData, usdToChf) {
  const cryptoGrid = document.getElementById("crypto-grid");

  // Convert crypto data to array for easier handling
  const cryptoArray = Object.entries(cryptoData).map(([id, data]) => ({
    id,
    name: getCryptoName(id),
    symbol: getCryptoSymbol(id),
    emoji: getCryptoEmoji(id),
    priceUsd: data.usd,
    priceChf: data.usd * usdToChf,
    change24h: data.usd_24h_change,
    marketCap: data.usd_market_cap,
  }));

  cryptoGrid.innerHTML = `
    <div class="crypto-header">
      <h3>💰 Top Cryptocurrencies</h3>
      <p class="exchange-rate">1 USD = ${usdToChf.toFixed(2)} CHF</p>
    </div>
    
    <div class="crypto-cards">
      ${cryptoArray
        .map(
          (crypto) => `
        <div class="crypto-card">
          <div class="crypto-info">
            <div class="crypto-icon">${crypto.emoji}</div>
            <div class="crypto-details">
              <h4>${crypto.name}</h4>
              <span class="crypto-symbol">${crypto.symbol.toUpperCase()}</span>
            </div>
          </div>
          
          <div class="crypto-prices">
            <div class="price-usd">$${crypto.priceUsd.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 6,
            })}</div>
            <div class="price-chf">CHF ${crypto.priceChf.toLocaleString(
              "de-CH",
              {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }
            )}</div>
          </div>
          
          <div class="crypto-change ${
            crypto.change24h >= 0 ? "positive" : "negative"
          }">
            <span class="change-icon">${
              crypto.change24h >= 0 ? "📈" : "📉"
            }</span>
            <span class="change-value">${
              crypto.change24h >= 0 ? "+" : ""
            }${crypto.change24h.toFixed(2)}%</span>
          </div>
          
          <div class="crypto-marketcap">
            <span class="marketcap-label">Market Cap:</span>
            <span class="marketcap-value">$${formatMarketCap(
              crypto.marketCap
            )}</span>
          </div>
        </div>
      `
        )
        .join("")}
    </div>
    
    <div class="crypto-footer">
      <p class="disclaimer">💡 Prices are updated in real-time from CoinGecko API</p>
    </div>
  `;
}

// Helper functions for crypto data
function getCryptoName(id) {
  const names = {
    bitcoin: "Bitcoin",
    ethereum: "Ethereum",
    binancecoin: "BNB",
    ripple: "XRP",
    cardano: "Cardano",
    solana: "Solana",
    polkadot: "Polkadot",
    dogecoin: "Dogecoin",
    chainlink: "Chainlink",
  };
  return names[id] || id;
}

function getCryptoSymbol(id) {
  const symbols = {
    bitcoin: "BTC",
    ethereum: "ETH",
    binancecoin: "BNB",
    ripple: "XRP",
    cardano: "ADA",
    solana: "SOL",
    polkadot: "DOT",
    dogecoin: "DOGE",
    chainlink: "LINK",
  };
  return symbols[id] || id;
}

function getCryptoEmoji(id) {
  const emojis = {
    bitcoin: "₿",
    ethereum: "Ξ",
    binancecoin: "🔶",
    ripple: "〰️",
    cardano: "🔵",
    solana: "🟣",
    polkadot: "🔴",
    dogecoin: "🐕",
    chainlink: "🔗", // ← Diese Zeile hinzufügen
  };
  return emojis[id] || "💰";
}

function formatMarketCap(marketCap) {
  if (marketCap >= 1e12) {
    return (marketCap / 1e12).toFixed(1) + "T";
  } else if (marketCap >= 1e9) {
    return (marketCap / 1e9).toFixed(1) + "B";
  } else if (marketCap >= 1e6) {
    return (marketCap / 1e6).toFixed(1) + "M";
  }
  return marketCap.toLocaleString();
}

// Movie API Configuration - LIVE API
const MOVIE_API_KEY = "8fefe0349d3b8134bf2bf942f1b3621d";
const MOVIE_API_BASE = "https://api.themoviedb.org/3";
const MOVIE_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

// Demo API Key für Testing (limitiert, aber funktioniert)
const DEMO_API_KEY = "a07e22bc18f5cb106bfe4cc1f83ad8ed";

async function loadMovieData() {
  console.log("Loading movie data...");

  const moviesGrid = document.getElementById("movies-grid");
  const loading = document.getElementById("movies-loading");

  // Show loading
  loading.style.display = "flex";
  moviesGrid.innerHTML = "";

  try {
    // Fetch popular movies from TMDB API
    const popularMovies = await fetchPopularMovies();

    // Hide loading
    loading.style.display = "none";

    // Display movie cards with search
    displayMovieInterface(popularMovies);
  } catch (error) {
    console.error("Error loading movie data:", error);
    loading.innerHTML = `
      <div style="text-align: center; color: var(--accent-color);">
        <h3>⚠️ Movie API unavailable</h3>
        <p>Please check your internet connection or try again later.</p>
      </div>
    `;
  }
}

// Fetch popular movies from TMDB
async function fetchPopularMovies() {
  const apiKey =
    MOVIE_API_KEY !== "dein_api_key_hier" ? MOVIE_API_KEY : DEMO_API_KEY;
  const url = `${MOVIE_API_BASE}/movie/popular?api_key=${apiKey}&language=en-US&page=1`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status}`);
  }

  const data = await response.json();
  return data.results.slice(0, 12); // Show 12 popular movies initially
}

// Search movies by title
async function searchMovies(query) {
  if (!query || query.length < 2) {
    // If search is empty, load popular movies
    const popularMovies = await fetchPopularMovies();
    displayMovieCards(popularMovies);
    return;
  }

  const apiKey =
    MOVIE_API_KEY !== "dein_api_key_hier" ? MOVIE_API_KEY : DEMO_API_KEY;
  const url = `${MOVIE_API_BASE}/search/movie?api_key=${apiKey}&language=en-US&query=${encodeURIComponent(
    query
  )}&page=1`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Search API error: ${response.status}`);
    }

    const data = await response.json();
    displayMovieCards(data.results.slice(0, 12)); // Show top 12 results

    // Update search info
    const searchInfo = document.getElementById("search-info");
    if (searchInfo) {
      searchInfo.textContent = `Found ${data.total_results} movies for "${query}"`;
    }
  } catch (error) {
    console.error("Error searching movies:", error);
    displayMovieCards([]);
  }
}

// Display movie interface with search
function displayMovieInterface(initialMovies) {
  const moviesGrid = document.getElementById("movies-grid");

  moviesGrid.innerHTML = `
    <div class="movies-header">
      <h3>🎬 Movie Search Engine</h3>
      <div class="movies-search">
        <input type="text" 
               id="movie-search" 
               placeholder="Search any movie... (e.g. 'Avengers', 'Batman', 'Star Wars')" 
               oninput="handleSearch(this.value)">
        <span class="search-icon">🔍</span>
      </div>
      <p class="search-info" id="search-info">Showing popular movies</p>
    </div>
    
    <div class="movies-cards" id="movies-cards">
      <!-- Movies will be loaded here -->
    </div>
    
    <div class="movies-footer">
      <p class="movies-disclaimer">
        🎬 Real-time movie data from The Movie Database (TMDB) API
      </p>
    </div>
  `;

  // Display initial movies
  displayMovieCards(initialMovies);
}

// Display movie cards
function displayMovieCards(movies) {
  const moviesCards = document.getElementById("movies-cards");

  if (!movies || movies.length === 0) {
    moviesCards.innerHTML = `
      <div class="no-results">
        <h3>🎭 No movies found</h3>
        <p>Try searching for something else...</p>
      </div>
    `;
    return;
  }

  moviesCards.innerHTML = movies
    .map(
      (movie) => `
    <div class="movie-card">
      <div class="movie-poster">
        <img src="${
          movie.poster_path
            ? MOVIE_IMAGE_BASE + movie.poster_path
            : "https://via.placeholder.com/500x750/cccccc/666666?text=No+Poster"
        }" 
             alt="${movie.title} Poster" 
             class="poster-img">
        <div class="movie-rating">
          <span class="rating-star">⭐</span>
          <span class="rating-value">${
            movie.vote_average ? movie.vote_average.toFixed(1) : "N/A"
          }</span>
        </div>
      </div>
      
      <div class="movie-info">
        <div class="movie-title">
          <h4>${movie.title}</h4>
          <span class="movie-year">${
            movie.release_date ? movie.release_date.split("-")[0] : "N/A"
          }</span>
        </div>
        
        <div class="movie-genre">
          ${getGenreNames(movie.genre_ids)}
        </div>
        
        <div class="movie-overview">
          ${
            movie.overview
              ? movie.overview.length > 120
                ? movie.overview.substring(0, 120) + "..."
                : movie.overview
              : "No description available."
          }
        </div>
        
        <div class="movie-actions">
          <button class="movie-btn primary full-width" onclick="showMovieDetails(${
            movie.id
          })">
            <span class="btn-icon">📖</span>
            <span class="btn-text">View Details</span>
          </button>
        </div>
      </div>
    </div>
  `
    )
    .join("");
}

// Handle search with debouncing
let searchTimeout;
function handleSearch(query) {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    searchMovies(query);
  }, 500); // Wait 500ms after user stops typing
}

// Get genre names from IDs
function getGenreNames(genreIds) {
  const genres = {
    28: "Action",
    12: "Adventure",
    16: "Animation",
    35: "Comedy",
    80: "Crime",
    99: "Documentary",
    18: "Drama",
    10751: "Family",
    14: "Fantasy",
    36: "History",
    27: "Horror",
    10402: "Music",
    9648: "Mystery",
    10749: "Romance",
    878: "Sci-Fi",
    10770: "TV Movie",
    53: "Thriller",
    10752: "War",
    37: "Western",
  };

  if (!genreIds || genreIds.length === 0) return "Unknown Genre";

  return genreIds
    .slice(0, 3) // Show max 3 genres
    .map((id) => genres[id] || "Unknown")
    .join(", ");
}

// Show detailed movie information in a beautiful modal
async function showMovieDetails(movieId) {
  const apiKey =
    MOVIE_API_KEY !== "dein_api_key_hier" ? MOVIE_API_KEY : DEMO_API_KEY;

  try {
    // Show loading in modal
    showMovieModal("loading");

    const response = await fetch(
      `${MOVIE_API_BASE}/movie/${movieId}?api_key=${apiKey}&language=en-US`
    );
    const movie = await response.json();

    // Show movie details in modal
    showMovieModal("details", movie);
  } catch (error) {
    console.error("Error fetching movie details:", error);
    showMovieModal("error");
  }
}

function showMovieModal(type, movie = null) {
  // Remove existing modal
  const existingModal = document.getElementById("movie-modal");
  if (existingModal) {
    existingModal.remove();
  }

  let modalContent = "";

  if (type === "loading") {
    modalContent = `
      <div class="modal-content loading">
        <div class="spinner"></div>
        <p>Loading movie details...</p>
      </div>
    `;
  } else if (type === "error") {
    modalContent = `
      <div class="modal-content error">
        <h3>⚠️ Error</h3>
        <p>Sorry, couldn't load movie details. Please try again.</p>
        <button class="modal-close-btn" onclick="closeMovieModal()">Close</button>
      </div>
    `;
  } else if (type === "details" && movie) {
    modalContent = `
      <div class="modal-content details">
        <button class="modal-close-x" onclick="closeMovieModal()">×</button>
        
        <div class="modal-movie-info">
          <div class="modal-poster">
            <img src="${
              movie.poster_path
                ? MOVIE_IMAGE_BASE + movie.poster_path
                : "https://via.placeholder.com/300x450/cccccc/666666?text=No+Poster"
            }" 
                 alt="${movie.title} Poster">
          </div>
          
          <div class="modal-details">
            <h2>${movie.title}</h2>
            <div class="modal-meta">
              <span class="modal-year">${
                movie.release_date ? movie.release_date.split("-")[0] : "N/A"
              }</span>
              <span class="modal-runtime">${
                movie.runtime ? movie.runtime + " min" : "Unknown"
              }</span>
              <span class="modal-rating">⭐ ${movie.vote_average}/10</span>
            </div>
            
            <div class="modal-genres">
              ${movie.genres
                .map((g) => `<span class="genre-tag">${g.name}</span>`)
                .join("")}
            </div>
            
            <div class="modal-overview">
              <h4>Overview</h4>
              <p>${movie.overview || "No description available."}</p>
            </div>
            
            <div class="modal-stats">
              <div class="stat-item">
                <span class="stat-label">Votes</span>
                <span class="stat-value">${movie.vote_count.toLocaleString()}</span>
              </div>
              ${
                movie.budget
                  ? `
                <div class="stat-item">
                  <span class="stat-label">Budget</span>
                  <span class="stat-value">$${movie.budget.toLocaleString()}</span>
                </div>
              `
                  : ""
              }
              ${
                movie.revenue
                  ? `
                <div class="stat-item">
                  <span class="stat-label">Revenue</span>
                  <span class="stat-value">$${movie.revenue.toLocaleString()}</span>
                </div>
              `
                  : ""
              }
            </div>
            
            ${
              movie.production_countries.length > 0
                ? `
              <div class="modal-countries">
                <span class="countries-label">Production:</span>
                <span class="countries-list">${movie.production_countries
                  .map((c) => c.name)
                  .join(", ")}</span>
              </div>
            `
                : ""
            }
            
            <button class="modal-close-btn" onclick="closeMovieModal()">Close</button>
          </div>
        </div>
      </div>
    `;
  }

  // Create modal
  const modal = document.createElement("div");
  modal.id = "movie-modal";
  modal.className = "movie-modal";
  modal.innerHTML = modalContent;

  // Add to page
  document.body.appendChild(modal);

  // Close on background click
  modal.addEventListener("click", function (e) {
    if (e.target === modal) {
      closeMovieModal();
    }
  });

  // Show modal with animation
  setTimeout(() => modal.classList.add("show"), 10);
}

function closeMovieModal() {
  const modal = document.getElementById("movie-modal");
  if (modal) {
    modal.classList.remove("show");
    setTimeout(() => modal.remove(), 300);
  }
}

// Galerie Interaktivität (falls auf About Me Seite)
function initGallery() {
  const galleryItems = document.querySelectorAll(".gallery-item");

  if (galleryItems.length > 0) {
    galleryItems.forEach((item) => {
      item.addEventListener("click", function () {
        this.style.transform = "scale(0.95)";
        setTimeout(() => {
          this.style.transform = "";
        }, 150);
      });
    });
  }
}

// Scroll-Effekt für Header
function initScrollEffect() {
  const header = document.querySelector("header");

  if (header) {
    window.addEventListener("scroll", function () {
      if (window.scrollY > 50) {
        header.classList.add("scrolled");
      } else {
        header.classList.remove("scrolled");
      }
    });
  }
}

// Add to DOMContentLoaded
document.addEventListener("DOMContentLoaded", function () {
  console.log("JavaScript wird ausgeführt!");

  initNavigation();
  initDarkMode();
  initGallery();
  initScrollEffect();
  initAPITabs(); // Neue Funktion hinzufügen
});

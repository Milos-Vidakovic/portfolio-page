const API_CONFIG = {
  WEATHER_API_KEY: "YOUR_WEATHER_API_KEY_HERE",
  WEATHER_BASE_URL: "https://api.openweathermap.org/data/2.5/weather",
  FORECAST_BASE_URL: "https://api.openweathermap.org/data/2.5/forecast",
  GEO_BASE_URL: "https://api.openweathermap.org/geo/1.0/direct",
  MOVIE_API_KEY: "YOUR_MOVIE_API_KEY_HERE",
  MOVIE_API_BASE: "https://api.themoviedb.org/3",
  MOVIE_IMAGE_BASE: "https://image.tmdb.org/t/p/w500",
};

if (typeof window !== "undefined") {
  window.API_CONFIG = API_CONFIG;
  console.log("⚠️ Template geladen - echte Keys in config.js eintragen!");
}

document.addEventListener("DOMContentLoaded", function () {
  console.log("JavaScript wird ausgeführt!");

  // Navigation Toggle Funktionalität
  initNavigation();

  // Dark Mode Funktionalität
  initDarkMode();
});

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

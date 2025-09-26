// ==============================================
// NAVIGATION FUNKTIONEN
// ==============================================

function initNavigation() {
  const navToggle = document.getElementById("navToggle");
  const navMenu = document.getElementById("navMenu");

  if (navToggle && navMenu) {
    console.log("Navigation Elemente gefunden");

    // Toggle Event für Mobile Menu
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

// ==============================================
// DARK MODE FUNKTIONEN
// ==============================================

function initDarkMode() {
  const themeToggle = document.getElementById("themeToggle");
  const themeIcon = document.querySelector(".theme-icon");

  if (!themeToggle || !themeIcon) {
    console.error("Theme Toggle Elemente nicht gefunden!");
    return;
  }

  // Lade gespeicherte Theme-Einstellung aus localStorage
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

// Theme setzen Funktion
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

// ==============================================
// GALERIE & UI FUNKTIONEN
// ==============================================

// Galerie Interaktivität (falls auf About Me Seite)
function initGallery() {
  const galleryItems = document.querySelectorAll(".gallery-item");

  if (galleryItems.length > 0) {
    galleryItems.forEach((item) => {
      item.addEventListener("click", function () {
        // Kleiner Click-Effekt für bessere UX
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

// ==============================================
// CONTACT FORM FUNKTIONEN
// ==============================================

function initContactForm() {
  const contactForm = document.getElementById("contactForm");

  if (!contactForm) {
    return; // Kein Kontaktformular auf dieser Seite
  }

  console.log("✅ Contact Form gefunden - initialisiere...");

  contactForm.addEventListener("submit", function (e) {
    e.preventDefault(); // Verhindert normale Form-Submission

    console.log("📧 Kontaktformular wird verarbeitet...");

    // Form-Daten sammeln
    const formData = new FormData(contactForm);
    const name = formData.get("name").trim();
    const email = formData.get("email").trim();
    const message = formData.get("message").trim();

    // Validierung
    if (!name || !email || !message) {
      showFormMessage("Bitte fülle alle Felder aus.", "error");
      return;
    }

    if (!isValidEmail(email)) {
      showFormMessage("Bitte gib eine gültige E-Mail-Adresse ein.", "error");
      return;
    }

    // Button auf Loading setzen
    const submitBtn = contactForm.querySelector(".submit-btn");
    const originalText = submitBtn.innerHTML;
    submitBtn.classList.add("loading");
    submitBtn.innerHTML =
      '<span class="btn-icon">⏳</span><span class="btn-text">Sending</span>';
    submitBtn.disabled = true;

    // mailto: Link erstellen und öffnen
    setTimeout(() => {
      const subject = encodeURIComponent(`Message from ${name} via Portfolio`);
      const body = encodeURIComponent(`Hi Milos,

${message}

Best regards,
${name}

---
Email: ${email}
Sent via your portfolio contact form`);

      const mailtoLink = `mailto:milos.vidakovic@students.bfh.ch?subject=${subject}&body=${body}`;

      // E-Mail-Client öffnen
      window.location.href = mailtoLink;

      // Erfolgsmeldung anzeigen
      showFormMessage("E-Mail-Client wird geöffnet! 📧", "success");

      // Formular zurücksetzen
      contactForm.reset();

      // Button zurücksetzen
      submitBtn.classList.remove("loading");
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;

      console.log("✅ E-Mail erfolgreich vorbereitet!");
    }, 1000); // Kurze Verzögerung für UX
  });
}

// E-Mail Validierung
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Nachrichten anzeigen
function showFormMessage(message, type = "info") {
  // Entferne existierende Nachrichten
  const existingMessage = document.querySelector(".form-message");
  if (existingMessage) {
    existingMessage.remove();
  }

  // Erstelle neue Nachricht
  const messageDiv = document.createElement("div");
  messageDiv.className = `form-message form-message-${type}`;
  messageDiv.innerHTML = `
    <div class="message-content">
      <span class="message-icon">${
        type === "success" ? "✅" : type === "error" ? "❌" : "ℹ️"
      }</span>
      <span class="message-text">${message}</span>
    </div>
  `;

  // CSS für die Nachricht
  messageDiv.style.cssText = `
    position: fixed;
    top: 100px;
    right: 20px;
    background: ${
      type === "success" ? "#d4edda" : type === "error" ? "#f8d7da" : "#d1ecf1"
    };
    color: ${
      type === "success" ? "#155724" : type === "error" ? "#721c24" : "#0c5460"
    };
    border: 1px solid ${
      type === "success" ? "#c3e6cb" : type === "error" ? "#f5c6cb" : "#bee5eb"
    };
    border-radius: 8px;
    padding: 16px 20px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 10000;
    opacity: 0;
    transform: translateX(100%);
    transition: all 0.3s ease;
    max-width: 300px;
    font-weight: 500;
  `;

  // Nachricht zum DOM hinzufügen
  document.body.appendChild(messageDiv);

  // Animation einblenden
  setTimeout(() => {
    messageDiv.style.opacity = "1";
    messageDiv.style.transform = "translateX(0)";
  }, 100);

  // Nach 4 Sekunden ausblenden
  setTimeout(() => {
    messageDiv.style.opacity = "0";
    messageDiv.style.transform = "translateX(100%)";
    setTimeout(() => {
      if (messageDiv.parentNode) {
        messageDiv.parentNode.removeChild(messageDiv);
      }
    }, 300);
  }, 4000);
}

// CSS für message-content
const messageStyles = document.createElement("style");
messageStyles.textContent = `
  .message-content {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .message-icon {
    font-size: 18px;
  }
  
  .message-text {
    font-size: 14px;
    line-height: 1.4;
  }
  
  /* Dark Mode Support */
  [data-theme="dark"] .form-message {
    background: var(--bg-card) !important;
    color: var(--text-color) !important;
    border-color: var(--border-color) !important;
  }
`;
document.head.appendChild(messageStyles);

// ==============================================
// SMOOTH SCROLL FÜR INTERNE LINKS
// ==============================================

// Smooth Scroll für alle internen Anker-Links
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

// ==============================================
// INITIALIZATION - HAUPTFUNKTION
// ==============================================

document.addEventListener("DOMContentLoaded", function () {
  console.log("🚀 JavaScript wird ausgeführt!");
  console.log("🔧 Initialisiere alle Komponenten...");

  // Initialisiere alle Basisfunktionen
  initNavigation();
  initDarkMode();
  initGallery();
  initScrollEffect();
  initContactForm();

  console.log("✅ Alle Komponenten erfolgreich initialisiert!");
});

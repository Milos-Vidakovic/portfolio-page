document.addEventListener("DOMContentLoaded", function () {
  // Debugging-Ausgaben, um zu prüfen, ob JavaScript läuft
  console.log("JavaScript wird ausgeführt!");
  console.log("navMenu Element:", document.getElementById("navMenu"));
  console.log("navToggle Element:", document.getElementById("navToggle"));

  const navToggle = document.getElementById("navToggle");
  const navMenu = document.getElementById("navMenu");

  if (navToggle && navMenu) {
    console.log("Beide Elemente gefunden, füge Event-Listener hinzu");

    navToggle.addEventListener("click", function () {
      console.log("Toggle geklickt");
      navMenu.classList.toggle("active");
      this.classList.toggle("active");
    });

    // Schliesse Menü, wenn außerhalb geklickt wird
    document.addEventListener("click", function (e) {
      const isNavToggle = e.target.closest("#navToggle");
      const isNavMenu = e.target.closest("#navMenu");

      if (!isNavToggle && !isNavMenu && navMenu.classList.contains("active")) {
        navMenu.classList.remove("active");
        navToggle.classList.remove("active");
      }
    });
  } else {
    console.error("Fehler: Navigation-Elemente nicht gefunden!");
    if (!navToggle) console.error("navToggle nicht gefunden");
    if (!navMenu) console.error("navMenu nicht gefunden");
  }
});

/* ============================================================
   SCRIPT.JS – Ria Wulandari Portfolio Website
   NIM: 2311102173
   
   Fitur:
   1. Dark / Light Mode + localStorage
   2. Scroll Animation (IntersectionObserver)
   3. Active Navbar berdasarkan scroll
   4. Animasi Skill Progress Bar
   5. AJAX fetch Quote dari Public API
   ============================================================ */

/* ============================================================
   1. DARK / LIGHT MODE
   - Toggle tema dan simpan ke localStorage
   ============================================================ */
const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");

/**
 * Terapkan tema ke DOM berdasarkan nilai string 'dark' atau 'light'
 * Simpan nilai ke localStorage agar preferensi tetap saat reload
 * @param {string} theme - 'dark' atau 'light'
 */
function applyTheme(theme) {
  if (theme === "dark") {
    document.body.classList.add("dark-mode");
    themeIcon.className = "bi bi-sun-fill";
    themeIcon.style.color = "#facc15";
  } else {
    document.body.classList.remove("dark-mode");
    themeIcon.className = "bi bi-moon-fill";
    themeIcon.style.color = "";
  }
  localStorage.setItem("theme", theme);
}

// Baca preferensi dari localStorage saat halaman pertama kali dibuka
const savedTheme = localStorage.getItem("theme") || "light";
applyTheme(savedTheme);

// Event: klik tombol toggle
themeToggle.addEventListener("click", function () {
  const current = localStorage.getItem("theme") || "light";
  applyTheme(current === "light" ? "dark" : "light");
});

/* ============================================================
   2. SCROLL ANIMATION
   - Menggunakan IntersectionObserver API
   - Elemen dengan class .fade-in akan muncul saat masuk viewport
   ============================================================ */
const fadeObserver = new IntersectionObserver(
  function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");

        // Jika elemen berada di section #skills, jalankan animasi bar
        if (entry.target.closest && entry.target.closest("#skills")) {
          animateSkillBars();
        }
      }
    });
  },
  {
    threshold: 0.12, // Elemen terlihat minimal 12% sebelum animasi berjalan
  },
);

// Daftarkan semua elemen fade-in ke observer
document.querySelectorAll(".fade-in").forEach(function (el) {
  fadeObserver.observe(el);
});

/* ============================================================
   3. ACTIVE NAVBAR LINK BERDASARKAN SCROLL
   - Deteksi section yang sedang dilihat pengguna
   - Beri highlight pada nav-link yang sesuai
   ============================================================ */
const allSections = document.querySelectorAll("section[id]");
const allNavLinks = document.querySelectorAll(".nav-link-custom");

window.addEventListener("scroll", function () {
  let currentId = "";

  allSections.forEach(function (section) {
    const rect = section.getBoundingClientRect();
    // Section dianggap aktif jika top-nya ≤ 120px dari atas viewport
    if (rect.top <= 120 && rect.bottom >= 120) {
      currentId = section.getAttribute("id");
    }
  });

  allNavLinks.forEach(function (link) {
    link.classList.remove("active");
    if (link.getAttribute("href") === "#" + currentId) {
      link.classList.add("active");
    }
  });
});

/* ============================================================
   4. ANIMASI SKILL PROGRESS BAR
   - Jalankan hanya sekali (flag skillsAnimated)
   - Ambil nilai target dari atribut data-width
   ============================================================ */
let skillsAnimated = false;

/**
 * Animasikan semua element .skill-bar-fill
 * Lebar target diambil dari atribut data-width
 */
function animateSkillBars() {
  if (skillsAnimated) return;
  skillsAnimated = true;

  document.querySelectorAll(".skill-bar-fill").forEach(function (bar) {
    var target = bar.getAttribute("data-width");
    // Delay kecil agar transisi CSS terasa lebih halus
    setTimeout(function () {
      bar.style.width = target + "%";
    }, 150);
  });
}

/* ============================================================
   5. AJAX – FETCH QUOTE MOTIVASI DARI PUBLIC API
   
   Alur kerja AJAX:
   a. User klik tombol "Generate Quote"
   b. Fungsi fetchQuote() dipanggil
   c. XMLHttpRequest dikirim ke api.quotable.io/random
   d. Server mengembalikan data JSON
   e. JavaScript menampilkan quote & author di halaman
   f. Jika gagal → tampilkan fallback quote offline
   ============================================================ */

/**
 * Ambil quote dari API menggunakan XMLHttpRequest (AJAX)
 * URL: https://api.quotable.io/random
 */
function fetchQuote() {
  var quoteText = document.getElementById("quote-text");
  var quoteAuthor = document.getElementById("quote-author");
  var loading = document.getElementById("quote-loading");
  var refreshIcon = document.getElementById("refreshIcon");
  var btnRefresh = document.getElementById("btnRefresh");

  // --- Tampilkan loading state ---
  quoteText.style.opacity = "0";
  quoteAuthor.style.opacity = "0";
  loading.style.display = "block";
  refreshIcon.classList.add("spin");
  btnRefresh.disabled = true;

  // --- Buat objek XMLHttpRequest ---
  var xhr = new XMLHttpRequest();

  // Buka koneksi GET ke endpoint API
  xhr.open("GET", "https://api.quotable.io/random", true);

  // Set timeout 10 detik
  xhr.timeout = 10000;

  /**
   * onload: dipanggil saat response berhasil diterima
   */
  xhr.onload = function () {
    // Sembunyikan loading
    loading.style.display = "none";
    refreshIcon.classList.remove("spin");
    btnRefresh.disabled = false;

    if (xhr.status === 200) {
      // Parse data JSON dari server
      var data = JSON.parse(xhr.responseText);

      // Update konten di DOM
      quoteText.textContent = '"' + data.content + '"';
      quoteAuthor.textContent = "— " + data.author;

      // Fade in konten baru
      quoteText.style.opacity = "1";
      quoteAuthor.style.opacity = "1";
    } else {
      // Status bukan 200 → tampilkan fallback
      showFallbackQuote();
    }
  };

  /**
   * onerror: dipanggil jika terjadi error jaringan
   */
  xhr.onerror = function () {
    loading.style.display = "none";
    refreshIcon.classList.remove("spin");
    btnRefresh.disabled = false;
    showFallbackQuote();
  };

  /**
   * ontimeout: dipanggil jika request melebihi batas waktu
   */
  xhr.ontimeout = function () {
    loading.style.display = "none";
    refreshIcon.classList.remove("spin");
    btnRefresh.disabled = false;
    showFallbackQuote();
  };

  // Kirimkan request ke server
  xhr.send();
}

/**
 * Tampilkan quote offline sebagai fallback
 * digunakan jika API tidak dapat diakses
 */
function showFallbackQuote() {
  var fallbacks = [
    {
      content: "The only way to do great work is to love what you do.",
      author: "Steve Jobs",
    },
    {
      content: "First, solve the problem. Then, write the code.",
      author: "John Johnson",
    },
    {
      content: "Code is like humor. When you have to explain it, it's bad.",
      author: "Cory House",
    },
    {
      content:
        "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.",
      author: "Martin Fowler",
    },
    {
      content:
        "Success is not final, failure is not fatal. It is the courage to continue that counts.",
      author: "Winston Churchill",
    },
  ];

  // Pilih secara acak dari daftar fallback
  var random = fallbacks[Math.floor(Math.random() * fallbacks.length)];
  var quoteText = document.getElementById("quote-text");
  var quoteAuthor = document.getElementById("quote-author");

  quoteText.textContent = '"' + random.content + '"';
  quoteAuthor.textContent = "— " + random.author;
  quoteText.style.opacity = "1";
  quoteAuthor.style.opacity = "1";
}

// Panggil fetchQuote secara otomatis saat DOM selesai dimuat
document.addEventListener("DOMContentLoaded", function () {
  fetchQuote();
});

// ===== Ressenyes — ara via Elfsight widget (vegeu index.html) =====

// ===== Carta dinàmica =====
let cartaData = window.CARTA_DATA || [];

function renderCarta(lang) {
  const grid = document.getElementById('menuGrid');
  if (!grid || !cartaData.length) return;

  grid.innerHTML = '';
  cartaData.forEach(p => {
    const nom  = p['nom_'  + lang] || p.nom_ca;
    const desc = p['desc_' + lang] || p.desc_ca;
    const tag  = p['tag_'  + lang] || null;
    const tagClass = p.tag_cor ? 'dish-tag cor' : 'dish-tag';

    const div = document.createElement('div');
    div.className = 'dish';
    div.dataset.cat = p.cat;
    div.innerHTML = `
      <div class="dish-info">
        <div class="dish-top">
          <span class="dish-name">${nom}</span>
          ${tag ? `<span class="${tagClass}">${tag}</span>` : ''}
        </div>
        <p class="dish-desc">${desc}</p>
      </div>
      <span class="dish-price">${p.preu}</span>`;
    grid.appendChild(div);
  });

  const activeFilter = document.querySelector('.filter.active');
  if (activeFilter) activeFilter.click();
}


// ===== Language switch (CA / ES / EN) =====
(function initLang() {
  const buttons = document.querySelectorAll(".lang-switch button");
  const htmlEl = document.documentElement;

  function setLang(lang) {
    // Text content
    document.querySelectorAll("[data-es]").forEach((el) => {
      if (el.dataset.ca === undefined) el.dataset.ca = el.innerHTML;
      el.innerHTML =
        lang === "es"
          ? el.dataset.es
          : lang === "en"
            ? el.dataset.en || el.dataset.ca
            : el.dataset.ca;
    });
    // Placeholders
    document.querySelectorAll("[data-es-ph]").forEach((el) => {
      if (el.dataset.caPh === undefined)
        el.dataset.caPh = el.getAttribute("placeholder") || "";
      el.setAttribute(
        "placeholder",
        lang === "es"
          ? el.dataset.esPh
          : lang === "en"
            ? el.dataset.enPh || el.dataset.caPh
            : el.dataset.caPh,
      );
    });
    htmlEl.setAttribute("lang", lang);
    buttons.forEach((b) =>
      b.classList.toggle("active", b.dataset.lang === lang),
    );
    try {
      localStorage.setItem("salvaje-lang", lang);
    } catch (e) {}
    renderCarta(lang);
  }

  buttons.forEach((b) =>
    b.addEventListener("click", () => setLang(b.dataset.lang)),
  );
  let saved = "ca";
  try {
    saved = localStorage.getItem("salvaje-lang") || "ca";
  } catch (e) {}
  setLang(saved);
})();

// ===== Modal de reserva =====
const OCTOTABLE_URL =
  "https://octotable.com/book/restaurant/1001744/booking/new";

const modal = document.getElementById("reservaModal");
const iframe = document.getElementById("reservaIframe");
const btnOpen = document.getElementById("btnOpenReserva");
const btnClose = document.getElementById("btnCloseReserva");
const btnDone = document.getElementById("btnDoneReserva");
const confirm = document.getElementById("reservaConfirm");

function openModal() {
  if (iframe.src === "about:blank") iframe.src = OCTOTABLE_URL;
  modal.classList.add("open");
  document.body.style.overflow = "hidden";
}
function closeModal() {
  modal.classList.remove("open");
  document.body.style.overflow = "";
}
function showConfirm() {
  closeModal();
  confirm.classList.add("show");
  setTimeout(() => confirm.classList.remove("show"), 3500);
}

if (btnOpen) btnOpen.addEventListener("click", openModal);
if (btnClose) btnClose.addEventListener("click", closeModal);
if (btnDone) btnDone.addEventListener("click", showConfirm);
modal?.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});

// Els botons de "Reservar taula" del nav i hero també obren el modal
document.querySelectorAll('a[href="#reserves"].btn').forEach((a) => {
  a.addEventListener("click", (e) => {
    e.preventDefault();
    openModal();
  });
});

// Mobile menu
const burger = document.getElementById("burger");
const mobileMenu = document.getElementById("mobileMenu");

function toggleMenu(force) {
  const open =
    force !== undefined ? force : !mobileMenu.classList.contains("open");
  mobileMenu.classList.toggle("open", open);
  burger.classList.toggle("open", open);
  burger.setAttribute("aria-expanded", open);
}

burger.addEventListener("click", () => toggleMenu());
mobileMenu
  .querySelectorAll("a")
  .forEach((a) => a.addEventListener("click", () => toggleMenu(false)));
document.addEventListener("click", (e) => {
  if (
    mobileMenu.classList.contains("open") &&
    !mobileMenu.contains(e.target) &&
    !burger.contains(e.target)
  ) {
    toggleMenu(false);
  }
});

// Menu filters — query .dish dinàmicament per suportar render asíncron
const filters = document.querySelectorAll(".filter");
filters.forEach((btn) => {
  btn.addEventListener("click", () => {
    filters.forEach((f) => f.classList.remove("active"));
    btn.classList.add("active");
    const cat = btn.dataset.cat;
    document.querySelectorAll(".dish").forEach((d) => {
      const show = cat === "tots" || d.dataset.cat === cat;
      d.classList.toggle("hide", !show);
    });
  });
});

// Forms
const WEB3FORMS_KEY = "f34a842c-197f-4e66-9a78-b9385cdb2da9";
const DEST_EMAIL = "thaliasolerbravo2@gmail.com";

function handleForm(formId, msgId, buildSubject) {
  const form = document.getElementById(formId);
  const msg = document.getElementById(msgId);
  const btn = form.querySelector('button[type="submit"]');

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    btn.disabled = true;

    const datos = new FormData();
    datos.append("access_key", WEB3FORMS_KEY);
    datos.append("to", DEST_EMAIL);
    datos.append("subject", buildSubject(form));

    // Collect all visible fields as message body
    const lines = [];
    form.querySelectorAll("input, select, textarea").forEach((el) => {
      if (!el.id || el.type === "submit") return;
      const label = form.querySelector(`label[for="${el.id}"]`);
      const name = label ? label.textContent.trim() : el.id;
      lines.push(`${name}: ${el.value}`);
    });
    datos.append("message", lines.join("\n"));

    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: datos,
      });
      const json = await res.json();
      if (json.success) {
        msg.classList.add("show");
        form.querySelectorAll("input, select, textarea").forEach((el) => {
          if (el.type !== "submit") el.value = "";
        });
        setTimeout(() => msg.classList.remove("show"), 6000);
      } else {
        alert(
          "Hi ha hagut un error. Torna-ho a intentar o truca'ns directament.",
        );
      }
    } catch {
      alert("Error de connexió. Comprova la xarxa i torna-ho a intentar.");
    } finally {
      btn.disabled = false;
    }
  });
}

// ===== URL neta amb pushState al scroll =====
const sections = document.querySelectorAll("section[id], header[id]");
const sectionSlugs = {
  hero: "/",
  sobre: "/sobre",
  carta: "/carta",
  reserves: "/reserves",
  galeria: "/galeria",
  ressenyes: "/ressenyes",
  contacte: "/contacte",
};

const urlObs = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const slug = sectionSlugs[entry.target.id] || "/";
        if (location.pathname !== slug) history.replaceState(null, "", slug);
      }
    });
  },
  { threshold: 0.4 },
);

sections.forEach((s) => urlObs.observe(s));

// Set min date to today
const dataInput = document.getElementById("data");
if (dataInput) dataInput.min = new Date().toISOString().split("T")[0];

// Build OSM tile map (reliable static map — tiles load as plain images)
(function buildMap() {
  const tilemap = document.getElementById("tilemap");
  if (!tilemap) return;
  const z = 15,
    x0 = 16421,
    y0 = 12288; // 5x5 grid around Gandesa (41.0533, 0.4356)
  const res = window.__resources || {};
  for (let ty = y0; ty < y0 + 5; ty++) {
    for (let tx = x0; tx < x0 + 5; tx++) {
      const img = document.createElement("img");
      img.alt = "";
      img.src =
        res["tile_" + tx + "_" + ty] ||
        `https://tile.openstreetmap.org/${z}/${tx}/${ty}.png`;
      tilemap.appendChild(img);
    }
  }
})();

// Reveal on scroll
const obs = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in");
        obs.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.05 },
);
document.querySelectorAll(".reveal").forEach((el) => obs.observe(el));

// Fallback: force-reveal everything after 1.5s in case observer misses elements
setTimeout(() => {
  document.querySelectorAll(".reveal:not(.in)").forEach((el) => el.classList.add("in"));
}, 1500);

// Nav background solid after scroll
const nav = document.querySelector(".nav");
window.addEventListener("scroll", () => {
  nav.style.background =
    window.scrollY > 60 ? "rgba(30, 26, 20, 0.95)" : "rgba(30, 26, 20, 0.82)";
});

// ===== Cookie Consent =====
(function initCookies() {
  const banner  = document.getElementById("cookieBanner");
  const btnAccept = document.getElementById("cookieAccept");
  const btnReject = document.getElementById("cookieReject");
  const waBtn   = document.querySelector(".whatsapp-btn");
  const KEY     = "salvaje-cookies";

  function blockThirdParty() {
    // Block Google Maps
    document.querySelectorAll(".map-embed-wrap iframe").forEach(function(iframe) {
      iframe.src = "about:blank";
    });
    // Hide Elfsight Google Reviews
    const elfsight = document.querySelector(".elfsight-wrap");
    if (elfsight) elfsight.style.display = "none";
  }

  function hideBanner() {
    banner.classList.remove("show");
    if (waBtn) waBtn.style.bottom = "";
  }

  const consent = localStorage.getItem(KEY);

  if (!consent) {
    banner.classList.add("show");
    if (waBtn) waBtn.style.bottom = "calc(1.8rem + 90px)";
  } else if (consent === "rejected") {
    blockThirdParty();
  }

  btnAccept.addEventListener("click", function() {
    localStorage.setItem(KEY, "accepted");
    hideBanner();
  });

  btnReject.addEventListener("click", function() {
    localStorage.setItem(KEY, "rejected");
    hideBanner();
    blockThirdParty();
  });
})();

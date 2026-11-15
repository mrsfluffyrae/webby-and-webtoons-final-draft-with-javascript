/* app.js — Webby & Webtoons: JavaScript Extension
   Linked with <script src="app.js" defer> on all four pages.
   Every visual change uses classList (no element.style, no inline JS). */

console.log("app.js loaded");

// ── Utilities ────────────────────────────────────────────────
function getStorage(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
}
function setStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}
// Small helper: build an element with a class and text in one line
function makeEl(tag, className, text) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text !== undefined) el.textContent = text;
  return el;
}

// ── OOP ──────────────────────────────────────────────────────
class TeamMember {
  constructor(name, role, bio, skills) {
    this.name = name;
    this.role = role;
    this.bio = bio;
    this.skills = skills;      // array of strings
  }

  // Builds and returns a complete DOM card for this team member
  generateCard() {
    const card = makeEl("article", "team-card");
    card.tabIndex = 0;                                  // keyboard accessible

    const skillList = makeEl("ul", "skill-list");
    this.skills.forEach(skill => skillList.appendChild(makeEl("li", "tag", skill)));

    const bio = makeEl("p", "team-bio hidden", this.bio);   // hidden until clicked

    card.append(
      makeEl("h3", "", this.name),
      makeEl("p", "team-role", this.role),
      skillList,
      makeEl("p", "team-hint", "Tap to read more ✨"),
      bio
    );

    const toggleBio = () => bio.classList.toggle("hidden");
    card.addEventListener("click", toggleBio);
    card.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleBio(); }
    });
    return card;
  }
}

// ── Form helpers (used by Features C1, C2, C3) ───────────────
const FIELD_IDS = ["name", "email", "genre", "notes"];

// Each rule returns "" when valid, or an error message string
const FIELD_RULES = {
  name:  v => (v.trim().length >= 3 && v.trim().includes(" ")) ? "" : "Use at least 3 characters and include a space (first and last name).",
  email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? "" : "Enter a valid email with @ and a dot after it.",
  genre: v => v !== "" ? "" : "Please choose a favourite genre.",
  notes: v => v.trim().length >= 20 ? "" : "Write at least 20 characters (" + v.trim().length + "/20)."
};

// Checks one field, shows green/red feedback, returns true if valid
function validateField(id) {
  const field = document.getElementById(id);
  const msg = document.getElementById(id + "-msg");
  const error = FIELD_RULES[id](field.value);
  msg.textContent = error === "" ? "✓ Looks good!" : error;
  msg.classList.toggle("success", error === "");
  msg.classList.toggle("error", error !== "");
  return error === "";
}

// True only when every field passes at the same time (no messages shown)
function allFieldsValid() {
  return FIELD_IDS.every(id => FIELD_RULES[id](document.getElementById(id).value) === "");
}

function renderHistory() {
  const list = document.getElementById("history-list");
  if (!list) return;
  list.replaceChildren();                                   // remove old cards
  const entries = getStorage("wwSubmissions", []);
  if (entries.length === 0) {
    list.appendChild(makeEl("p", "", "No previous enquiries yet."));
    return;
  }
  entries.slice().reverse().forEach(entry => {              // newest first
    const card = makeEl("div", "history-card");
    card.append(
      makeEl("strong", "", entry.name),
      makeEl("p", "", "Genre: " + entry.subject),
      makeEl("small", "", "Submitted: " + new Date(entry.timestamp).toLocaleString())
    );
    list.appendChild(card);
  });
}

// ── Site-wide (run on every page) ────────────────────────────

// Feature S1: Dark mode toggle, remembered in localStorage
function initDarkMode() {
  const button = document.getElementById("dark-toggle");
  const apply = isDark => {
    document.body.classList.toggle("dark-mode", isDark);
    button.textContent = isDark ? "☀️ Light Mode" : "🌙 Dark Mode";
  };
  apply(getStorage("wwDarkMode", false));
  button.addEventListener("click", () => {
    const nowDark = !document.body.classList.contains("dark-mode");
    apply(nowDark);
    setStorage("wwDarkMode", nowDark);
  });
}

// Feature S2: Back to top button, created entirely in JavaScript
function initBackToTop() {
  const button = makeEl("button", "btn back-to-top", "⬆ Back to Top");
  button.type = "button";
  document.body.appendChild(button);
  window.addEventListener("scroll", () => {
    button.classList.toggle("show", window.scrollY > 300);   // class only, no inline styles
  });
  button.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

// Feature S3: Live quote banner (API first, local fallback second)
function initQuoteBanner() {
  const fallbackQuotes = [
    { text: "One more chapter never hurt anyone. 🌸", author: "Webby & Webtoons" },
    { text: "Every great story starts with a first episode.", author: "Webby & Webtoons" },
    { text: "Small steps each day add up to finished series.", author: "Webby & Webtoons" },
    { text: "It's okay to drop a story. Curating is a skill.", author: "Webby & Webtoons" },
    { text: "Read what makes you feel something.", author: "Webby & Webtoons" },
    { text: "Rest, sip tea, and come back to the next chapter. 🍵", author: "Webby & Webtoons" }
  ];
  let fallbackIndex = 0;

  const banner = makeEl("div", "quote-banner");
  const text = makeEl("p", "quote-text", "Loading quote…");
  const button = makeEl("button", "btn btn-outline quote-btn", "New Quote");
  button.type = "button";
  banner.append(text, button);
  document.querySelector(".site-header").after(banner);       // below the shared navbar

  async function loadQuote() {
    text.textContent = "Loading quote…";
    button.disabled = true;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);  // give up after 5 seconds
    try {
      const response = await fetch("https://api.quotable.io/random", { signal: controller.signal });
      if (!response.ok) throw new Error("Bad response");
      const data = await response.json();
      text.textContent = "“" + data.content + "” — " + data.author;
    } catch {
      const quote = fallbackQuotes[fallbackIndex % fallbackQuotes.length];   // rotate fallbacks
      fallbackIndex++;
      text.textContent = "“" + quote.text + "” — " + quote.author;
    } finally {
      clearTimeout(timer);
      button.disabled = false;
    }
  }
  button.addEventListener("click", loadQuote);
  loadQuote();
}

// ── index.html ────────────────────────────────────────────────

// Feature H1: Personalised hero greeting
function initHeroGreeting() {
  const heading = document.querySelector(".hero-heading");
  let name = getStorage("wwVisitorName", null);
  if (name) {
    heading.textContent = "Welcome back, " + name + "!";
    return;
  }
  const entered = prompt("Welcome to Webby & Webtoons! What is your name?");
  if (entered && entered.trim() !== "") {
    name = entered.trim();
    setStorage("wwVisitorName", name);
    heading.textContent = "Welcome, " + name + "!";
  }
}

// Feature H2: Service card hover effects
function initServiceCards() {
  document.querySelectorAll(".service-cards .card").forEach(card => {
    const more = card.querySelector(".card-more");
    card.addEventListener("mouseover", () => {
      card.classList.add("card-active");
      more.classList.remove("hidden");
    });
    card.addEventListener("mouseout", () => {
      card.classList.remove("card-active");
      more.classList.add("hidden");
    });
  });
}

// Feature H3: Visit counter (survives refreshes and page changes)
function initVisitCounter() {
  const visits = getStorage("wwVisits", 0) + 1;
  setStorage("wwVisits", visits);
  document.getElementById("visit-count").textContent =
    "You have visited this page " + visits + " time(s)";
}

// ── about.html ───────────────────────────────────────────────

// Feature A1: Filterable table (tiers: Quick Reads / Long Hauls, set by data-tier)
function initPricingFilter() {
  const table = document.getElementById("pricing-table");
  const rows = table.querySelectorAll("tbody tr");
  const tiers = [["all", "All"], ["quick", "Quick Reads ⚡"], ["long", "Long Hauls 🐉"]];

  const bar = makeEl("div", "filter-bar");
  tiers.forEach(([tier, label]) => {
    const button = makeEl("button", "btn btn-outline filter-btn", label);
    button.type = "button";
    if (tier === "all") button.classList.add("active");
    button.addEventListener("click", () => {
      bar.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
      button.classList.add("active");
      rows.forEach(row => {
        row.classList.toggle("hidden", tier !== "all" && row.dataset.tier !== tier);
      });
    });
    bar.appendChild(button);
  });
  table.closest(".table-wrap").before(bar);                    // buttons sit above the table
}

// Feature A2: Accordion FAQ generated from an array
function initFAQ() {
  const faqItems = [
    { question: "How do I keep track of what I'm reading?", answer: "Use the Library page: note the title, your current chapter and the date you last read it, so \"where was I?\" never happens again." },
    { question: "What does \"marinating\" mean?", answer: "Marinating is our word for series you're saving for later, like a completed status, a rainy weekend or the right mood." },
    { question: "How do I pick my first webtoon?", answer: "Start with a completed series, read the first three episodes, and match the vibe to your mood. Our Starter Kit above has the full guide." },
    { question: "Do I need an account?", answer: "No. Webby & Webtoons is a diary-style site, so there is nothing to sign up for." },
    { question: "How do recommendations work?", answer: "Fill in the Contact & Recommend Me form with your favourite genre and what you love, and we'll point you to your next obsession." },
    { question: "Which genres do you cover?", answer: "Romance, Fantasy, Thriller and Slice of Life, with Sci-Fi picks showing up in our trending lists too." }
  ];
  const faq = document.getElementById("faq");

  faqItems.forEach(item => {
    const wrapper = makeEl("div", "faq-item");
    const question = makeEl("h3", "faq-question", item.question);
    question.tabIndex = 0;
    question.setAttribute("role", "button");
    question.setAttribute("aria-expanded", "false");
    const answer = makeEl("p", "faq-answer hidden", item.answer);

    const toggle = () => {
      const opening = answer.classList.contains("hidden");
      // Close everything first so only one answer is open at a time
      faq.querySelectorAll(".faq-answer").forEach(a => a.classList.add("hidden"));
      faq.querySelectorAll(".faq-question").forEach(q => {
        q.classList.remove("open");
        q.setAttribute("aria-expanded", "false");
      });
      if (opening) {
        answer.classList.remove("hidden");
        question.classList.add("open");
        question.setAttribute("aria-expanded", "true");
      }
    };
    question.addEventListener("click", toggle);
    question.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); }
    });

    wrapper.append(question, answer);
    faq.appendChild(wrapper);
  });
}

// Feature A3: Team member cards using the TeamMember class
function initTeamCards() {
  const team = document.getElementById("team");
  const members = [
    new TeamMember("Mei Tanaka", "Founder & Chief Binge-Reader",
      "Mei started Webby & Webtoons after losing her place in one too many series. She believes every reader deserves a cozy place to keep track of the stories they love.",
      ["Romance", "Slow burns", "Tracking"]),
    new TeamMember("Kofi Mensah", "Genre Curator",
      "Kofi hunts down the best fantasy epics and hidden gems, and builds the genre guides that help new readers pick their first series.",
      ["Fantasy", "Worldbuilding", "Reviews"]),
    new TeamMember("Zuri Njeri", "Community Host",
      "Zuri reads every recommendation request and matches readers with their next obsession, from thrillers to quiet slice-of-life stories.",
      ["Thrillers", "Recommendations", "Cozy corners"])
  ];
  members.forEach(member => team.appendChild(member.generateCard()));
}

// ── contact.html ────────────────────────────────────────────

// Feature C1: Real-time validation on the input event
function initFormValidation() {
  const submit = document.querySelector("#contact-form button[type='submit']");
  submit.disabled = true;                                       // disabled until all fields pass
  FIELD_IDS.forEach(id => {
    const field = document.getElementById(id);
    const check = () => {
      validateField(id);
      submit.disabled = !allFieldsValid();
    };
    field.addEventListener("input", check);
    field.addEventListener("change", check);                    // some browsers fire change for <select>
  });
}

// Feature C2: Submission handler (saves to localStorage, no alert)
function initFormSubmit() {
  const form = document.getElementById("contact-form");
  const submit = form.querySelector("button[type='submit']");
  const status = document.getElementById("form-status");

  form.addEventListener("submit", event => {
    event.preventDefault();
    if (!allFieldsValid()) return;

    const select = document.getElementById("genre");
    const entry = {
      name: document.getElementById("name").value.trim(),
      email: document.getElementById("email").value.trim(),
      subject: select.options[select.selectedIndex].text,
      message: document.getElementById("notes").value.trim(),
      timestamp: new Date().toISOString()
    };

    const submissions = getStorage("wwSubmissions", []);        // keep existing entries
    submissions.push(entry);
    setStorage("wwSubmissions", submissions);

    status.textContent = "✅ Thank you, " + entry.name + "! Your enquiry was received.";
    form.reset();                                               // clear all fields
    FIELD_IDS.forEach(id => {
      const msg = document.getElementById(id + "-msg");
      msg.textContent = "";
      msg.classList.remove("success", "error");
    });
    submit.disabled = true;
    renderHistory();
  });
}

// Feature C3: Collapsible enquiry history with Clear History button
function initEnquiryHistory() {
  const panel = makeEl("details", "card white history-panel");
  const summary = makeEl("summary", "", "📜 Previous Enquiries");
  const list = makeEl("div", "");
  list.id = "history-list";
  const clear = makeEl("button", "btn btn-outline", "Clear History");
  clear.type = "button";

  clear.addEventListener("click", () => {
    if (confirm("Delete all saved enquiries?")) {
      localStorage.removeItem("wwSubmissions");
      renderHistory();
    }
  });

  panel.append(summary, list, clear);
  document.querySelector("main").appendChild(panel);
  renderHistory();
}

// ── Entry point ──────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  // Always runs on every page
  initDarkMode();
  initBackToTop();
  initQuoteBanner();

  // Page-specific: check for a known element before calling
  if (document.querySelector(".hero-heading")) initHeroGreeting();
  if (document.querySelector(".service-cards")) initServiceCards();
  if (document.getElementById("visit-count")) initVisitCounter();
  if (document.getElementById("pricing-table")) initPricingFilter();
  if (document.getElementById("faq")) initFAQ();
  if (document.getElementById("team")) initTeamCards();
  if (document.getElementById("contact-form")) {
    initFormValidation();
    initFormSubmit();
    initEnquiryHistory();
  }
});

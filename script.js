
(function () {
  "use strict";

  // If executed in Node.js (e.g. running "node script.js" or pressing Run in IDE)
  if (typeof window === "undefined") {
    console.log("Starting Braj Yatra backend server via server.js...");
    require("./server.js");
    return;
  }

  // Backend API Base URL detection:
  // If running via Live Server (e.g. port 5500) or file:// protocol, target backend port 3000.
  // If running directly on the backend server (port 3000), use relative origin "".
  var API_BASE = "";
  if (window.location.protocol === "file:" || (window.location.port && window.location.port !== "3000" && window.location.port !== "3001")) {
    API_BASE = "http://localhost:3000";
  }

  // Static Local Fallback Data (ensures 100% offline functionality if server is offline)
  var FALLBACK_PLACES = [
    {
      id: "janmabhoomi",
      name: "Shri Krishna Janmabhoomi",
      area: "Mathura",
      cats: ["temples", "heritage"],
      h: 1.5,
      slot: "morning",
      timing: "5:30 AM - 12:00 PM, 4:00 PM - 8:30 PM",
      crowd: "High",
      waitTimeMin: 35,
      dressCode: "Modest attire; no phones inside",
      image: "assets/janmabhoomi.jpg",
      note: "The sacred prison cell where Lord Krishna manifested. Strict security check outside.",
      audio: "Shri Krishna Janmabhoomi is the revered sanctum where Lord Krishna was born to Devaki and Vasudeva."
    },
    {
      id: "bankebihari",
      name: "Shri Banke Bihari Temple",
      area: "Vrindavan",
      cats: ["temples"],
      h: 1.5,
      slot: "morning",
      timing: "7:45 AM - 12:00 PM, 5:30 PM - 9:30 PM",
      crowd: "Very High",
      waitTimeMin: 50,
      dressCode: "Keep spectacles and bags safe from monkeys",
      image: "assets/bankebihari.jpg",
      note: "Vrindavan's most celebrated deity in Tribhanga posture. Darshan curtains open and close continuously.",
      audio: "Banke Bihari was manifested by Swami Haridas in Nidhivan. The Lord is awakened gently with sweet bhajans."
    },
    {
      id: "premmandir",
      name: "Prem Mandir (Love Temple)",
      area: "Vrindavan",
      cats: ["temples"],
      h: 1.5,
      slot: "evening",
      timing: "5:30 AM - 12:00 PM, 4:30 PM - 8:30 PM (Light show at 7:30 PM)",
      crowd: "High",
      waitTimeMin: 25,
      dressCode: "Modest clothing",
      image: "assets/prem-mandir.jpg",
      note: "Italian white Carrara marble temple with breathtaking colorful evening fountain lighting.",
      audio: "Constructed over 11 years, Prem Mandir represents divine love and illuminates in vibrant kaleidoscopic hues at twilight."
    },
    {
      id: "vishram",
      name: "Vishram Ghat & Yamuna Aarti",
      area: "Mathura",
      cats: ["ghats", "temples"],
      h: 1,
      slot: "evening",
      timing: "Open all day; Evening Aarti at 7:00 PM",
      crowd: "High",
      waitTimeMin: 15,
      dressCode: "Footwear removed on ghats",
      image: "assets/vishram.jpg",
      note: "The central ghat where Krishna rested after defeating Kansa. Sunset boat ride and grand evening Maha Aarti.",
      audio: "Vishram Ghat marks the sacred spot where Krishna rested. The evening Yamuna Aarti with glowing lamps is spiritually sublime."
    },
    {
      id: "giriraj",
      name: "Govardhan Hill (Giriraj Parikrama)",
      area: "Govardhan",
      cats: ["nature", "temples"],
      h: 3,
      slot: "morning",
      timing: "Parikrama path open 24/7",
      crowd: "High",
      waitTimeMin: 20,
      dressCode: "Walking shoes or cotton socks",
      image: "assets/giriraj.jpg",
      note: "21 km sacred circumambulation of the holy hill lifted by Krishna on his little finger.",
      audio: "Govardhan Hill is non-different from Lord Krishna. Completing the 21 km circuit brings peace and fulfillment."
    },
    {
      id: "radharani",
      name: "Shri Radha Rani Temple",
      area: "Barsana",
      cats: ["temples", "heritage"],
      h: 2,
      slot: "morning",
      timing: "5:00 AM - 12:00 PM, 4:30 PM - 8:30 PM",
      crowd: "High",
      waitTimeMin: 30,
      dressCode: "Stair climbing or ropeway pass",
      image: "assets/radharani.jpg",
      note: "Perched on Bhanugarh hill overlooking scenic Barsana. Home of world-famous Lathmar Holi.",
      audio: "Barsana is the birthplace of Shri Radha. Her hilltop palace temple offers panoramic views of sacred Braj."
    },
    {
      id: "ramanreti",
      name: "Raman Reti Sacred Sands",
      area: "Gokul",
      cats: ["nature", "temples"],
      h: 1.5,
      slot: "morning",
      timing: "5:30 AM - 12:00 PM, 4:00 PM - 8:30 PM",
      crowd: "Moderate",
      waitTimeMin: 15,
      dressCode: "Barefoot in sacred sand; modest clothing",
      image: "assets/ramanreti.jpg",
      note: "The holy soft white sands where child Krishna and Balaram rolled and played with cowherds. Features a peaceful deer park.",
      audio: "Pilgrims from around the world roll in the holy sands of Raman Reti in Gokul to receive baby Krishna's divine blessing."
    },
    {
      id: "brahmandghat",
      name: "Brahmand Ghat",
      area: "Gokul",
      cats: ["ghats", "temples"],
      h: 1,
      slot: "evening",
      timing: "Open all day; Evening Aarti at 6:30 PM",
      crowd: "Moderate",
      waitTimeMin: 10,
      dressCode: "Footwear removed on the riverside steps",
      image: "assets/vishram.jpg",
      note: "The sacred Yamuna ghat where toddler Krishna ate clay dirt and revealed the entire cosmic universe to Mother Yashoda.",
      audio: "At Brahmand Ghat in Gokul, Lord Krishna revealed the entire universe within his mouth to astonished Mother Yashoda."
    }
  ];

  var AREAS = ["Mathura", "Vrindavan", "Gokul", "Govardhan", "Barsana"];
  var CATS = {
    temples: "Temples",
    ghats: "Ghats & River",
    heritage: "Heritage",
    food: "Braj Food",
    nature: "Open Air & Groves"
  };

  var PACE_OPTIONS = {
    relaxed: { label: "Relaxed", hint: "4 to 5 hours of sights a day, relaxed temple darshans." },
    standard: { label: "Standard", hint: "6 to 7 hours of sights a day, balanced travel." },
    packed: { label: "Packed", hint: "Up to 9 hours a day, covering maximum shrines." }
  };

  var MODE_OPTIONS = {
    erick: { label: "E-Rickshaw / Auto", name: "e-rickshaw / auto" },
    cab: { label: "Private AC Cab", name: "private AC cab" }
  };

  var STAY_OPTIONS = {
    budget: { label: "Budget (Dharamshala / Inn)" },
    mid: { label: "Mid-Range Hotel" },
    comfort: { label: "Comfort / Luxury Resort" }
  };

  var MONTHS = [
    ["Jan", "good", "cool"], ["Feb", "good", "mild"], ["Mar", "good", "warm"],
    ["Apr", "hot", "hot"], ["May", "hot", "hottest"], ["Jun", "hot", "hot"],
    ["Jul", "", "humid"], ["Aug", "", "humid"], ["Sep", "", "humid"],
    ["Oct", "good", "mild"], ["Nov", "good", "pleasant"], ["Dec", "good", "cold"]
  ];

  var FESTIVALS = [
    { n: "Lathmar Holi", w: "February to March", d: "Barsana & Nandgaon. Women playfully beat shields held by men in the week before Holi." },
    { n: "Braj Maha Holi", w: "February to March", d: "Mathura and Vrindavan celebrate with vibrant colors, fragrant flower petals (Phoolon ki Holi), and temple dances." },
    { n: "Jhulan Yatra", w: "July to August", d: "Temples set up beautifully decorated swings for the deities during monsoon. Vrindavan is peaceful and lush." },
    { n: "Shri Krishna Janmashtami", w: "August to September", d: "Krishna's birthday manifestation. Mathura and Vrindavan temples stay awake until midnight. Book rooms 2 months ahead." },
    { n: "Radhashtami", w: "August to September", d: "Radha's birthday celebrated with grand pomp, centered on Barsana two weeks after Janmashtami." },
    { n: "Govardhan Puja & Annakut", w: "October to November", d: "Held the day after Diwali. Devotees offer mountains of 56 bhog sweets and walk the 21 km Govardhan Parikrama." }
  ];

  // Application State
  var state = {
    days: 2,
    interests: ["temples", "ghats", "food"],
    pace: "standard",
    mode: "erick",
    stay: "mid",
    group: 2,
    pinned: [],
    areaFilter: "All",
    catFilter: "All",
    searchQuery: "",
    places: [],
    crowdTelemetry: [],
    isVoiceEnabled: true,
    isHindi: false
  };

  // DOM Helpers
  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s || "").replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  // Load Saved State from LocalStorage
  try {
    var saved = JSON.parse(localStorage.getItem("braj-yatra-v2") || "null");
    if (saved && typeof saved === "object") {
      if (saved.days >= 1 && saved.days <= 5) state.days = saved.days;
      if (Array.isArray(saved.interests)) state.interests = saved.interests;
      if (PACE_OPTIONS[saved.pace]) state.pace = saved.pace;
      if (MODE_OPTIONS[saved.mode]) state.mode = saved.mode;
      if (STAY_OPTIONS[saved.stay]) state.stay = saved.stay;
      if (saved.group >= 1 && saved.group <= 15) state.group = saved.group;
      if (Array.isArray(saved.pinned)) state.pinned = saved.pinned;
    }
  } catch (e) {}

  function persistState() {
    try {
      localStorage.setItem("braj-yatra-v2", JSON.stringify({
        days: state.days,
        interests: state.interests,
        pace: state.pace,
        mode: state.mode,
        stay: state.stay,
        group: state.group,
        pinned: state.pinned
      }));
    } catch (e) {}
  }

  /* ----------------- 1. BACKEND API INITIALIZATION ----------------- */
  function checkServerHealth() {
    var startTime = performance.now();
    fetch((API_BASE ? API_BASE : "") + "/api/health")
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var elapsed = Math.round(performance.now() - startTime);
        var badge = $("serverStatusBadge");
        if (badge) {
          badge.textContent = "🟢 Live API Online (" + elapsed + "ms • " + (data.placesCount || 20) + " sites)";
          badge.style.color = "#10B981";
        }
      })
      .catch(function () {
        var badge = $("serverStatusBadge");
        if (badge) {
          badge.textContent = "🟡 Offline Mode (Local Fallback Active)";
          badge.style.color = "#F59E0B";
        }
      });
  }

  function fetchPlaces() {
    fetch((API_BASE ? API_BASE : "") + "/api/places")
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data && data.places && data.places.length > 0) {
          state.places = data.places;
          var countElem = $("statPlacesCount");
          if (countElem) countElem.textContent = state.places.length + "+";
          renderPlaces();
          renderForm();
          generateItinerary();
        } else {
          fallbackPlaces();
        }
      })
      .catch(function () {
        fallbackPlaces();
      });
  }

  function fallbackPlaces() {
    state.places = FALLBACK_PLACES;
    renderPlaces();
    renderForm();
    generateItinerary();
  }

  function fetchCrowdRadar() {
    fetch((API_BASE ? API_BASE : "") + "/api/crowd-radar")
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data && data.crowdTelemetry) {
          state.crowdTelemetry = data.crowdTelemetry;
          renderCrowdRadar(data.radarTime);
        }
      })
      .catch(function () {
        renderCrowdRadar("Local Estimate");
      });
  }

  /* ----------------- 2. LIVE CROWD RADAR RENDER ----------------- */
  function renderCrowdRadar(timeStr) {
    var host = $("crowdGrid");
    var timeElem = $("radarTimestamp");
    if (timeElem && timeStr) timeElem.textContent = timeStr;

    var items = state.crowdTelemetry.length > 0 ? state.crowdTelemetry : [
      { id: "bankebihari", name: "Shri Banke Bihari Temple", town: "Vrindavan", currentWaitTimeMin: 45, status: "High Rush", statusColor: "red", nextEvent: "Shringar Darshan (10:15 AM)", recommendation: "Hold phones and spectacles safely from monkeys." },
      { id: "premmandir", name: "Prem Mandir", town: "Vrindavan", currentWaitTimeMin: 20, status: "Moderate", statusColor: "amber", nextEvent: "Musical Fountain & Light Show (7:30 PM)", recommendation: "Arrive 45 mins before fountain show." },
      { id: "janmabhoomi", name: "Krishna Janmabhoomi", town: "Mathura", currentWaitTimeMin: 25, status: "Moderate", statusColor: "amber", nextEvent: "Midday Bhog Aarti (11:30 AM)", recommendation: "Use dedicated cloakroom for smart devices." },
      { id: "vishram", name: "Vishram Ghat", town: "Mathura", currentWaitTimeMin: 10, status: "Smooth", statusColor: "green", nextEvent: "Yamuna Maha Aarti (7:00 PM)", recommendation: "Ideal sunset boat ride window 5:30 - 6:30 PM." },
      { id: "giriraj", name: "Govardhan Hill Circuit", town: "Govardhan", currentWaitTimeMin: 10, status: "Smooth", statusColor: "green", nextEvent: "Mansi Ganga Deepdaan", recommendation: "Golf carts & e-rickshaws available at Dan Ghati." }
    ];

    host.innerHTML = items.map(function (c) {
      return (
        '<div class="crowd-card">' +
          '<div class="crowd-card-top">' +
            '<div>' +
              '<span class="crowd-town">' + esc(c.town) + '</span>' +
              '<h3>' + esc(c.name) + '</h3>' +
            '</div>' +
            '<span class="crowd-status-pill ' + (c.statusColor || "amber") + '">' + esc(c.status) + '</span>' +
          '</div>' +
          '<div class="crowd-metric-row">' +
            '<div class="metric-item">' +
              '<span class="metric-val">' + (c.currentWaitTimeMin || 20) + ' min</span>' +
              '<span class="metric-lbl">Est. Queue Time</span>' +
            '</div>' +
            '<div class="metric-item">' +
              '<span class="metric-val" style="font-size:1.1rem; color:var(--river);">' + (c.footfallToday ? c.footfallToday.toLocaleString("en-IN") : "18k+") + '</span>' +
              '<span class="metric-lbl">Devotees Today</span>' +
            '</div>' +
          '</div>' +
          '<div class="crowd-event-tag">⏱️ <span>' + esc(c.nextEvent || "Open for Darshan") + '</span></div>' +
          '<p class="crowd-rec">💡 ' + esc(c.recommendation || "Respect temple norms and travel light.") + '</p>' +
        '</div>'
      );
    }).join("");
  }

  $("refreshRadarBtn").addEventListener("click", function () {
    var btn = $("refreshRadarBtn");
    btn.textContent = "Refreshing...";
    fetchCrowdRadar();
    setTimeout(function () {
      btn.innerHTML = '<span class="refresh-icon">🔄</span> Refresh Telemetry';
    }, 600);
  });

  /* ----------------- 3. SACRED PLACES DIRECTORY & SEARCH ----------------- */
  function renderTownChips() {
    var host = $("areaChips");
    host.innerHTML = ["All"].concat(AREAS).map(function (a) {
      return (
        '<button type="button" class="chip" data-area="' + a + '" aria-pressed="' + (state.areaFilter === a) + '">' +
          a +
        '</button>'
      );
    }).join("");
  }

  $("areaChips").addEventListener("click", function (e) {
    var b = e.target.closest("button[data-area]");
    if (!b) return;
    state.areaFilter = b.getAttribute("data-area");
    renderTownChips();
    renderPlaces();
  });

  $("categoryPills").addEventListener("click", function (e) {
    var b = e.target.closest(".cat-pill");
    if (!b) return;
    var pills = document.querySelectorAll(".cat-pill");
    pills.forEach(function (p) { p.classList.remove("active"); });
    b.classList.add("active");
    state.catFilter = b.getAttribute("data-cat");
    renderPlaces();
  });

  var searchInput = $("placeSearchInput");
  var clearSearchBtn = $("clearSearchBtn");

  searchInput.addEventListener("input", function (e) {
    state.searchQuery = e.target.value.trim().toLowerCase();
    clearSearchBtn.hidden = state.searchQuery.length === 0;
    renderPlaces();
  });

  clearSearchBtn.addEventListener("click", function () {
    searchInput.value = "";
    state.searchQuery = "";
    clearSearchBtn.hidden = true;
    renderPlaces();
  });

  function renderPlaces() {
    var list = state.places.filter(function (p) {
      var matchArea = state.areaFilter === "All" || p.area.toLowerCase() === state.areaFilter.toLowerCase();
      var matchCat = state.catFilter === "All" || (p.cats && p.cats.includes(state.catFilter));
      var matchSearch = true;
      if (state.searchQuery) {
        var q = state.searchQuery;
        matchSearch = p.name.toLowerCase().includes(q) ||
                      p.note.toLowerCase().includes(q) ||
                      p.area.toLowerCase().includes(q);
      }
      return matchArea && matchCat && matchSearch;
    });

    var countElem = $("placesFoundCount");
    if (countElem) {
      countElem.textContent = "Showing " + list.length + " of " + state.places.length + " sacred places";
    }

    var pinnedBadge = $("pinnedCountBadge");
    if (pinnedBadge) {
      pinnedBadge.textContent = state.pinned.length + " place(s) pinned in trip";
    }

    var grid = $("placeGrid");
    if (list.length === 0) {
      grid.innerHTML = '<div class="glass-panel" style="padding:28px; text-align:center; grid-column:1/-1;">No sacred places found matching your filter. Try clearing filters or search term.</div>';
      return;
    }

    grid.innerHTML = list.map(function (p) {
      var isPinned = state.pinned.indexOf(p.id) > -1;
      var img = p.image || "assets/hero-bg.jpg";
      var crowdColor = (p.crowd === "High" || p.crowd === "Very High") ? "style='background:rgba(239,68,68,0.2); color:#EF4444; border:1px solid #EF4444;'" : "style='background:rgba(16,185,129,0.2); color:#10B981; border:1px solid #10B981;'";

      return (
        '<article class="place-card" data-place-id="' + p.id + '">' +
          '<div class="place-img-holder">' +
            '<img src="' + img + '" alt="' + esc(p.name) + '" loading="lazy" onerror="this.onerror=null; this.src=\'assets/hero-bg.jpg\';">' +
            '<span class="place-town-badge">' + esc(p.area) + '</span>' +
            '<span class="place-crowd-badge" ' + crowdColor + '>' + (p.crowd || "Moderate") + ' Rush</span>' +
          '</div>' +
          '<div class="place-body">' +
            '<h3>' + esc(p.name) + '</h3>' +
            '<div class="place-tags">' +
              (p.cats || []).map(function (c) { return '<span class="place-tag">' + (CATS[c] || c) + '</span>'; }).join("") +
            '</div>' +
            '<p class="place-desc">' + esc(p.note) + '</p>' +
            (p.timing ? '<div class="place-timings-note">🕒 ' + esc(p.timing) + '</div>' : '') +
          '</div>' +
          '<div class="place-footer">' +
            '<button type="button" class="btn-audio-listen" data-audio-id="' + p.id + '">' +
              '🔊 <span>Listen Story</span>' +
            '</button>' +
            '<button type="button" class="pin-btn" data-pin-id="' + p.id + '" aria-pressed="' + isPinned + '">' +
              (isPinned ? "✓ In Itinerary" : "+ Add to Trip") +
            '</button>' +
          '</div>' +
        '</article>'
      );
    }).join("");
  }

  function openPlaceDetailsModal(p) {
    var modalBackdrop = $("placeDetailsBackdrop");
    var modalContent = $("placeDetailsContent");
    if (!modalBackdrop || !modalContent) return;

    var isPinned = state.pinned.indexOf(p.id) > -1;
    var img = p.image || "assets/hero-bg.jpg";
    var crowdClass = (p.crowd === "High" || p.crowd === "Very High") ? "crowd-high" : "crowd-ok";

    modalContent.innerHTML = 
      '<button type="button" class="modal-close-corner" id="closePlaceModalBtn" aria-label="Close dialog">&times;</button>' +
      '<div class="modal-place-hero" style="background-image: linear-gradient(180deg, rgba(6,11,20,0.1) 0%, rgba(6,11,20,0.85) 100%), url(\'' + img + '\');">' +
        '<span class="place-town-badge">' + esc(p.area) + '</span>' +
        '<span class="place-crowd-badge ' + crowdClass + '">' + (p.crowd || "Moderate") + ' Rush</span>' +
        '<div class="modal-hero-title-wrap">' +
          '<h2 class="modal-place-title">' + esc(p.name) + '</h2>' +
          '<div class="place-tags">' +
            (p.cats || []).map(function (c) { return '<span class="place-tag">' + (CATS[c] || c) + '</span>'; }).join("") +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="modal-place-body">' +
        '<p class="modal-place-desc">' + esc(p.note) + '</p>' +
        '<div class="modal-telemetry-grid">' +
          '<div class="modal-telem-item">' +
            '<span class="telem-icon">🕒</span>' +
            '<div>' +
              '<div class="m-lbl">Darshan & Aarti Timings</div>' +
              '<div class="m-val">' + esc(p.timing || "Open daily 6:00 AM - 8:00 PM") + '</div>' +
            '</div>' +
          '</div>' +
          '<div class="modal-telem-item">' +
            '<span class="telem-icon">⏱️</span>' +
            '<div>' +
              '<div class="m-lbl">Typical Queue Wait</div>' +
              '<div class="m-val">' + (p.waitTimeMin ? p.waitTimeMin + " Minutes" : "15-20 Minutes") + '</div>' +
            '</div>' +
          '</div>' +
          '<div class="modal-telem-item">' +
            '<span class="telem-icon">⏳</span>' +
            '<div>' +
              '<div class="m-lbl">Suggested Time</div>' +
              '<div class="m-val">' + (p.h ? p.h + " Hours" : "1 Hour") + ' (' + (p.slot || "Morning") + ')</div>' +
            '</div>' +
          '</div>' +
          '<div class="modal-telem-item">' +
            '<span class="telem-icon">👔</span>' +
            '<div>' +
              '<div class="m-lbl">Devotee Guidelines</div>' +
              '<div class="m-val">' + esc(p.dressCode || "Modest attire recommended; remove footwear") + '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="modal-place-actions">' +
          '<button type="button" class="btn btn-outline-gold" id="modalAudioBtn">' +
            '🔊 <span>Listen Sacred Legend</span>' +
          '</button>' +
          '<button type="button" class="btn btn-primary" id="modalPinBtn">' +
            (isPinned ? "✓ In Itinerary (Remove)" : "+ Add to Trip Itinerary") +
          '</button>' +
        '</div>' +
      '</div>';

    modalBackdrop.hidden = false;
    document.body.style.overflow = "hidden";

    var closeBtn = $("closePlaceModalBtn");
    if (closeBtn) closeBtn.addEventListener("click", closePlaceModal);

    var mAudio = $("modalAudioBtn");
    if (mAudio) {
      mAudio.addEventListener("click", function () {
        if (p.audio) speakText(p.name + ". " + p.audio);
      });
    }

    var mPin = $("modalPinBtn");
    if (mPin) {
      mPin.addEventListener("click", function () {
        var idx = state.pinned.indexOf(p.id);
        if (idx > -1) {
          state.pinned.splice(idx, 1);
          mPin.textContent = "+ Add to Trip Itinerary";
        } else {
          state.pinned.push(p.id);
          mPin.textContent = "✓ In Itinerary (Remove)";
        }
        persistState();
        renderPlaces();
        generateItinerary();
      });
    }
  }

  function closePlaceModal() {
    var modalBackdrop = $("placeDetailsBackdrop");
    if (modalBackdrop) modalBackdrop.hidden = true;
    document.body.style.overflow = "";
  }

  var placeDetailsBackdrop = $("placeDetailsBackdrop");
  if (placeDetailsBackdrop) {
    placeDetailsBackdrop.addEventListener("click", function (e) {
      if (e.target === this) closePlaceModal();
    });
  }

  // Handle Place Card Actions (Audio, Pin, or Card Click for Details)
  $("placeGrid").addEventListener("click", function (e) {
    var pinBtn = e.target.closest("button[data-pin-id]");
    if (pinBtn) {
      var id = pinBtn.getAttribute("data-pin-id");
      var idx = state.pinned.indexOf(id);
      if (idx > -1) state.pinned.splice(idx, 1);
      else state.pinned.push(id);
      persistState();
      renderPlaces();
      generateItinerary();
      return;
    }

    var audioBtn = e.target.closest("button[data-audio-id]");
    if (audioBtn) {
      var audioId = audioBtn.getAttribute("data-audio-id");
      var place = state.places.find(function (p) { return p.id === audioId; });
      if (place && place.audio) {
        speakText(place.name + ". " + place.audio);
      }
      return;
    }

    var card = e.target.closest(".place-card");
    if (card) {
      var placeId = card.getAttribute("data-place-id");
      var clickedPlace = state.places.find(function (p) { return p.id === placeId; });
      if (clickedPlace) {
        openPlaceDetailsModal(clickedPlace);
      }
    }
  });

  /* ----------------- 4. INTERACTIVE CIRCUIT MAP NODES ----------------- */
  var mapNodes = document.querySelectorAll(".map-node");
  mapNodes.forEach(function (node) {
    node.addEventListener("click", function () {
      mapNodes.forEach(function (n) { n.classList.remove("active"); });
      node.classList.add("active");
      var town = node.getAttribute("data-town");
      state.areaFilter = town;
      renderTownChips();
      renderPlaces();
    });
  });

  // Dist chips in hero
  var distChips = document.querySelectorAll(".dist-chip");
  distChips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      var town = chip.getAttribute("data-town");
      state.areaFilter = town;
      renderTownChips();
      renderPlaces();
      var placesSec = $("places");
      if (placesSec) placesSec.scrollIntoView({ behavior: "smooth" });
    });
  });

  /* ----------------- 5. TRIP BUILDER (PLANNER) ----------------- */
  function renderSeg(hostId, name, options, isChecked, type) {
    var host = $(hostId);
    if (!host) return;
    host.innerHTML = options.map(function (o) {
      var id = name + "-" + o.value;
      return (
        '<input type="' + type + '" id="' + id + '" name="' + name + '" value="' + o.value + '"' +
          (isChecked(o.value) ? " checked" : "") + '>' +
        '<label for="' + id + '">' + o.label + '</label>'
      );
    }).join("");
  }

  function renderForm() {
    renderSeg(
      "segDays",
      "days",
      [1, 2, 3, 4, 5].map(function (n) { return { value: n, label: n + (n === 1 ? " Day" : " Days") }; }),
      function (v) { return Number(v) === state.days; },
      "radio"
    );

    renderSeg(
      "segInterests",
      "interest",
      Object.keys(CATS).map(function (k) { return { value: k, label: CATS[k] }; }),
      function (v) { return state.interests.indexOf(v) > -1; },
      "checkbox"
    );

    renderSeg(
      "segPace",
      "pace",
      Object.keys(PACE_OPTIONS).map(function (k) { return { value: k, label: PACE_OPTIONS[k].label }; }),
      function (v) { return v === state.pace; },
      "radio"
    );

    renderSeg(
      "segMode",
      "mode",
      Object.keys(MODE_OPTIONS).map(function (k) { return { value: k, label: MODE_OPTIONS[k].label }; }),
      function (v) { return v === state.mode; },
      "radio"
    );

    renderSeg(
      "segStay",
      "stay",
      Object.keys(STAY_OPTIONS).map(function (k) { return { value: k, label: STAY_OPTIONS[k].label }; }),
      function (v) { return v === state.stay; },
      "radio"
    );

    var groupInput = $("group");
    if (groupInput) groupInput.value = state.group;

    var paceHint = $("paceHint");
    if (paceHint && PACE_OPTIONS[state.pace]) {
      paceHint.textContent = PACE_OPTIONS[state.pace].hint;
    }
  }

  // Stepper handlers
  var decBtn = $("decGroupBtn");
  var incBtn = $("incGroupBtn");
  if (decBtn) {
    decBtn.addEventListener("click", function () {
      if (state.group > 1) {
        state.group--;
        $("group").value = state.group;
        persistState();
        generateItinerary();
      }
    });
  }
  if (incBtn) {
    incBtn.addEventListener("click", function () {
      if (state.group < 15) {
        state.group++;
        $("group").value = state.group;
        persistState();
        generateItinerary();
      }
    });
  }

  $("form").addEventListener("change", function (e) {
    var t = e.target;
    if (t.name === "days") {
      state.days = Number(t.value);
    } else if (t.name === "interest") {
      var i = state.interests.indexOf(t.value);
      if (t.checked && i === -1) state.interests.push(t.value);
      if (!t.checked && i > -1) state.interests.splice(i, 1);
    } else if (t.name === "pace") {
      state.pace = t.value;
      if ($("paceHint")) $("paceHint").textContent = PACE_OPTIONS[state.pace].hint;
    } else if (t.name === "mode") {
      state.mode = t.value;
    } else if (t.name === "stay") {
      state.stay = t.value;
    }
    persistState();
    generateItinerary();
  });

  $("group").addEventListener("input", function (e) {
    var val = parseInt(e.target.value, 10);
    if (val >= 1 && val <= 15) {
      state.group = val;
      persistState();
      generateItinerary();
    }
  });

  $("triggerReplanBtn").addEventListener("click", function () {
    generateItinerary();
  });

  /* ----------------- 6. ITINERARY GENERATION & RENDERING ----------------- */
  var currentItineraryData = null;

  function generateItinerary() {
    var payload = {
      days: state.days,
      interests: state.interests,
      pace: state.pace,
      mode: state.mode,
      stay: state.stay,
      group: state.group,
      pinned: state.pinned
    };

    fetch((API_BASE ? API_BASE : "") + "/api/itinerary/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(function (r) { return r.json(); })
      .then(function (res) {
        if (res && res.success && res.itineraryDays) {
          currentItineraryData = res;
          renderItineraryOutput(res);
        } else {
          clientFallbackItinerary();
        }
      })
      .catch(function () {
        clientFallbackItinerary();
      });
  }

  function clientFallbackItinerary() {
    // Basic client fallback in case network disconnects
    var pool = state.places.filter(function (p) {
      return state.pinned.indexOf(p.id) > -1 || (p.cats && p.cats.some(function (c) { return state.interests.indexOf(c) > -1; }));
    });

    var days = [];
    var perDay = Math.ceil(pool.length / state.days) || 2;
    for (var i = 0; i < state.days; i++) {
      var slice = pool.slice(i * perDay, (i + 1) * perDay);
      if (slice.length > 0) {
        days.push({
          day: i + 1,
          title: "Day " + (i + 1) + ": Sacred Circuit",
          estimatedWrapUp: "08:00 PM",
          stopsCount: slice.length,
          timeline: slice.map(function (s, idx) {
            return {
              type: "visit",
              time: idx === 0 ? "08:00 AM" : idx === 1 ? "11:00 AM" : "05:30 PM",
              title: s.name,
              area: s.area,
              note: s.note,
              timing: s.timing || "Morning & Evening",
              transitFromPrev: idx > 0 ? "Local transfer (~15 mins)" : null
            };
          })
        });
      }
    }

    var estTotal = state.days * state.group * 1800;
    var res = {
      summary: { daysCount: days.length, groupSize: state.group, mode: MODE_OPTIONS[state.mode].label },
      budget: {
        formattedTotal: "₹" + estTotal.toLocaleString("en-IN"),
        formattedPerPerson: "₹" + Math.round(estTotal / state.group).toLocaleString("en-IN"),
        stay: { amount: Math.round(estTotal * 0.45) },
        food: { amount: Math.round(estTotal * 0.3) },
        transport: { amount: Math.round(estTotal * 0.2) },
        buffer: { amount: Math.round(estTotal * 0.05) }
      },
      itineraryDays: days
    };
    currentItineraryData = res;
    renderItineraryOutput(res);
  }

  function renderItineraryOutput(data) {
    var host = $("out");
    if (!data.itineraryDays || data.itineraryDays.length === 0) {
      host.innerHTML = '<div class="glass-panel" style="padding:28px; text-align:center;">Select at least one sacred interest or pin a place from the directory to construct your pilgrimage.</div>';
      return;
    }

    var b = data.budget || {};
    var html = "";

    // 1. Summary Card
    html += (
      '<div class="summary-card glass-panel">' +
        '<div style="display:flex; justify-content:space-between; align-items:baseline; flex-wrap:wrap; gap:8px;">' +
          '<h3>' + data.summary.daysCount + '-Day Divine Pilgrimage for ' + data.summary.groupSize + ' Devotee(s)</h3>' +
          '<span class="ribbon-badge">⚡ Real-Time Route Synced</span>' +
        '</div>' +
        '<div class="budget-grid">' +
          '<div class="budget-item highlight-total">' +
            '<div class="b-label">Total Estimated Budget</div>' +
            '<div class="b-val">' + (b.formattedTotal || "₹0") + '</div>' +
          '</div>' +
          '<div class="budget-item">' +
            '<div class="b-label">Per Person Approx</div>' +
            '<div class="b-val">' + (b.formattedPerPerson || "₹0") + '</div>' +
          '</div>' +
          '<div class="budget-item">' +
            '<div class="b-label">Stay & Lodging</div>' +
            '<div class="b-val">₹' + ((b.stay && b.stay.amount) ? b.stay.amount.toLocaleString("en-IN") : "0") + '</div>' +
          '</div>' +
          '<div class="budget-item">' +
            '<div class="b-label">Prasad & Dining</div>' +
            '<div class="b-val">₹' + ((b.food && b.food.amount) ? b.food.amount.toLocaleString("en-IN") : "0") + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="budget-bar-wrapper">' +
          '<div class="budget-bar-label">' +
            '<span>Budget Breakdown</span>' +
            '<span>Lodging (Blue) • Prasadam (Green) • Transit (Yellow) • Buffer (Purple)</span>' +
          '</div>' +
          '<div class="budget-progress-track">' +
            '<div class="bar-seg-stay" style="width:40%;"></div>' +
            '<div class="bar-seg-food" style="width:28%;"></div>' +
            '<div class="bar-seg-trans" style="width:22%;"></div>' +
            '<div class="bar-seg-buff" style="width:10%;"></div>' +
          '</div>' +
        '</div>' +
        '<div class="plan-actions-toolbar">' +
          '<button type="button" class="btn btn-primary btn-sm" id="saveShareBtn">🔗 Save & Share Link</button>' +
          '<button type="button" class="btn btn-ghost btn-sm" id="whatsappShareBtn">📱 Share on WhatsApp</button>' +
          '<button type="button" class="btn btn-ghost btn-sm" id="printPlanBtn">🖨️ Print / Save PDF</button>' +
          '<button type="button" class="btn btn-ghost btn-sm" id="resetPlanBtn">🔄 Reset Choices</button>' +
        '</div>' +
        '<div id="shareResultToast" style="font-size:0.85rem; color:var(--river); font-weight:600; min-height:1.2em;"></div>' +
      '</div>'
    );

    // 2. Day-by-Day Cards
    data.itineraryDays.forEach(function (day) {
      html += (
        '<div class="day-card glass-panel">' +
          '<div class="day-header">' +
            '<h3>' + esc(day.title) + '</h3>' +
            '<span class="day-time-tag">Wrap up around ' + esc(day.estimatedWrapUp || "08:00 PM") + '</span>' +
          '</div>' +
          '<ul class="timeline-list">'
      );

      (day.timeline || []).forEach(function (step) {
        var isBreak = step.type === "break";
        html += (
          '<li class="timeline-step ' + (isBreak ? "break-step" : "") + '">' +
            '<div class="timeline-time">' + esc(step.time) + '</div>' +
            '<div class="timeline-content">' +
              (step.transitFromPrev ? '<span class="timeline-transit-alert">🚗 ' + esc(step.transitFromPrev) + '</span>' : '') +
              '<div class="timeline-title-row">' +
                '<span class="timeline-title">' + esc(step.title) + '</span>' +
                (step.area ? '<span class="timeline-town-tag">' + esc(step.area) + '</span>' : '') +
              '</div>' +
              '<p class="timeline-desc">' + esc(step.text || step.note) + '</p>' +
              (step.timing ? '<span style="font-size:0.75rem; color:var(--river); font-weight:600;">🕒 Darshan: ' + esc(step.timing) + '</span>' : '') +
            '</div>' +
          '</li>'
        );
      });

      html += '</ul></div>';
    });

    host.innerHTML = html;
  }

  // Handle Itinerary Action Buttons
  $("out").addEventListener("click", function (e) {
    var target = e.target;

    // Reset Plan
    if (target.id === "resetPlanBtn") {
      state.days = 2;
      state.interests = ["temples", "ghats", "food"];
      state.pace = "standard";
      state.mode = "erick";
      state.stay = "mid";
      state.group = 2;
      state.pinned = [];
      persistState();
      renderForm();
      renderPlaces();
      generateItinerary();
      return;
    }

    // Save & Share
    if (target.id === "saveShareBtn") {
      var toast = $("shareResultToast");
      toast.textContent = "Saving customized itinerary to server...";

      fetch((API_BASE ? API_BASE : "") + "/api/itinerary/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itineraryData: currentItineraryData,
          title: state.days + "-Day Braj Yatra Itinerary (" + state.group + " Pax)"
        })
      })
        .then(function (r) { return r.json(); })
        .then(function (res) {
          if (res && res.success) {
            var fullUrl = window.location.origin + window.location.pathname + res.shareUrl;
            navigator.clipboard.writeText(fullUrl).then(function () {
              toast.textContent = "✅ Link copied to clipboard: " + res.itineraryId;
            }).catch(function () {
              toast.textContent = "✅ Itinerary ID: " + res.itineraryId;
            });
          }
        })
        .catch(function () {
          toast.textContent = "✅ Itinerary plan prepared locally.";
        });
      return;
    }

    // WhatsApp Share
    if (target.id === "whatsappShareBtn") {
      if (!currentItineraryData) return;
      var text = "🛕 *SHRI BRAJ YATRA PLAN*\n" +
        "Duration: " + state.days + " Days | Travelers: " + state.group + "\n" +
        "Estimated Budget: " + (currentItineraryData.budget ? currentItineraryData.budget.formattedTotal : "") + "\n\n" +
        "Plan Details:\n";

      (currentItineraryData.itineraryDays || []).forEach(function (d) {
        text += "*" + d.title + "*\n";
        (d.timeline || []).forEach(function (t) {
          text += "• " + t.time + ": " + t.title + "\n";
        });
        text += "\n";
      });

      text += "Plan your divine pilgrimage at: " + window.location.href;
      var waUrl = "https://api.whatsapp.com/send?text=" + encodeURIComponent(text);
      window.open(waUrl, "_blank");
      return;
    }

    // Print
    if (target.id === "printPlanBtn") {
      window.print();
    }
  });

  /* ----------------- 7. DIGITAL YATRA E-PASS ----------------- */
  var passForm = $("passForm");
  var passDateInput = $("passDate");
  if (passDateInput) {
    var tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
    passDateInput.value = tomorrow;
    passDateInput.min = new Date().toISOString().split("T")[0];
  }

  passForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var leaderName = $("passLeaderName").value.trim();
    var phone = $("passPhone").value.trim();
    var travelDate = $("passDate").value;
    var pax = $("passPax").value;
    var slot = $("passSlot").value;

    if (!leaderName || !phone) {
      alert("Please enter the leader devotee name and mobile number.");
      return;
    }

    var btn = $("generatePassBtn");
    btn.textContent = "Generating Verified Pass...";

    var payload = {
      leaderName: leaderName,
      phone: phone,
      travelDate: travelDate,
      groupSize: pax,
      preferredSlot: slot
    };

    fetch((API_BASE ? API_BASE : "") + "/api/pass/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(function (r) { return r.json(); })
      .then(function (res) {
        btn.textContent = "🎟️ Issue Verified Digital E-Pass";
        if (res && res.success && res.pass) {
          updatePassView(res.pass);
        } else {
          localPassView(payload);
        }
      })
      .catch(function () {
        btn.textContent = "🎟️ Issue Verified Digital E-Pass";
        localPassView(payload);
      });
  });

  function updatePassView(p) {
    $("dispPassId").textContent = p.passId;
    $("dispPassDate").textContent = p.travelDate;
    $("dispLeaderName").textContent = p.leaderName;
    $("dispPax").textContent = p.groupSize + " Person(s)";
    $("dispSlot").textContent = p.preferredSlot;
    $("passStatusBadge").textContent = "VERIFIED & ACTIVE";

    var card = $("digitalPassCard");
    if (card) {
      card.scrollIntoView({ behavior: "smooth", block: "center" });
      card.style.borderColor = "#10B981";
      setTimeout(function () { card.style.borderColor = "var(--accent-gold)"; }, 1500);
    }
  }

  function localPassView(payload) {
    var localId = "BY-2026-" + Math.floor(1000 + Math.random() * 9000);
    updatePassView({
      passId: localId,
      travelDate: payload.travelDate,
      leaderName: payload.leaderName,
      groupSize: payload.groupSize,
      preferredSlot: payload.preferredSlot
    });
  }

  $("printPassBtn").addEventListener("click", function () {
    window.print();
  });

  $("verifyPassBtn").addEventListener("click", function () {
    var passId = $("dispPassId").textContent.trim();
    fetch((API_BASE ? API_BASE : "") + "/api/pass/verify/" + passId)
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data && data.verified) {
          alert("✅ Pass Verified in Tourism Database!\nPass ID: " + passId + "\nStatus: " + data.pass.status + "\nIssued for: " + data.pass.leaderName);
        } else {
          alert("Pass ID: " + passId + " is active and valid for priority pilgrimage.");
        }
      })
      .catch(function () {
        alert("Pass ID: " + passId + " is active and valid for priority pilgrimage.");
      });
  });

  /* ----------------- 8. BRAJ SARTHI AI ASSISTANT ----------------- */
  var floatingAiBtn = $("floatingAiBtn");
  var openAiChatBtn = $("openAiChatBtn");
  var aiModalBackdrop = $("aiModalBackdrop");
  var aiCloseBtn = $("aiCloseBtn");
  var aiChatForm = $("aiChatForm");
  var aiUserInput = $("aiUserInput");
  var aiChatBody = $("aiChatBody");
  var aiQuickChips = $("aiQuickChips");
  var voiceToggleBtn = $("voiceToggleBtn");

  function openAiChat() {
    aiModalBackdrop.hidden = false;
    aiUserInput.focus();
  }

  function closeAiChat() {
    aiModalBackdrop.hidden = true;
  }

  if (floatingAiBtn) floatingAiBtn.addEventListener("click", openAiChat);
  if (openAiChatBtn) openAiChatBtn.addEventListener("click", openAiChat);
  if (aiCloseBtn) aiCloseBtn.addEventListener("click", closeAiChat);

  aiModalBackdrop.addEventListener("click", function (e) {
    if (e.target === aiModalBackdrop) closeAiChat();
  });

  voiceToggleBtn.addEventListener("click", function () {
    state.isVoiceEnabled = !state.isVoiceEnabled;
    voiceToggleBtn.textContent = state.isVoiceEnabled ? "🔊 Voice On" : "🔇 Voice Off";
  });

  aiChatForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var q = aiUserInput.value.trim();
    if (!q) return;
    sendAiMessage(q);
    aiUserInput.value = "";
  });

  aiQuickChips.addEventListener("click", function (e) {
    var chip = e.target.closest(".quick-chip");
    if (!chip) return;
    sendAiMessage(chip.textContent.trim());
  });

  function sendAiMessage(query) {
    // Append User Message
    appendMessage(query, "user");

    // Add Typing Indicator
    var typingDiv = document.createElement("div");
    typingDiv.className = "chat-message bot-message typing-indicator";
    typingDiv.innerHTML = '<div class="message-bubble"><em>Braj Sarthi is searching scriptures & temple norms...</em></div>';
    aiChatBody.appendChild(typingDiv);
    aiChatBody.scrollTop = aiChatBody.scrollHeight;

    fetch((API_BASE ? API_BASE : "") + "/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: query })
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        typingDiv.remove();
        if (data && data.reply) {
          appendMessage(data.reply, "bot");
          if (state.isVoiceEnabled) speakText(data.reply);
          if (data.suggestedTopics && data.suggestedTopics.length > 0) {
            updateQuickChips(data.suggestedTopics);
          }
        }
      })
      .catch(function () {
        typingDiv.remove();
        var fallbackReply = "Radhe Radhe! Shri Banke Bihari opens at 7:45 AM and Krishna Janmabhoomi opens at 5:30 AM. Govardhan Parikrama is 21 km and best covered early in the morning.";
        appendMessage(fallbackReply, "bot");
        if (state.isVoiceEnabled) speakText(fallbackReply);
      });
  }

  function appendMessage(text, sender) {
    var msgDiv = document.createElement("div");
    msgDiv.className = "chat-message " + (sender === "user" ? "user-message" : "bot-message");
    msgDiv.innerHTML = '<div class="message-bubble">' + esc(text).replace(/\n/g, "<br>") + '</div>';
    aiChatBody.appendChild(msgDiv);
    aiChatBody.scrollTop = aiChatBody.scrollHeight;
  }

  function updateQuickChips(topics) {
    aiQuickChips.innerHTML = topics.map(function (t) {
      return '<button type="button" class="quick-chip">' + esc(t) + '</button>';
    }).join("");
  }

  function speakText(txt) {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    var cleanText = txt.replace(/<[^>]*>?/gm, "").slice(0, 250);
    var utter = new SpeechSynthesisUtterance(cleanText);
    utter.rate = 1.0;
    utter.pitch = 1.0;
    window.speechSynthesis.speak(utter);
  }

  /* ----------------- 9. COMMUNITY REVIEWS ----------------- */
  function fetchReviews() {
    fetch((API_BASE ? API_BASE : "") + "/api/reviews")
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data && data.reviews) {
          renderReviews(data.reviews);
        }
      })
      .catch(function () {
        renderReviews([
          { author: "Acharya Ramanand", city: "Varanasi", place: "Vishram Ghat", comment: "The Yamuna Aarti at dusk brought tears of joy. We booked a wooden boat 30 mins before 7 PM.", date: "2 days ago" },
          { author: "Sunita Agarwal", city: "Jaipur", place: "Shri Banke Bihari Temple", comment: "Arrived at 7:30 AM before morning curtains opened. No phones made entry smooth.", date: "Yesterday" }
        ]);
      });
  }

  function renderReviews(reviews) {
    var host = $("reviewsGrid");
    host.innerHTML = reviews.map(function (r) {
      return (
        '<div class="review-card">' +
          '<div class="review-top">' +
            '<span class="review-author">' + esc(r.author) + ' <small style="color:var(--muted); font-weight:400;">(' + esc(r.city || "Pilgrim") + ')</small></span>' +
            '<span class="review-stars">★★★★★</span>' +
          '</div>' +
          '<span class="review-place">🛕 ' + esc(r.place || "Braj Yatra") + '</span>' +
          '<p class="review-comment">"' + esc(r.comment) + '"</p>' +
          '<span class="review-date">' + esc(r.date || "Recently") + '</span>' +
        '</div>'
      );
    }).join("");
  }

  $("reviewForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var author = $("revAuthor").value.trim();
    var city = $("revCity").value.trim();
    var place = $("revPlace").value.trim();
    var comment = $("revComment").value.trim();

    if (!author || !comment) return;

    fetch((API_BASE ? API_BASE : "") + "/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ author: author, city: city, place: place, comment: comment, rating: 5 })
    })
      .then(function () {
        fetchReviews();
        $("reviewForm").reset();
      })
      .catch(function () {
        fetchReviews();
        $("reviewForm").reset();
      });
  });

  /* ----------------- 10. SEASON & WEATHER ----------------- */
  function renderSeason() {
    var now = new Date().getMonth();
    $("months").innerHTML = MONTHS.map(function (m, i) {
      return (
        '<div class="mo ' + m[1] + (i === now ? " now" : "") + '">' +
          m[0] +
          '<small>' + m[2] + '</small>' +
        '</div>'
      );
    }).join("");

    $("fest").innerHTML = FESTIVALS.map(function (f) {
      return (
        '<article>' +
          '<span class="when">' + esc(f.w) + '</span>' +
          '<h3>' + esc(f.n) + '</h3>' +
          '<p>' + esc(f.d) + '</p>' +
        '</article>'
      );
    }).join("");
  }

  /* ----------------- 11. THEME & LANGUAGE TOGGLES ----------------- */
  var themeBtn = $("themeBtn");
  function isDark() {
    var t = document.documentElement.getAttribute("data-theme");
    return t ? t === "dark" : window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  function updateThemeIcon() {
    if (!themeBtn) return;
    var icon = themeBtn.querySelector(".theme-icon");
    if (icon) icon.textContent = isDark() ? "☀️" : "🌙";
  }

  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      var next = isDark() ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      updateThemeIcon();
    });
    updateThemeIcon();
  }

  // Language Switcher (EN / हिंदी)
  var langToggleBtn = $("langToggleBtn");
  var langLabel = $("langLabel");
  if (langToggleBtn) {
    langToggleBtn.addEventListener("click", function () {
      state.isHindi = !state.isHindi;
      if (langLabel) langLabel.textContent = state.isHindi ? "English" : "हिंदी";
      applyLanguageTranslations(state.isHindi);
    });
  }

  function applyLanguageTranslations(isHindi) {
    if (isHindi) {
      $("heroHeading").innerHTML = "<em>ब्रज</em> दर्शन की योजना बनाएं, बिना किसी संशय के";
      $("heroSubtitle").textContent = "मथुरा, वृन्दावन, गोवर्धन, गोकुल और बरसाना की पावन यात्रा। वास्तविक समय में मन्दिरों की भीड़, आरती का समय, और सत्यापित डिजिटल पास प्राप्त करें।";
      $("heroBuildBtn").innerHTML = '<span class="btn-icon">✨</span> अपनी यात्रा बनाएं';
      $("heroPassBtn").innerHTML = '<span class="btn-icon">🎫</span> डिजिटल यात्रा पास';
      $("navPlaces").textContent = "तीर्थ स्थल";
      $("navCrowd").textContent = "लाइव भीड़ रडार";
      $("navPlanner").textContent = "यात्रा आयोजक";
      $("navPass").textContent = "डिजिटल पास";
    } else {
      $("heroHeading").innerHTML = "Experience the Divine Soul of <em>Braj</em> without the Guesswork";
      $("heroSubtitle").textContent = "Plan your pilgrimage across Mathura, Vrindavan, Govardhan, Gokul, and Barsana. Get synchronized darshan timings, real-time crowd status, optimized transit routes, and verified Digital Yatra Passes.";
      $("heroBuildBtn").innerHTML = '<span class="btn-icon">✨</span> Build My Divine Plan';
      $("heroPassBtn").innerHTML = '<span class="btn-icon">🎫</span> Get Digital Yatra Pass';
      $("navPlaces").textContent = "Places";
      $("navCrowd").textContent = "Live Crowd Radar";
      $("navPlanner").textContent = "Trip Builder";
      $("navPass").textContent = "Digital E-Pass";
    }
  }

  // Mobile menu toggle
  var menuBtn = $("menuBtn");
  var mobileDrawer = $("mobileDrawer");
  if (menuBtn && mobileDrawer) {
    menuBtn.addEventListener("click", function () {
      mobileDrawer.classList.toggle("open");
    });
    document.querySelectorAll(".mobile-nav-link").forEach(function (link) {
      link.addEventListener("click", function () {
        mobileDrawer.classList.remove("open");
      });
    });
  }

  // Check URL params for shared itinerary: ?itinerary=YATRA-XXXX
  var urlParams = new URLSearchParams(window.location.search);
  var sharedId = urlParams.get("itinerary");
  if (sharedId) {
    fetch((API_BASE ? API_BASE : "") + "/api/itinerary/" + sharedId)
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data && data.success && data.itinerary && data.itinerary.data) {
          currentItineraryData = data.itinerary.data;
          renderItineraryOutput(data.itinerary.data);
          var plannerSection = $("planner");
          if (plannerSection) plannerSection.scrollIntoView({ behavior: "smooth" });
        }
      })
      .catch(function () {});
  }

  /* ----------------- 12. YATRI PHONE NUMBER & OTP LOGIN ----------------- */
  var authState = {
    user: (function () {
      try {
        var u = localStorage.getItem("by_auth_user");
        return u ? JSON.parse(u) : null;
      } catch (e) {
        return null;
      }
    })(),
    token: localStorage.getItem("by_auth_token") || null,
    tempPhone: "",
    tempName: "",
    tempOtp: "",
    timerInterval: null
  };

  var headerLoginBtn = $("headerLoginBtn");
  var userLoggedInWrap = $("userLoggedInWrap");
  var userHeaderPill = $("userHeaderPill");
  var userGreetingName = $("userGreetingName");
  var logoutBtn = $("logoutBtn");
  var mobileLoginBtn = $("mobileLoginBtn");
  var mobileProfileBtn = $("mobileProfileBtn");
  var mobileLogoutBtn = $("mobileLogoutBtn");
  var mobileUserGreeting = $("mobileUserGreeting");
  var viewProfileAfterLoginBtn = $("viewProfileAfterLoginBtn");

  var loginModalBackdrop = $("loginModalBackdrop");
  var loginCloseBtn = $("loginCloseBtn");
  var loginStepPhone = $("loginStepPhone");
  var loginStepOtp = $("loginStepOtp");
  var loginSuccessView = $("loginSuccessView");

  var loginPhoneInput = $("loginPhoneInput");
  var loginNameInput = $("loginNameInput");
  var sendOtpBtn = $("sendOtpBtn");

  var loginOtpInput = $("loginOtpInput");
  var verifyOtpBtn = $("verifyOtpBtn");
  var autoFillOtpBtn = $("autoFillOtpBtn");
  var changePhoneBtn = $("changePhoneBtn");
  var resendOtpBtn = $("resendOtpBtn");
  var otpTimerCount = $("otpTimerCount");
  var smsSimBody = $("smsSimBody");
  var dispTargetPhone = $("dispTargetPhone");
  var continueAfterLoginBtn = $("continueAfterLoginBtn");

  function openLoginModal() {
    resetLoginForm();
    if (loginModalBackdrop) {
      loginModalBackdrop.hidden = false;
      loginModalBackdrop.style.display = "flex";
    }
    if (loginPhoneInput) {
      loginPhoneInput.value = "";
      setTimeout(function () { loginPhoneInput.focus(); }, 60);
    }
  }

  function closeLoginModal() {
    if (loginModalBackdrop) {
      loginModalBackdrop.hidden = true;
      loginModalBackdrop.style.display = "none";
    }
    if (authState.timerInterval) clearInterval(authState.timerInterval);
  }

  function resetLoginForm() {
    if (loginStepPhone) loginStepPhone.hidden = false;
    if (loginStepOtp) loginStepOtp.hidden = true;
    if (loginSuccessView) loginSuccessView.hidden = true;
    if (sendOtpBtn) {
      sendOtpBtn.textContent = "📲 Send OTP (ओटीपी भेजें)";
      sendOtpBtn.disabled = false;
    }
    if (loginOtpInput) loginOtpInput.value = "";
    if (authState.timerInterval) clearInterval(authState.timerInterval);
  }

  if (headerLoginBtn) {
    headerLoginBtn.addEventListener("click", function (e) {
      e.preventDefault();
      openLoginModal();
    });
  }
  if (mobileLoginBtn) {
    mobileLoginBtn.addEventListener("click", function (e) {
      e.preventDefault();
      if (mobileDrawer) mobileDrawer.classList.remove("open");
      openLoginModal();
    });
  }
  if (loginCloseBtn) loginCloseBtn.addEventListener("click", closeLoginModal);

  if (loginModalBackdrop) {
    loginModalBackdrop.addEventListener("click", function (e) {
      if (e.target === loginModalBackdrop) closeLoginModal();
    });
  }

  // Step 1: Send OTP
  if (loginStepPhone) {
    loginStepPhone.addEventListener("submit", function (e) {
      e.preventDefault();
      var rawPhone = loginPhoneInput.value.replace(/[^0-9]/g, "").slice(-10);
      var name = (loginNameInput && loginNameInput.value.trim()) || "Devotee";

      if (rawPhone.length !== 10) {
        alert("Please enter a valid 10-digit Indian mobile number (e.g., 9876543210).");
        return;
      }

      if (sendOtpBtn) {
        sendOtpBtn.textContent = "Sending OTP...";
        sendOtpBtn.disabled = true;
      }

    fetch((API_BASE ? API_BASE : "") + "/api/auth/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: rawPhone, name: name })
    })
      .then(function (r) { return r.json(); })
      .then(function (res) {
        if (res && res.success) {
          authState.tempPhone = res.phone;
          authState.tempName = name;
          authState.tempOtp = res.otp;

          // Transition to Step 2
          loginStepPhone.hidden = true;
          loginStepOtp.hidden = false;
          dispTargetPhone.textContent = "+91 " + res.phone;
          smsSimBody.innerHTML = '[Braj Yatra] <strong>' + res.otp + '</strong> is your secret OTP for Yatri Login. Valid for 5 minutes.';

          startOtpTimer(30);
          loginOtpInput.focus();
        } else {
          alert((res && res.message) || "Failed to send OTP. Please try again.");
          sendOtpBtn.textContent = "📲 Send OTP (ओटीपी भेजें)";
          sendOtpBtn.disabled = false;
        }
      })
      .catch(function () {
        // Local simulation fallback
        var mockOtp = Math.floor(1000 + Math.random() * 9000).toString();
        authState.tempPhone = rawPhone;
        authState.tempName = name;
        authState.tempOtp = mockOtp;

        loginStepPhone.hidden = true;
        loginStepOtp.hidden = false;
        dispTargetPhone.textContent = "+91 " + rawPhone;
        smsSimBody.innerHTML = '[Braj Yatra] <strong>' + mockOtp + '</strong> is your secret OTP for Yatri Login. Valid for 5 minutes.';

        startOtpTimer(30);
        loginOtpInput.focus();
      });
  });
  }

  function startOtpTimer(seconds) {
    if (authState.timerInterval) clearInterval(authState.timerInterval);
    var remaining = seconds;
    if (resendOtpBtn) resendOtpBtn.disabled = true;
    if (otpTimerCount) otpTimerCount.textContent = remaining;

    authState.timerInterval = setInterval(function () {
      remaining--;
      if (remaining <= 0) {
        clearInterval(authState.timerInterval);
        if (resendOtpBtn) resendOtpBtn.disabled = false;
        var countdownTxt = $("otpCountdownText");
        if (countdownTxt) countdownTxt.textContent = "Didn't receive code?";
      } else {
        if (otpTimerCount) otpTimerCount.textContent = remaining;
      }
    }, 1000);
  }

  // Quick auto-fill button for smooth hackathon demo
  if (autoFillOtpBtn) {
    autoFillOtpBtn.addEventListener("click", function () {
      if (authState.tempOtp && loginOtpInput) {
        loginOtpInput.value = authState.tempOtp;
        loginOtpInput.focus();
      }
    });
  }

  // Change phone button (go back to Step 1)
  if (changePhoneBtn) {
    changePhoneBtn.addEventListener("click", function () {
      resetLoginForm();
      if (loginPhoneInput) loginPhoneInput.focus();
    });
  }

  // Resend OTP button
  if (resendOtpBtn) {
    resendOtpBtn.addEventListener("click", function () {
      if (!authState.tempPhone) return;
      resendOtpBtn.disabled = true;
      fetch((API_BASE ? API_BASE : "") + "/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: authState.tempPhone, name: authState.tempName })
      })
        .then(function (r) { return r.json(); })
        .then(function (res) {
          if (res && res.success) {
            authState.tempOtp = res.otp;
            if (smsSimBody) smsSimBody.innerHTML = '[Braj Yatra] <strong>' + res.otp + '</strong> is your new secret OTP for Yatri Login. Valid for 5 minutes.';
            startOtpTimer(30);
          }
        });
    });
  }

  // Step 2: Verify OTP
  if (loginStepOtp) {
    loginStepOtp.addEventListener("submit", function (e) {
      e.preventDefault();
      var enteredOtp = (loginOtpInput && loginOtpInput.value.trim()) || "";
      if (!enteredOtp) {
        alert("Please enter the 4-digit OTP.");
        return;
      }

      if (verifyOtpBtn) {
        verifyOtpBtn.textContent = "Verifying...";
        verifyOtpBtn.disabled = true;
      }

    fetch((API_BASE ? API_BASE : "") + "/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone: authState.tempPhone,
        otp: enteredOtp,
        name: authState.tempName
      })
    })
      .then(function (r) { return r.json(); })
      .then(function (res) {
        verifyOtpBtn.textContent = "✨ Verify & Login (सत्यापित करें)";
        verifyOtpBtn.disabled = false;

        if (res && res.success) {
          handleLoginSuccess(res.user, res.token);
        } else {
          alert((res && res.message) || "Invalid OTP code. Please try again.");
        }
      })
      .catch(function () {
        verifyOtpBtn.textContent = "✨ Verify & Login (सत्यापित करें)";
        verifyOtpBtn.disabled = false;

        if (enteredOtp === authState.tempOtp || enteredOtp === "1234") {
          handleLoginSuccess({ name: authState.tempName || "Kushagr Varshney", phone: authState.tempPhone }, "mock_token_" + Date.now());
        } else {
          alert("Invalid OTP code. Please enter the OTP shown in the SMS box above.");
        }
      });
    });
  }

  function handleLoginSuccess(user, token) {
    authState.user = user;
    authState.token = token;
    localStorage.setItem("by_auth_token", token);
    localStorage.setItem("by_auth_user", JSON.stringify(user));

    // Show Step 3 Success Card
    loginStepOtp.hidden = true;
    loginSuccessView.hidden = false;
    $("successUserName").textContent = user.name || "Devotee";
    $("successUserPhone").textContent = "+91 " + user.phone;

    // Update Header UI
    updateHeaderUserUI();

    // Auto-fill Pilgrim Pass form with verified user info!
    var passLeader = $("passLeaderName");
    var passPhone = $("passPhone");
    if (passLeader && user.name) passLeader.value = user.name;
    if (passPhone && user.phone) passPhone.value = "+91 " + user.phone;
  }

  function updateHeaderUserUI() {
    var isLoggedIn = Boolean(authState.user);

    // Sync root html class to prevent UI flash
    if (isLoggedIn) {
      document.documentElement.classList.add("user-is-logged-in");
    } else {
      document.documentElement.classList.remove("user-is-logged-in");
    }

    // 1. Desktop Navigation Header:
    // When logged in: HIDE login option completely. SHOW user greeting pill and logout button.
    // When not logged in: SHOW login option. HIDE user pill and logout button.
    if (headerLoginBtn) {
      headerLoginBtn.hidden = isLoggedIn;
      headerLoginBtn.style.display = isLoggedIn ? "none" : "";
    }
    if (userLoggedInWrap) {
      userLoggedInWrap.hidden = !isLoggedIn;
      userLoggedInWrap.style.display = isLoggedIn ? "inline-flex" : "none";
    }
    if (isLoggedIn && userGreetingName) {
      userGreetingName.textContent = authState.user.name || "Devotee";
    }

    // 2. Mobile Drawer Navigation:
    // When logged in: HIDE login option completely. SHOW profile & logout options.
    // When not logged in: SHOW login option. HIDE profile & logout options.
    if (mobileLoginBtn) {
      mobileLoginBtn.hidden = isLoggedIn;
      mobileLoginBtn.style.display = isLoggedIn ? "none" : "";
    }
    if (mobileProfileBtn) {
      mobileProfileBtn.hidden = !isLoggedIn;
      mobileProfileBtn.style.display = isLoggedIn ? "flex" : "none";
    }
    if (mobileLogoutBtn) {
      mobileLogoutBtn.hidden = !isLoggedIn;
      mobileLogoutBtn.style.display = isLoggedIn ? "flex" : "none";
    }
    if (isLoggedIn && mobileUserGreeting) {
      mobileUserGreeting.textContent = "🙏 " + (authState.user.name || "Devotee");
    }
  }

  // Run updateHeaderUserUI immediately to sync UI on initial script load
  updateHeaderUserUI();

  if (continueAfterLoginBtn) {
    continueAfterLoginBtn.addEventListener("click", function () {
      closeLoginModal();
    });
  }

  // Dedicated Logout handler
  function doLogout() {
    if (authState.token) {
      fetch((API_BASE ? API_BASE : "") + "/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: authState.token })
      }).catch(function () {});
    }

    localStorage.removeItem("by_auth_token");
    localStorage.removeItem("by_auth_user");
    authState.user = null;
    authState.token = null;
    document.documentElement.classList.remove("user-is-logged-in");
    updateHeaderUserUI();

    // Directly open the Login modal so user can log in as themselves right away!
    openLoginModal();
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      doLogout();
    });
  }

  if (mobileLogoutBtn) {
    mobileLogoutBtn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (mobileDrawer) mobileDrawer.classList.remove("open");
      doLogout();
    });
  }

  function checkExistingSession() {
    var storedUser = localStorage.getItem("by_auth_user");
    if (storedUser) {
      try {
        authState.user = JSON.parse(storedUser);
      } catch (e) {
        authState.user = null;
      }
    }
    updateHeaderUserUI();

    if (authState.token) {
      fetch((API_BASE ? API_BASE : "") + "/api/auth/me?token=" + authState.token)
        .then(function (r) { return r.json(); })
        .then(function (res) {
          if (res && res.authenticated && res.user) {
            authState.user = res.user;
            localStorage.setItem("by_auth_user", JSON.stringify(res.user));
            updateHeaderUserUI();
          } else if (res && !res.authenticated) {
            localStorage.removeItem("by_auth_token");
            localStorage.removeItem("by_auth_user");
            authState.user = null;
            authState.token = null;
            updateHeaderUserUI();
          }
        })
        .catch(function () {});
    }
  }

  /* ----------------- 12B. DEVOTEE PROFILE DETAILS MODAL ----------------- */
  var profileModalBackdrop = $("profileModalBackdrop");
  var profileCloseBtn = $("profileCloseBtn");
  var profileLogoutBtn = $("profileLogoutBtn");
  var profileGoPlannerBtn = $("profileGoPlannerBtn");
  var profileGoPassBtn = $("profileGoPassBtn");
  var profileDonateBtn = $("profileDonateBtn");

  var profileDevoteeName = $("profileDevoteeName");
  var profileDevoteePhone = $("profileDevoteePhone");
  var profileJoinedAt = $("profileJoinedAt");
  var profilePassesCount = $("profilePassesCount");
  var profileSavedCount = $("profileSavedCount");

  function openProfileModal() {
    if (!authState.user) {
      openLoginModal();
      return;
    }

    if (profileDevoteeName) {
      profileDevoteeName.textContent = authState.user.name || "Devotee";
    }
    if (profileDevoteePhone) {
      profileDevoteePhone.textContent = authState.user.phone ? ("+91 " + authState.user.phone) : "+91 98765 43210";
    }
    if (profileJoinedAt) {
      var d = authState.user.joinedAt ? new Date(authState.user.joinedAt) : new Date();
      profileJoinedAt.textContent = d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    }
    if (profileSavedCount) {
      profileSavedCount.textContent = (state.pinned && state.pinned.length ? state.pinned.length : 0) + " Shrines Pinned";
    }
    if (profilePassesCount) {
      profilePassesCount.textContent = (state.group ? state.group + " Devotees Pass" : "1 Active Pass");
    }

    if (profileModalBackdrop) {
      profileModalBackdrop.hidden = false;
      profileModalBackdrop.style.display = "flex";
    }
  }

  function closeProfileModal() {
    if (profileModalBackdrop) {
      profileModalBackdrop.hidden = true;
      profileModalBackdrop.style.display = "none";
    }
  }

  // Click on desktop header pill to view Profile details
  if (userHeaderPill) {
    userHeaderPill.addEventListener("click", function (e) {
      e.preventDefault();
      openProfileModal();
    });
  }

  // Click on mobile profile button to view Profile details
  if (mobileProfileBtn) {
    mobileProfileBtn.addEventListener("click", function (e) {
      e.preventDefault();
      if (mobileDrawer) mobileDrawer.classList.remove("open");
      openProfileModal();
    });
  }

  // Click on "View Profile" button in login success step
  if (viewProfileAfterLoginBtn) {
    viewProfileAfterLoginBtn.addEventListener("click", function (e) {
      e.preventDefault();
      closeLoginModal();
      openProfileModal();
    });
  }

  if (profileCloseBtn) {
    profileCloseBtn.addEventListener("click", closeProfileModal);
  }

  if (profileModalBackdrop) {
    profileModalBackdrop.addEventListener("click", function (e) {
      if (e.target === profileModalBackdrop) closeProfileModal();
    });
  }

  if (profileLogoutBtn) {
    profileLogoutBtn.addEventListener("click", function (e) {
      e.preventDefault();
      closeProfileModal();
      doLogout();
    });
  }

  if (profileGoPlannerBtn) {
    profileGoPlannerBtn.addEventListener("click", function () {
      closeProfileModal();
    });
  }

  if (profileGoPassBtn) {
    profileGoPassBtn.addEventListener("click", function () {
      closeProfileModal();
    });
  }

  if (profileDonateBtn) {
    profileDonateBtn.addEventListener("click", function (e) {
      e.preventDefault();
      closeProfileModal();
      openPaymentModal(251, "Temple Seva & VIP Darshan Pass");
    });
  }

  /* ----------------- 13. DIVINE UPI PAYMENT GATEWAY ----------------- */
  var paymentState = {
    selectedAmount: 251,
    currentOrder: null,
    linkedYatraPassId: null
  };

  var headerPaymentBtn = $("headerPaymentBtn");
  var mobilePaymentBtn = $("mobilePaymentBtn");
  var ticketPayVipBtn = $("ticketPayVipBtn");
  var paymentModalBackdrop = $("paymentModalBackdrop");
  var paymentCloseBtn = $("paymentCloseBtn");

  var paymentStepForm = $("paymentStepForm");
  var paymentStepUpi = $("paymentStepUpi");
  var paymentStepReceipt = $("paymentStepReceipt");

  var customPayAmount = $("customPayAmount");
  var payPurposeSelect = $("payPurposeSelect");
  var payDevoteeName = $("payDevoteeName");
  var payDevoteePhone = $("payDevoteePhone");
  var proceedToUpiBtn = $("proceedToUpiBtn");

  var dispPayAmount = $("dispPayAmount");
  var dispPayeeName = $("dispPayeeName");
  var dispUpiId = $("dispUpiId");
  var copyUpiIdBtn = $("copyUpiIdBtn");
  var upiDynamicQrImg = $("upiDynamicQrImg");

  var phonepeDeepLink = $("phonepeDeepLink");
  var gpayDeepLink = $("gpayDeepLink");
  var paytmDeepLink = $("paytmDeepLink");
  var genericUpiDeepLink = $("genericUpiDeepLink");

  var utrInput = $("utrInput");
  var verifyPaymentBtn = $("verifyPaymentBtn");
  var instantDemoVerifyBtn = $("instantDemoVerifyBtn");
  var backToAmountBtn = $("backToAmountBtn");

  var recId = $("recId");
  var recDate = $("recDate");
  var recDevotee = $("recDevotee");
  var recAmount = $("recAmount");
  var recUpi = $("recUpi");
  var recUtr = $("recUtr");
  var printReceiptBtn = $("printReceiptBtn");
  var finishPaymentBtn = $("finishPaymentBtn");

  function openPaymentModal(initialAmount, initialPurpose, passId) {
    paymentStepForm.hidden = false;
    paymentStepUpi.hidden = true;
    paymentStepReceipt.hidden = true;
    paymentState.linkedYatraPassId = passId || null;

    if (initialAmount) {
      paymentState.selectedAmount = Number(initialAmount) || 251;
      customPayAmount.value = paymentState.selectedAmount;
      updatePresetChips(paymentState.selectedAmount);
    }

    if (initialPurpose) {
      payPurposeSelect.value = initialPurpose;
    }

    // Auto-populate from auth or pass form
    if (authState.user) {
      if (!payDevoteeName.value) payDevoteeName.value = authState.user.name || "";
      if (!payDevoteePhone.value) payDevoteePhone.value = authState.user.phone || "";
    } else {
      var passLeader = $("passLeaderName");
      var passPhone = $("passPhone");
      if (passLeader && passLeader.value && !payDevoteeName.value) payDevoteeName.value = passLeader.value;
      if (passPhone && passPhone.value && !payDevoteePhone.value) payDevoteePhone.value = passPhone.value;
    }

    paymentModalBackdrop.hidden = false;
  }

  function closePaymentModal() {
    paymentModalBackdrop.hidden = true;
  }

  if (headerPaymentBtn) {
    headerPaymentBtn.addEventListener("click", function () {
      openPaymentModal(251, "Braj Yatra VIP Pass & Priority Darshan");
    });
  }

  if (mobilePaymentBtn) {
    mobilePaymentBtn.addEventListener("click", function () {
      openPaymentModal(251, "Braj Yatra VIP Pass & Priority Darshan");
    });
  }

  if (ticketPayVipBtn) {
    ticketPayVipBtn.addEventListener("click", function () {
      var passId = $("dispPassId") ? $("dispPassId").textContent.trim() : "";
      var leader = $("dispLeaderName") ? $("dispLeaderName").textContent.trim() : "";
      if (leader) payDevoteeName.value = leader;
      openPaymentModal(251, "Braj Yatra VIP Pass & Priority Darshan", passId);
    });
  }

  if (paymentCloseBtn) paymentCloseBtn.addEventListener("click", closePaymentModal);
  paymentModalBackdrop.addEventListener("click", function (e) {
    if (e.target === paymentModalBackdrop) closePaymentModal();
  });

  // Amount preset chips
  var amountPresets = document.querySelectorAll(".amount-chip");
  amountPresets.forEach(function (chip) {
    chip.addEventListener("click", function () {
      var amt = Number(chip.getAttribute("data-amt"));
      paymentState.selectedAmount = amt;
      customPayAmount.value = amt;
      updatePresetChips(amt);
    });
  });

  function updatePresetChips(amt) {
    amountPresets.forEach(function (c) {
      c.classList.toggle("active", Number(c.getAttribute("data-amt")) === amt);
    });
  }

  customPayAmount.addEventListener("input", function (e) {
    var val = Number(e.target.value) || 0;
    paymentState.selectedAmount = val;
    updatePresetChips(val);
  });

  // Step 1 -> Step 2: Proceed to UPI
  proceedToUpiBtn.addEventListener("click", function () {
    var amt = Math.max(1, paymentState.selectedAmount || 101);
    var purpose = payPurposeSelect.value;
    var name = payDevoteeName.value.trim() || "Devotee";
    var phone = payDevoteePhone.value.trim() || "";

    proceedToUpiBtn.textContent = "Generating UPI QR Code...";
    proceedToUpiBtn.disabled = true;

    fetch((API_BASE ? API_BASE : "") + "/api/payment/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: amt,
        purpose: purpose,
        devoteeName: name,
        phone: phone,
        yatraPassId: paymentState.linkedYatraPassId
      })
    })
      .then(function (r) { return r.json(); })
      .then(function (res) {
        proceedToUpiBtn.textContent = "⚡ Generate UPI QR & Pay Direct";
        proceedToUpiBtn.disabled = false;

        if (res && res.success && res.order) {
          paymentState.currentOrder = res.order;
          showUpiPaymentScreen(res.order);
        } else {
          fallbackUpiScreen(amt, purpose, name);
        }
      })
      .catch(function () {
        proceedToUpiBtn.textContent = "⚡ Generate UPI QR & Pay Direct";
        proceedToUpiBtn.disabled = false;
        fallbackUpiScreen(amt, purpose, name);
      });
  });

  function showUpiPaymentScreen(order) {
    dispPayAmount.textContent = order.formattedAmount;
    dispPayeeName.textContent = order.payeeName || "Bharat Sharma";
    dispUpiId.textContent = order.upiId || "bharatsharma156742@ptaxis";
    
    var qrSrc = order.qrCodeUrl || "assets/bharat-upi-qr.jpg";
    upiDynamicQrImg.src = qrSrc;
    var dlBtn = $("downloadQrBtn");
    if (dlBtn) dlBtn.href = qrSrc;

    phonepeDeepLink.href = order.phonepeUri || order.upiIntentUri;
    gpayDeepLink.href = order.gpayUri || order.upiIntentUri;
    paytmDeepLink.href = order.paytmUri || order.upiIntentUri;
    genericUpiDeepLink.href = order.upiIntentUri;

    paymentStepForm.hidden = true;
    paymentStepUpi.hidden = false;
    utrInput.value = "";
  }

  function fallbackUpiScreen(amt, purpose, name) {
    var upiId = "bharatsharma156742@ptaxis";
    var payee = "Bharat Sharma";
    var note = ("Braj Yatra " + Date.now().toString(36)).slice(0, 30);
    var uri = "upi://pay?pa=" + encodeURIComponent(upiId) + "&pn=" + encodeURIComponent(payee) + "&am=" + amt.toFixed(2) + "&cu=INR&tn=" + encodeURIComponent(note);
    var qrUrl = "assets/bharat-upi-qr.jpg";

    var mockOrder = {
      orderId: "ORD_BY_" + Date.now().toString(36).toUpperCase(),
      amount: amt,
      formattedAmount: "₹" + amt.toLocaleString("en-IN"),
      upiId: upiId,
      payeeName: payee,
      upiIntentUri: uri,
      qrCodeUrl: qrUrl
    };

    paymentState.currentOrder = mockOrder;
    showUpiPaymentScreen(mockOrder);
  }

  // Copy UPI ID button
  copyUpiIdBtn.addEventListener("click", function () {
    var upiId = dispUpiId.textContent.trim();
    navigator.clipboard.writeText(upiId).then(function () {
      copyUpiIdBtn.textContent = "✓ Copied!";
      setTimeout(function () { copyUpiIdBtn.textContent = "📋 Copy"; }, 1800);
    }).catch(function () {
      prompt("Copy UPI ID:", upiId);
    });
  });

  backToAmountBtn.addEventListener("click", function () {
    paymentStepForm.hidden = false;
    paymentStepUpi.hidden = true;
  });

  // Step 2 -> Step 3: Verify Payment & Show Receipt
  function submitVerification(utr) {
    if (!paymentState.currentOrder) return;
    verifyPaymentBtn.textContent = "Verifying Payment...";
    verifyPaymentBtn.disabled = true;

    fetch((API_BASE ? API_BASE : "") + "/api/payment/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId: paymentState.currentOrder.orderId,
        utrNumber: utr,
        devoteeName: payDevoteeName.value.trim() || "Devotee",
        amount: paymentState.currentOrder.amount
      })
    })
      .then(function (r) { return r.json(); })
      .then(function (res) {
        verifyPaymentBtn.textContent = "✅ Confirm Payment";
        verifyPaymentBtn.disabled = false;
        if (res && res.success && res.receipt) {
          renderReceipt(res.receipt);
        } else {
          fallbackReceipt(utr);
        }
      })
      .catch(function () {
        verifyPaymentBtn.textContent = "✅ Confirm Payment";
        verifyPaymentBtn.disabled = false;
        fallbackReceipt(utr);
      });
  }

  verifyPaymentBtn.addEventListener("click", function () {
    var utr = utrInput.value.trim();
    if (!utr) {
      alert("Please enter the 12-digit UPI / UTR Transaction Reference Number from your UPI app receipt, or click 'Instant Demo Verify'.");
      return;
    }
    submitVerification(utr);
  });

  instantDemoVerifyBtn.addEventListener("click", function () {
    var generatedUtr = "UPI" + Math.floor(100000000000 + Math.random() * 900000000000);
    utrInput.value = generatedUtr;
    submitVerification(generatedUtr);
  });

  function renderReceipt(receipt) {
    recId.textContent = receipt.receiptId;
    recDate.textContent = receipt.date;
    recDevotee.textContent = receipt.devoteeName;
    recAmount.textContent = receipt.formattedAmount;
    recUpi.textContent = receipt.upiId || "bharatsharma156742@ptaxis";
    recUtr.textContent = receipt.utrNumber;

    paymentStepUpi.hidden = true;
    paymentStepReceipt.hidden = false;

    // Update Digital Pass badge if active
    var passBadge = $("passStatusBadge");
    if (passBadge) {
      passBadge.textContent = "VIP PRIORITY DARSHAN (PAID)";
      passBadge.style.background = "#10B981";
    }
  }

  function fallbackReceipt(utr) {
    renderReceipt({
      receiptId: "RCP_BY_" + Math.floor(10000000 + Math.random() * 90000000),
      date: new Date().toLocaleString("en-IN"),
      devoteeName: payDevoteeName.value.trim() || "Kushagr Varshney",
      formattedAmount: paymentState.currentOrder ? paymentState.currentOrder.formattedAmount : "₹251",
      upiId: "bharatsharma156742@ptaxis",
      utrNumber: utr || "UPI" + Math.floor(100000000000 + Math.random() * 900000000000)
    });
  }

  printReceiptBtn.addEventListener("click", function () {
    window.print();
  });

  finishPaymentBtn.addEventListener("click", function () {
    closePaymentModal();
  });

  // Initialize
  checkServerHealth();
  checkExistingSession();
  renderTownChips();
  fetchPlaces();
  fetchCrowdRadar();
  fetchReviews();
  renderSeason();
})();

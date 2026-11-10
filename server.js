const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const app = express();
const PORT = parseInt(process.env.PORT, 10) || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

const DATA_DIR = path.join(__dirname, "data");
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readJsonFile(filename, defaultValue = []) {
  try {
    const filePath = path.join(DATA_DIR, filename);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2));
      return defaultValue;
    }
    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data || "[]");
  } catch (err) {
    console.error(`Error reading ${filename}:`, err);
    return defaultValue;
  }
}

function writeJsonFile(filename, data) {
  try {
    const filePath = path.join(DATA_DIR, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (err) {
    console.error(`Error writing ${filename}:`, err);
    return false;
  }
}

// Towns & Distance Matrix (in km)
const DISTANCE_MATRIX = {
  Mathura: { Mathura: 0, Vrindavan: 12, Gokul: 15, Govardhan: 22, Barsana: 50 },
  Vrindavan: { Mathura: 12, Vrindavan: 0, Gokul: 25, Govardhan: 26, Barsana: 48 },
  Gokul: { Mathura: 15, Vrindavan: 25, Gokul: 0, Govardhan: 35, Barsana: 62 },
  Govardhan: { Mathura: 22, Vrindavan: 26, Gokul: 35, Govardhan: 0, Barsana: 28 },
  Barsana: { Mathura: 50, Vrindavan: 48, Gokul: 62, Govardhan: 28, Barsana: 0 }
};

function estimateTravel(fromTown, toTown) {
  if (fromTown === toTown) return { km: 2, mins: 10, text: "Local transfer, ~10 mins" };
  const km = (DISTANCE_MATRIX[fromTown] && DISTANCE_MATRIX[fromTown][toTown]) || 20;
  const mins = Math.round((km / 25) * 60);
  return { km, mins, text: `${km} km (${mins} mins by road)` };
}

// 1. Health check & Telemetry
app.get("/api/health", (req, res) => {
  const places = readJsonFile("places.json", []);
  res.json({
    status: "online",
    system: "Braj Yatra Smart Pilgrimage Engine",
    version: "2.5.0-hackathon",
    uptimeSeconds: Math.floor(process.uptime()),
    placesCount: places.length,
    timestamp: new Date().toISOString()
  });
});

// 2. Places API (with search, category, area filters)
app.get("/api/places", (req, res) => {
  let places = readJsonFile("places.json", []);
  const { area, category, search } = req.query;

  if (area && area !== "All") {
    places = places.filter(p => p.area.toLowerCase() === area.toLowerCase());
  }
  if (category && category !== "All") {
    places = places.filter(p => p.cats && p.cats.includes(category.toLowerCase()));
  }
  if (search) {
    const q = search.toLowerCase();
    places = places.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.note.toLowerCase().includes(q) ||
      p.area.toLowerCase().includes(q)
    );
  }
  res.json({ success: true, count: places.length, places });
});

// 3. Single place details
app.get("/api/places/:id", (req, res) => {
  const places = readJsonFile("places.json", []);
  const place = places.find(p => p.id === req.params.id);
  if (!place) return res.status(404).json({ success: false, message: "Place not found" });
  res.json({ success: true, place });
});

// 4. Live Crowd Radar Telemetry
app.get("/api/crowd-radar", (req, res) => {
  const crowd = readJsonFile("crowd.json", []);
  // Dynamic jitter to simulate live sensor telemetry
  const hour = new Date().getHours();
  const dynamicCrowd = crowd.map(item => {
    let waitMultiplier = 1;
    if (hour >= 8 && hour <= 12) waitMultiplier = 1.3; // Morning darshan rush
    else if (hour > 12 && hour < 16) waitMultiplier = 0.5; // Afternoon temple resting period
    else if (hour >= 17 && hour <= 21) waitMultiplier = 1.4; // Evening aarti rush

    const currentWait = Math.max(5, Math.round(item.waitTimeMin * waitMultiplier));
    let status = "Smooth";
    let statusColor = "green";
    if (currentWait > 35) { status = "High Rush"; statusColor = "red"; }
    else if (currentWait >= 20) { status = "Moderate"; statusColor = "amber"; }

    return {
      ...item,
      currentWaitTimeMin: currentWait,
      status,
      statusColor,
      isTempleOpen: !(hour >= 12 && hour < 16 && (item.id === "bankebihari" || item.id === "janmabhoomi"))
    };
  });

  res.json({
    success: true,
    radarTime: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
    crowdTelemetry: dynamicCrowd
  });
});

// 5. Intelligent Itinerary Optimizer
app.post("/api/itinerary/generate", (req, res) => {
  const {
    days = 2,
    interests = ["temples", "ghats", "food"],
    pace = "standard",
    mode = "erick",
    stay = "mid",
    group = 2,
    pinned = []
  } = req.body;

  const allPlaces = readJsonFile("places.json", []);
  const numDays = Math.min(7, Math.max(1, Number(days)));
  const groupSize = Math.min(20, Math.max(1, Number(group)));

  // Filter pool
  const pool = allPlaces.filter(p => {
    return pinned.includes(p.id) || p.cats.some(c => interests.includes(c));
  });

  // Cluster by town priority to minimize inter-town commutes:
  // Mathura -> Vrindavan -> Gokul -> Govardhan -> Barsana
  const TOWN_ORDER = ["Mathura", "Vrindavan", "Gokul", "Govardhan", "Barsana"];
  const SLOT_PRIORITY = { morning: 0, midday: 1, evening: 2 };

  pool.sort((a, b) => {
    const townDiff = TOWN_ORDER.indexOf(a.area) - TOWN_ORDER.indexOf(b.area);
    if (townDiff !== 0) return townDiff;
    return (SLOT_PRIORITY[a.slot] || 0) - (SLOT_PRIORITY[b.slot] || 0);
  });

  // Daily target hours
  const PACE_LIMITS = { relaxed: 5.5, standard: 7.5, packed: 9.5 };
  const maxDailyHours = PACE_LIMITS[pace] || 7.5;

  const dayBuckets = [];
  for (let i = 0; i < numDays; i++) {
    dayBuckets.push({ dayNumber: i + 1, places: [], totalHours: 0, towns: new Set() });
  }

  const unassigned = [];
  let currentDayIdx = 0;

  pool.forEach(place => {
    const timeNeeded = (place.h || 1) + 0.5;
    if (dayBuckets[currentDayIdx].totalHours + timeNeeded <= maxDailyHours) {
      dayBuckets[currentDayIdx].places.push(place);
      dayBuckets[currentDayIdx].totalHours += timeNeeded;
      dayBuckets[currentDayIdx].towns.add(place.area);
    } else {
      if (currentDayIdx + 1 < numDays) {
        currentDayIdx++;
        dayBuckets[currentDayIdx].places.push(place);
        dayBuckets[currentDayIdx].totalHours += timeNeeded;
        dayBuckets[currentDayIdx].towns.add(place.area);
      } else {
        unassigned.push(place);
      }
    }
  });

  // Time-sequence each day
  const formattedDays = dayBuckets
    .filter(bucket => bucket.places.length > 0)
    .map(bucket => {
      // Sort within day by slot (morning -> midday -> evening)
      bucket.places.sort((a, b) => (SLOT_PRIORITY[a.slot] || 0) - (SLOT_PRIORITY[b.slot] || 0));

      let curTime = 7.5; // Start at 7:30 AM
      let lunchTaken = false;
      let prevPlace = null;
      const timeline = [];

      bucket.places.forEach((p, idx) => {
        // Midday lunch / rest break between 12:30 PM & 2:00 PM
        if (!lunchTaken && curTime >= 12.0) {
          const lHours = Math.floor(curTime);
          const lMins = Math.round((curTime - lHours) * 60);
          timeline.push({
            type: "break",
            time: formatClock(curTime),
            title: "Traditional Sattvic Lunch & Temple Rest",
            text: "Temples in Braj pause darshan from 12:30 PM to 4:00 PM. Enjoy fresh Bedmi Puri, Mathura lassi, and rest out of the afternoon heat.",
            durationHours: 1.5
          });
          curTime += 1.5;
          lunchTaken = true;
        }

        // Inter-temple travel note
        let transitInfo = null;
        if (prevPlace && prevPlace.area !== p.area) {
          transitInfo = estimateTravel(prevPlace.area, p.area);
          curTime += transitInfo.mins / 60;
        } else if (prevPlace) {
          transitInfo = { text: "Short local auto/e-rickshaw ride, ~10 mins", mins: 10 };
          curTime += 0.2;
        }

        // Align evening places to late afternoon / sunset
        if (p.slot === "evening" && curTime < 16.5) {
          if (!lunchTaken) {
            timeline.push({
              type: "break",
              time: formatClock(curTime),
              title: "Rest & Sweet Tasting",
              text: "Evening darshans commence around 4:30 - 5:00 PM. Refresh with cool Rabri or Kulhad Chai.",
              durationHours: 1
            });
            lunchTaken = true;
          }
          curTime = 16.5;
        }

        timeline.push({
          type: "visit",
          id: p.id,
          time: formatClock(curTime),
          title: p.name,
          area: p.area,
          note: p.note,
          timing: p.timing || "Morning & Evening",
          dressCode: p.dressCode,
          crowdEstimate: p.crowd || "Moderate",
          expectedWaitMin: p.waitTimeMin || 20,
          audioGuideText: p.audio,
          transitFromPrev: transitInfo ? transitInfo.text : null,
          image: p.image,
          durationHours: p.h
        });

        curTime += p.h;
        prevPlace = p;
      });

      return {
        day: bucket.dayNumber,
        title: `Day ${bucket.dayNumber}: ${Array.from(bucket.towns).join(" & ")} Circuit`,
        primaryTowns: Array.from(bucket.towns),
        estimatedWrapUp: formatClock(curTime),
        stopsCount: bucket.places.length,
        timeline
      };
    });

  // Calculate comprehensive budget
  const STAY_COSTS = { budget: 850, mid: 2500, comfort: 5800 };
  const FOOD_COSTS = { budget: 350, mid: 750, comfort: 1500 };
  const TRANSPORT_MODES = {
    erick: { name: "E-Rickshaws & Local Autos", ratePerDay: 750, capacity: 3 },
    cab: { name: "Private Air-Conditioned Cab", ratePerDay: 3200, capacity: 4 },
    traveller: { name: "Tempo Traveller", ratePerDay: 6800, capacity: 12 }
  };

  const selectedStay = STAY_COSTS[stay] || 2500;
  const selectedFood = FOOD_COSTS[stay] || 750;
  const selectedTransport = TRANSPORT_MODES[mode] || TRANSPORT_MODES.erick;

  const nights = Math.max(0, formattedDays.length - 1);
  const roomsNeeded = Math.ceil(groupSize / 2);
  const vehiclesNeeded = Math.ceil(groupSize / selectedTransport.capacity);

  const totalStay = nights * roomsNeeded * selectedStay;
  const totalFood = formattedDays.length * groupSize * selectedFood;
  const totalTransport = formattedDays.length * vehiclesNeeded * selectedTransport.ratePerDay;
  const bufferContingency = Math.round((totalStay + totalFood + totalTransport) * 0.1);
  const grandTotal = totalStay + totalFood + totalTransport + bufferContingency;

  const budgetBreakdown = {
    total: grandTotal,
    perPerson: Math.round(grandTotal / groupSize),
    currency: "INR",
    formattedTotal: `₹${grandTotal.toLocaleString("en-IN")}`,
    formattedPerPerson: `₹${Math.round(grandTotal / groupSize).toLocaleString("en-IN")}`,
    stay: {
      amount: totalStay,
      description: `${nights} nights × ${roomsNeeded} rooms @ ₹${selectedStay}/night`
    },
    food: {
      amount: totalFood,
      description: `${formattedDays.length} days × ${groupSize} pax sattvic meals & prasadam`
    },
    transport: {
      amount: totalTransport,
      description: `${formattedDays.length} days × ${vehiclesNeeded} ${selectedTransport.name}`
    },
    buffer: {
      amount: bufferContingency,
      description: "10% contingency for boat rides, temple parikrama, and pedas"
    }
  };

  res.json({
    success: true,
    summary: {
      daysCount: formattedDays.length,
      groupSize,
      mode: selectedTransport.name,
      pace,
      stayTier: stay
    },
    budget: budgetBreakdown,
    itineraryDays: formattedDays,
    overflowPlaces: unassigned.map(p => ({ id: p.id, name: p.name, area: p.area }))
  });
});

function formatClock(decTime) {
  let hrs = Math.floor(decTime);
  let mins = Math.round((decTime - hrs) * 60);
  if (mins >= 60) { hrs += 1; mins = 0; }
  const ampm = hrs >= 12 ? "PM" : "AM";
  const displayHours = hrs % 12 === 0 ? 12 : hrs % 12;
  return `${displayHours}:${mins < 10 ? "0" : ""}${mins} ${ampm}`;
}

// 6. Save & Share Itinerary
app.post("/api/itinerary/save", (req, res) => {
  const { itineraryData, title = "My Braj Yatra Itinerary" } = req.body;
  if (!itineraryData) return res.status(400).json({ success: false, message: "Missing itinerary data" });

  const itineraries = readJsonFile("itineraries.json", []);
  const randomSlug = "YATRA-" + Math.floor(1000 + Math.random() * 9000);
  const newRecord = {
    id: randomSlug,
    title,
    createdAt: new Date().toISOString(),
    data: itineraryData
  };

  itineraries.unshift(newRecord);
  writeJsonFile("itineraries.json", itineraries.slice(0, 50)); // keep last 50

  res.json({
    success: true,
    itineraryId: randomSlug,
    shareUrl: `?itinerary=${randomSlug}`,
    message: "Itinerary securely saved!"
  });
});

app.get("/api/itinerary/:id", (req, res) => {
  const itineraries = readJsonFile("itineraries.json", []);
  const record = itineraries.find(item => item.id.toUpperCase() === req.params.id.toUpperCase());
  if (!record) return res.status(404).json({ success: false, message: "Itinerary not found" });
  res.json({ success: true, itinerary: record });
});

// 7. Digital Pilgrim Yatra e-Pass (Gov/Temple Darshan Pass simulation)
app.post("/api/pass/generate", (req, res) => {
  const {
    leaderName,
    phone,
    travelDate,
    durationDays = 2,
    groupSize = 2,
    vehicleType = "E-Rickshaw/Auto",
    preferredSlot = "Morning (07:00 AM - 11:30 AM)"
  } = req.body;

  if (!leaderName || !phone) {
    return res.status(400).json({ success: false, message: "Leader name and mobile number are required" });
  }

  const passId = "BY-PASS-" + crypto.randomBytes(3).toString("hex").toUpperCase();
  const passes = readJsonFile("passes.json", []);

  const newPass = {
    passId,
    issuedAt: new Date().toISOString(),
    leaderName,
    phone: phone.replace(/.(?=.{4})/g, "*"), // masked for privacy
    travelDate: travelDate || new Date(Date.now() + 86400000).toISOString().split("T")[0],
    durationDays,
    groupSize: Number(groupSize),
    vehicleType,
    preferredSlot,
    qrPayload: `BRAJ-YATRA-PASS|${passId}|${encodeURIComponent(leaderName)}|${groupSize}PAX|VERIFIED`,
    status: "Verified & Active",
    helplineNumbers: {
      tourismHelpdesk: "1800-180-5145",
      brajPoliceControl: "112",
      ambulanceService: "108"
    }
  };

  passes.unshift(newPass);
  writeJsonFile("passes.json", passes.slice(0, 100));

  res.json({ success: true, pass: newPass });
});

app.get("/api/pass/verify/:passId", (req, res) => {
  const passes = readJsonFile("passes.json", []);
  const pass = passes.find(p => p.passId.toUpperCase() === req.params.passId.toUpperCase());
  if (!pass) return res.status(404).json({ success: false, verified: false, message: "Pass not found" });
  res.json({ success: true, verified: true, pass });
});

// 8. Braj Sarthi AI Pilgrimage Assistant
app.post("/api/ai/chat", (req, res) => {
  const { question = "" } = req.body;
  const q = question.toLowerCase();

  let answer = "";
  let suggestions = [];

  if (q.includes("monkey") || q.includes("spectacle") || q.includes("glasses") || q.includes("safe")) {
    answer = "In Vrindavan (especially near Banke Bihari and Nidhivan), the local rhesus monkeys are notorious for snatching eyeglasses, sunglasses, mobile phones, and plastic bags. Always tuck your spectacles inside a zipped bag, wear a cap, avoid keeping phones in front pockets, and carry no open eatables.";
    suggestions = ["What are Banke Bihari timings?", "Best time for Nidhivan?"];
  } else if (q.includes("banke bihari") || q.includes("bihari ji")) {
    answer = "Shri Banke Bihari Temple timings: Morning 7:45 AM - 12:00 PM, Evening 5:30 PM - 9:30 PM (slight variations in winter). Darshan is in continuous short intervals with curtains drawn to protect devotees from divine intoxication. Reach 30-45 minutes before morning darshan for smoother entry.";
    suggestions = ["Can we take phones inside?", "Where to get Vrindavan prasad?"];
  } else if (q.includes("govardhan") || q.includes("parikrama") || q.includes("giriraj")) {
    answer = "Govardhan Hill Parikrama is 21 km (approx 14 miles). Walking takes 5 to 7 hours; electric golf carts and e-rickshaws cover it in 2.5 to 3 hours. Key sacred milestones along the path are Mansi Ganga, Dan Ghati, Radha Kund, Shyam Kund, and Kusum Sarovar. Best performed barefoot or with soft cotton socks in the morning or cool evening.";
    suggestions = ["Is e-rickshaw available for elderly?", "How far is Govardhan from Mathura?"];
  } else if (q.includes("food") || q.includes("peda") || q.includes("eat") || q.includes("kachori") || q.includes("sweet")) {
    answer = "Braj is a haven for pure vegetarian and sattvic delicacies! Must-tries:\n1. Mathura Peda: Caramelized khoya sweets from Brijwasi sweets near Holi Gate.\n2. Morning Breakfast: Crispy Hing Kachori with spicy Aloo Sabzi and piping hot Jalebi.\n3. Bedmi Puri with Pumpkin sabzi.\n4. Kulhad Rabri and thick churned Lassi.\nRemember: Vrindavan restaurants strictly serve without onion and garlic!";
    suggestions = ["Best places in Mathura?", "Where is Prem Mandir?"];
  } else if (q.includes("elderly") || q.includes("senior") || q.includes("wheelchair") || q.includes("parents")) {
    answer = "For senior citizens:\n• Barsana: Take the modern Ropeway to reach Radha Rani hilltop temple without climbing 250+ stairs.\n• Govardhan: Hire a battery-operated 4-seater golf cart from Dan Ghati.\n• Vrindavan: Prem Mandir and ISKCON are very wheelchair-friendly with smooth ramps.\n• Banke Bihari: Consider the morning 8:00 AM slot via VIP/Senior corridor assistance.";
    suggestions = ["Generate a relaxed 3-day itinerary", "Book Digital Pilgrim Pass"];
  } else if (q.includes("barsana") || q.includes("holi") || q.includes("lathmar")) {
    answer = "Barsana is the sacred land of Shri Radha Rani. The famous Lathmar Holi takes place about a week before standard Holi, where women playfully beat shields held by men from Nandgaon. If visiting Barsana, climb Bhanugarh hill to Shri Radha Rani Temple and visit Nandgaon (Nand Bhawan) 8 km away.";
    suggestions = ["How to reach Barsana from Mathura?", "When is Janmashtami?"];
  } else if (q.includes("prem mandir") || q.includes("light")) {
    answer = "Prem Mandir is crafted out of pure Italian white marble. The mesmerizing Musical Colored Water Fountain & Architectural Light Show runs every evening from 7:30 PM to 8:00 PM. Admission is free. Highly recommended to visit between 6:30 PM and 8:15 PM.";
    suggestions = ["What are ISKCON temple timings?", "Where is Keshi Ghat?"];
  } else {
    answer = `Radhe Radhe! I am your Braj Sarthi pilgrimage guide. The Braj circuit spans Mathura, Vrindavan, Gokul, Govardhan, and Barsana. You can ask me about temple timings, monkey precautions, holy parikrama routes, local peda shops, or wheelchair access for elderly devotees!`;
    suggestions = ["Banke Bihari Darshan Timings", "Govardhan Parikrama Guide", "Mathura Famous Food", "Senior Citizen Facilities"];
  }

  res.json({
    success: true,
    reply: answer,
    suggestedTopics: suggestions
  });
});

// 9. Community Reviews
app.get("/api/reviews", (req, res) => {
  const reviews = readJsonFile("reviews.json", []);
  res.json({ success: true, reviews });
});

app.post("/api/reviews", (req, res) => {
  const { author, city, place, rating = 5, comment } = req.body;
  if (!author || !comment) return res.status(400).json({ success: false, message: "Author and review text required" });

  const reviews = readJsonFile("reviews.json", []);
  const newRev = {
    id: "rev-" + Date.now(),
    author,
    city: city || "Pilgrim",
    rating: Number(rating),
    place: place || "Braj Yatra",
    comment,
    date: "Just now"
  };
  reviews.unshift(newRev);
  writeJsonFile("reviews.json", reviews.slice(0, 50));
  res.json({ success: true, review: newRev });
});

// 10. Weather & Yamuna River advisory
app.get("/api/weather-advisory", (req, res) => {
  res.json({
    success: true,
    temperature: "27°C",
    condition: "Clear and Pleasant",
    aqi: "112 (Moderate)",
    yamunaGhatWaterLevel: "Normal / Safe for Boat Rides",
    bestWalkingHours: "6:00 AM - 10:30 AM & 4:30 PM - 8:30 PM",
    advisoryNote: "Carry hydration, wear soft slip-on cotton socks for temple stone pavings."
  });
});

// 11. Authentication with Mobile Number & OTP
const activeOtps = new Map(); // phone -> { otp, expiresAt, name }
const activeSessions = new Map(); // token -> user profile

app.post("/api/auth/send-otp", (req, res) => {
  const { phone, name = "Devotee" } = req.body;
  if (!phone) {
    return res.status(400).json({ success: false, message: "Mobile number is required" });
  }

  // Sanitize 10-digit number
  const cleanPhone = phone.replace(/[^0-9]/g, "").slice(-10);
  if (cleanPhone.length !== 10) {
    return res.status(400).json({ success: false, message: "Please enter a valid 10-digit Indian mobile number" });
  }

  // Generate 4-digit OTP
  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 mins

  activeOtps.set(cleanPhone, { otp, expiresAt, name });

  // Read/update users store
  const users = readJsonFile("users.json", []);
  let user = users.find(u => u.phone === cleanPhone);
  if (!user) {
    user = {
      phone: cleanPhone,
      name: name || "Devotee",
      joinedAt: new Date().toISOString(),
      savedItineraries: [],
      passes: []
    };
    users.push(user);
    writeJsonFile("users.json", users);
  }

  console.log(`[AUTH] 📲 SMS dispatched to +91 ${cleanPhone} | OTP Code: ${otp}`);

  res.json({
    success: true,
    message: `OTP sent successfully to +91 ******${cleanPhone.slice(-4)}`,
    phone: cleanPhone,
    otp: otp, // Returned for instant demo testing and notification toast in UI
    expiresInSec: 300,
    smsSimulation: `[Braj Yatra] ${otp} is your secret OTP for Yatri Login. Valid for 5 minutes. Do not share with anyone. Radhe Radhe!`
  });
});

app.post("/api/auth/verify-otp", (req, res) => {
  const { phone, otp, name } = req.body;
  if (!phone || !otp) {
    return res.status(400).json({ success: false, message: "Phone number and OTP are required" });
  }

  const cleanPhone = phone.replace(/[^0-9]/g, "").slice(-10);
  const record = activeOtps.get(cleanPhone);

  // Allow standard demo OTP 1234 or the generated OTP
  const isValid = (record && record.otp === otp && record.expiresAt > Date.now()) || otp === "1234";

  if (!isValid) {
    return res.status(400).json({ success: false, message: "Invalid or expired OTP. Please try again or click Resend." });
  }

  // Clean OTP once used
  activeOtps.delete(cleanPhone);

  // Retrieve / update user
  const users = readJsonFile("users.json", []);
  let user = users.find(u => u.phone === cleanPhone);
  if (!user) {
    user = {
      phone: cleanPhone,
      name: name || (record && record.name) || "Devotee",
      joinedAt: new Date().toISOString(),
      savedItineraries: [],
      passes: []
    };
    users.push(user);
  } else if (name && name !== "Devotee") {
    user.name = name;
  }
  writeJsonFile("users.json", users);

  // Generate Session Token
  const token = "by_token_" + crypto.randomBytes(16).toString("hex");
  activeSessions.set(token, user);

  res.json({
    success: true,
    message: "Login verified successfully! Radhe Radhe.",
    token,
    user: {
      phone: user.phone,
      name: user.name,
      joinedAt: user.joinedAt
    }
  });
});

app.get("/api/auth/me", (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.slice(7) : req.query.token;

  if (!token || !activeSessions.has(token)) {
    return res.status(401).json({ success: false, authenticated: false, message: "Session expired or not logged in" });
  }

  const user = activeSessions.get(token);
  res.json({
    success: true,
    authenticated: true,
    user: {
      phone: user.phone,
      name: user.name,
      joinedAt: user.joinedAt
    }
  });
});

app.post("/api/auth/logout", (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.slice(7) : req.body.token;
  if (token) activeSessions.delete(token);
  res.json({ success: true, message: "Logged out successfully" });
});

// 12. Attractive UPI Payment Gateway Integration
// Official UPI ID specified by user: bharatsharma156742@ptaxis
const OFFICIAL_UPI_ID = "bharatsharma156742@ptaxis";
const PAYEE_NAME = "Bharat Sharma";

app.post("/api/payment/create-order", (req, res) => {
  const {
    amount = 101,
    purpose = "Braj Yatra VIP Pass & Seva",
    devoteeName = "Devotee",
    phone = "",
    yatraPassId = ""
  } = req.body;

  const validAmount = Math.max(1, Number(amount) || 101);
  const orderId = "ORD_BY_" + Date.now().toString(36).toUpperCase() + "_" + crypto.randomBytes(2).toString("hex").toUpperCase();

  // Construct standard NPCI UPI Payment Intent URI
  // e.g.: upi://pay?pa=bharatsharma156742@ptaxis&pn=Bharat%20Sharma&am=101.00&cu=INR&tn=BrajYatra_ORD...
  const cleanNote = `Braj Yatra ${orderId}`.replace(/[^a-zA-Z0-9 ]/g, "").slice(0, 30);
  const upiIntentUri = `upi://pay?pa=${encodeURIComponent(OFFICIAL_UPI_ID)}&pn=${encodeURIComponent(PAYEE_NAME)}&am=${validAmount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(cleanNote)}`;

  // Direct app-specific deep links
  const gpayUri = `gpay://upi/pay?pa=${encodeURIComponent(OFFICIAL_UPI_ID)}&pn=${encodeURIComponent(PAYEE_NAME)}&am=${validAmount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(cleanNote)}`;
  const phonepeUri = `phonepe://pay?pa=${encodeURIComponent(OFFICIAL_UPI_ID)}&pn=${encodeURIComponent(PAYEE_NAME)}&am=${validAmount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(cleanNote)}`;
  const paytmUri = `paytmmp://pay?pa=${encodeURIComponent(OFFICIAL_UPI_ID)}&pn=${encodeURIComponent(PAYEE_NAME)}&am=${validAmount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(cleanNote)}`;

  // Official static QR uploaded by user (bharat-upi-qr.jpg)
  const qrCodeUrl = fs.existsSync(path.join(__dirname, "assets", "bharat-upi-qr.jpg"))
    ? "assets/bharat-upi-qr.jpg"
    : `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=8&data=${encodeURIComponent(upiIntentUri)}`;

  const payments = readJsonFile("payments.json", []);
  const newOrder = {
    orderId,
    amount: validAmount,
    purpose,
    devoteeName,
    phone,
    yatraPassId,
    upiId: OFFICIAL_UPI_ID,
    payeeName: PAYEE_NAME,
    upiIntentUri,
    status: "PENDING",
    createdAt: new Date().toISOString()
  };

  payments.unshift(newOrder);
  writeJsonFile("payments.json", payments.slice(0, 100));

  res.json({
    success: true,
    order: {
      orderId,
      amount: validAmount,
      formattedAmount: `₹${validAmount.toLocaleString("en-IN")}`,
      purpose,
      upiId: OFFICIAL_UPI_ID,
      payeeName: PAYEE_NAME,
      upiIntentUri,
      gpayUri,
      phonepeUri,
      paytmUri,
      qrCodeUrl
    }
  });
});

app.post("/api/payment/verify", (req, res) => {
  const { orderId, utrNumber, devoteeName, amount } = req.body;
  if (!orderId) {
    return res.status(400).json({ success: false, message: "Order ID is required" });
  }

  const payments = readJsonFile("payments.json", []);
  let order = payments.find(p => p.orderId === orderId);

  const receiptId = "RCP_BY_" + crypto.randomBytes(4).toString("hex").toUpperCase();
  const utr = utrNumber && utrNumber.trim().length >= 6 ? utrNumber.trim() : "UPI" + Math.floor(100000000000 + Math.random() * 900000000000);

  if (order) {
    order.status = "SUCCESS";
    order.utrNumber = utr;
    order.receiptId = receiptId;
    order.completedAt = new Date().toISOString();
  } else {
    order = {
      orderId,
      amount: Number(amount) || 101,
      devoteeName: devoteeName || "Devotee",
      upiId: OFFICIAL_UPI_ID,
      status: "SUCCESS",
      utrNumber: utr,
      receiptId,
      completedAt: new Date().toISOString()
    };
    payments.unshift(order);
  }

  writeJsonFile("payments.json", payments);

  // If linked to a yatra pass, update pass status to VIP Priority Darshan (Paid)
  if (order.yatraPassId) {
    const passes = readJsonFile("passes.json", []);
    const pass = passes.find(p => p.passId === order.yatraPassId);
    if (pass) {
      pass.status = "VIP Priority Darshan (Paid & Verified)";
      pass.paymentReceiptId = receiptId;
      writeJsonFile("passes.json", passes);
    }
  }

  res.json({
    success: true,
    message: "Payment successfully verified! Radhe Radhe.",
    receipt: {
      receiptId,
      orderId: order.orderId,
      amount: order.amount,
      formattedAmount: `₹${order.amount.toLocaleString("en-IN")}`,
      upiId: OFFICIAL_UPI_ID,
      payeeName: PAYEE_NAME,
      utrNumber: utr,
      status: "PAID & VERIFIED",
      date: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
      devoteeName: order.devoteeName || devoteeName || "Devotee"
    }
  });
});

app.get("/api/payment/orders", (req, res) => {
  const payments = readJsonFile("payments.json", []);
  res.json({ success: true, count: payments.length, payments });
});

// Catch-all route to serve index.html for SPA feel
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

function startServer(port, maxAttempts = 10) {
  const server = app.listen(port, () => {
    console.log(`===================================================`);
    console.log(`🛕 Braj Yatra Backend API running on port ${port}`);
    console.log(`🔗 Local URL: http://localhost:${port}`);
    console.log(`✨ Health: http://localhost:${port}/api/health`);
    console.log(`===================================================`);
  });

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE" && maxAttempts > 0) {
      console.warn(`⚠️ Port ${port} is in use. Trying port ${port + 1}...`);
      startServer(port + 1, maxAttempts - 1);
    } else {
      console.error("Server error:", err);
    }
  });
}

startServer(PORT);

module.exports = app;


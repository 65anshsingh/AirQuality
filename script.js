const FALLBACK_CSV = `date,city,aqi
2026-03-31,Delhi,248
2026-03-31,Mumbai,88
2026-03-31,Kolkata,149
2026-03-31,Bangalore,56
2026-03-31,Jalandhar,171
2026-03-31,Chennai,64
2026-04-01,Delhi,262
2026-04-01,Mumbai,94
2026-04-01,Kolkata,157
2026-04-01,Bangalore,60
2026-04-01,Jalandhar,182
2026-04-01,Chennai,70
2026-04-02,Delhi,278
2026-04-02,Mumbai,102
2026-04-02,Kolkata,172
2026-04-02,Bangalore,68
2026-04-02,Jalandhar,194
2026-04-02,Chennai,78
2026-04-03,Delhi,291
2026-04-03,Mumbai,109
2026-04-03,Kolkata,176
2026-04-03,Bangalore,71
2026-04-03,Jalandhar,201
2026-04-03,Chennai,82
2026-04-04,Delhi,284
2026-04-04,Mumbai,101
2026-04-04,Kolkata,169
2026-04-04,Bangalore,66
2026-04-04,Jalandhar,192
2026-04-04,Chennai,79
2026-04-05,Delhi,272
2026-04-05,Mumbai,96
2026-04-05,Kolkata,161
2026-04-05,Bangalore,61
2026-04-05,Jalandhar,188
2026-04-05,Chennai,76
2026-04-06,Delhi,278
2026-04-06,Mumbai,98
2026-04-06,Kolkata,165
2026-04-06,Bangalore,62
2026-04-06,Jalandhar,185
2026-04-06,Chennai,74`;

const CITY_ORDER = ["Delhi", "Mumbai", "Kolkata", "Bangalore", "Jalandhar", "Chennai"];

const CITY_CONFIG = {
  Delhi: { latitude: "28.6139", longitude: "77.2090" },
  Mumbai: { latitude: "19.0760", longitude: "72.8777" },
  Kolkata: { latitude: "22.5726", longitude: "88.3639" },
  Bangalore: { latitude: "12.9716", longitude: "77.5946" },
  Jalandhar: { latitude: "31.3260", longitude: "75.5762" },
  Chennai: { latitude: "13.0827", longitude: "80.2707" }
};

const AIR_QUALITY_API_URL = "https://air-quality-api.open-meteo.com/v1/air-quality";
const WEATHER_API_URL = "https://api.open-meteo.com/v1/forecast";

const AIR_QUALITY_FIELDS = [
  "pm2_5",
  "pm10",
  "carbon_monoxide",
  "nitrogen_dioxide",
  "sulphur_dioxide",
  "ozone"
];

const WEATHER_CURRENT_FIELDS = [
  "temperature_2m",
  "relative_humidity_2m",
  "wind_speed_10m",
  "weather_code"
];

const WEATHER_DAILY_FIELDS = ["uv_index_max"];

const AQI_LEVELS = [
  {
    max: 50,
    label: "Good",
    shortLabel: "Good",
    color: "#2d8f68",
    description: "Air quality is clean and the health risk is minimal for most people.",
    advice: "Outdoor activities are generally safe and natural ventilation is fine."
  },
  {
    max: 100,
    label: "Satisfactory",
    shortLabel: "Satisfactory",
    color: "#cc8a00",
    description: "Air quality is acceptable, though sensitive people may feel mild discomfort.",
    advice: "Take short breaks from prolonged outdoor activity if you have breathing issues."
  },
  {
    max: 200,
    label: "Moderately Polluted",
    shortLabel: "Moderate",
    color: "#f1a64a",
    description: "Breathing discomfort can begin for people with asthma, heart disease, and children.",
    advice: "Limit long outdoor exercise and use a mask near high traffic corridors."
  },
  {
    max: 300,
    label: "Poor",
    shortLabel: "Poor",
    color: "#d65a31",
    description: "Air pollution can affect most people and trigger irritation, coughing, and fatigue.",
    advice: "Avoid heavy outdoor exertion and shift workouts indoors when possible."
  },
  {
    max: 400,
    label: "Very Poor",
    shortLabel: "Very Poor",
    color: "#9d2f7f",
    description: "This air can worsen respiratory and cardiac illness and affect healthy adults too.",
    advice: "Stay indoors when possible, keep windows shut, and wear a high-filtration mask outside."
  },
  {
    max: Infinity,
    label: "Severe",
    shortLabel: "Severe",
    color: "#7b1f27",
    description: "Emergency-level pollution. Even short exposure can affect healthy people.",
    advice: "Avoid all unnecessary outdoor exposure and use indoor air cleaning if available."
  }
];

const POLLUTANT_META = {
  pm25: {
    apiKey: "pm2_5",
    label: "PM2.5",
    description: "Fine particles (< 2.5 um)",
    limit: 35,
    unit: "ug/m3",
    displayDecimals: 0,
    averageHours: 24,
    source: "Vehicle exhaust, industry, open burning"
  },
  pm10: {
    apiKey: "pm10",
    label: "PM10",
    description: "Coarse particles (< 10 um)",
    limit: 150,
    unit: "ug/m3",
    displayDecimals: 0,
    averageHours: 24,
    source: "Road dust, construction, soil disturbance"
  },
  no2: {
    apiKey: "nitrogen_dioxide",
    label: "NO2",
    description: "Nitrogen dioxide",
    limit: 40,
    unit: "ug/m3",
    displayDecimals: 0,
    averageHours: 24,
    source: "Traffic, generators, thermal power plants"
  },
  o3: {
    apiKey: "ozone",
    label: "Ozone",
    description: "Ground-level ozone",
    limit: 100,
    unit: "ug/m3",
    displayDecimals: 0,
    averageHours: 8,
    source: "Sunlight-driven reaction of NOx and VOCs"
  },
  co: {
    apiKey: "carbon_monoxide",
    label: "CO",
    description: "Carbon monoxide",
    limit: 10,
    unit: "mg/m3",
    displayDecimals: 1,
    chartLabel: "CO x10",
    chartMultiplier: 10,
    transform: (value) => value / 1000,
    averageHours: 8,
    source: "Incomplete combustion, vehicles, diesel sets"
  },
  so2: {
    apiKey: "sulphur_dioxide",
    label: "SO2",
    description: "Sulfur dioxide",
    limit: 20,
    unit: "ug/m3",
    displayDecimals: 0,
    averageHours: 24,
    source: "Coal combustion, refineries, industrial fuel"
  }
};

const INDIA_AQI_BREAKPOINTS = {
  pm25: [
    { aqiLow: 0, aqiHigh: 50, concLow: 0, concHigh: 30 },
    { aqiLow: 51, aqiHigh: 100, concLow: 31, concHigh: 60 },
    { aqiLow: 101, aqiHigh: 200, concLow: 61, concHigh: 90 },
    { aqiLow: 201, aqiHigh: 300, concLow: 91, concHigh: 120 },
    { aqiLow: 301, aqiHigh: 400, concLow: 121, concHigh: 250 },
    { aqiLow: 401, aqiHigh: 500, concLow: 251, concHigh: Infinity }
  ],
  pm10: [
    { aqiLow: 0, aqiHigh: 50, concLow: 0, concHigh: 50 },
    { aqiLow: 51, aqiHigh: 100, concLow: 51, concHigh: 100 },
    { aqiLow: 101, aqiHigh: 200, concLow: 101, concHigh: 250 },
    { aqiLow: 201, aqiHigh: 300, concLow: 251, concHigh: 350 },
    { aqiLow: 301, aqiHigh: 400, concLow: 351, concHigh: 430 },
    { aqiLow: 401, aqiHigh: 500, concLow: 431, concHigh: Infinity }
  ],
  no2: [
    { aqiLow: 0, aqiHigh: 50, concLow: 0, concHigh: 40 },
    { aqiLow: 51, aqiHigh: 100, concLow: 41, concHigh: 80 },
    { aqiLow: 101, aqiHigh: 200, concLow: 81, concHigh: 180 },
    { aqiLow: 201, aqiHigh: 300, concLow: 181, concHigh: 280 },
    { aqiLow: 301, aqiHigh: 400, concLow: 281, concHigh: 400 },
    { aqiLow: 401, aqiHigh: 500, concLow: 401, concHigh: Infinity }
  ],
  o3: [
    { aqiLow: 0, aqiHigh: 50, concLow: 0, concHigh: 50 },
    { aqiLow: 51, aqiHigh: 100, concLow: 51, concHigh: 100 },
    { aqiLow: 101, aqiHigh: 200, concLow: 101, concHigh: 168 },
    { aqiLow: 201, aqiHigh: 300, concLow: 169, concHigh: 208 },
    { aqiLow: 301, aqiHigh: 400, concLow: 209, concHigh: 748 },
    { aqiLow: 401, aqiHigh: 500, concLow: 749, concHigh: Infinity }
  ],
  co: [
    { aqiLow: 0, aqiHigh: 50, concLow: 0, concHigh: 1.0 },
    { aqiLow: 51, aqiHigh: 100, concLow: 1.1, concHigh: 2.0 },
    { aqiLow: 101, aqiHigh: 200, concLow: 2.1, concHigh: 10.0 },
    { aqiLow: 201, aqiHigh: 300, concLow: 10.1, concHigh: 17.0 },
    { aqiLow: 301, aqiHigh: 400, concLow: 17.1, concHigh: 34.0 },
    { aqiLow: 401, aqiHigh: 500, concLow: 34.1, concHigh: Infinity }
  ],
  so2: [
    { aqiLow: 0, aqiHigh: 50, concLow: 0, concHigh: 40 },
    { aqiLow: 51, aqiHigh: 100, concLow: 41, concHigh: 80 },
    { aqiLow: 101, aqiHigh: 200, concLow: 81, concHigh: 380 },
    { aqiLow: 201, aqiHigh: 300, concLow: 381, concHigh: 800 },
    { aqiLow: 301, aqiHigh: 400, concLow: 801, concHigh: 1600 },
    { aqiLow: 401, aqiHigh: 500, concLow: 1601, concHigh: Infinity }
  ]
};

const HEALTH_IMPACTS = [
  {
    tag: "RS",
    title: "Respiratory system",
    description: "PM2.5 particles penetrate deep into lung tissue. Prolonged exposure raises the risk of asthma, chronic bronchitis, and COPD.",
    badgeColor: "#d9732f",
    badgeBg: "#fff0e6"
  },
  {
    tag: "CV",
    title: "Cardiovascular",
    description: "Fine particles enter the bloodstream causing inflammation. Long-term exposure is linked to heart attacks, strokes, and arrhythmia.",
    badgeColor: "#c5551e",
    badgeBg: "#fde8df"
  },
  {
    tag: "ES",
    title: "Eyes and skin",
    description: "NO2 and ground-level ozone trigger eye irritation, redness, and tearing. Particulate matter accelerates visible skin aging.",
    badgeColor: "#1f5e9c",
    badgeBg: "#e8f0f7"
  },
  {
    tag: "NE",
    title: "Neurological",
    description: "Sustained NO2 exposure is linked to cognitive decline in adults and neurodevelopmental issues in children under age 5.",
    badgeColor: "#9d2f7f",
    badgeBg: "#f4e9f5"
  },
  {
    tag: "PB",
    title: "Pregnancy and birth",
    description: "Air pollution raises risk of preterm birth, low birth weight, and neonatal respiratory disorders. Extra caution is advised outdoors.",
    badgeColor: "#d65a31",
    badgeBg: "#fbe8df"
  },
  {
    tag: "CH",
    title: "Children",
    description: "Developing lungs are especially vulnerable. Early exposure reduces lifelong lung capacity and increases asthma incidence.",
    badgeColor: "#2d8f68",
    badgeBg: "#e8f5ef"
  }
];

const PROTECTION_TIPS = [
  {
    tag: "N95",
    title: "Wear N95 or FFP2 mask",
    description: "High-filtration respirators reduce exposure when AQI is above 150. Cloth masks help much less against fine particles.",
    badgeColor: "#c5551e",
    badgeBg: "#fff0e6"
  },
  {
    tag: "HOME",
    title: "Stay indoors",
    description: "Keep windows closed during peak pollution hours and use recirculation mode in AC when outdoor air is visibly hazy.",
    badgeColor: "#1f5e9c",
    badgeBg: "#e8f0f7"
  },
  {
    tag: "PLANT",
    title: "Indoor air plants",
    description: "Spider plant, peace lily, and areca palm can support indoor air freshness alongside proper ventilation planning.",
    badgeColor: "#2d8f68",
    badgeBg: "#e8f5ef"
  },
  {
    tag: "ROUTE",
    title: "Avoid rush-hour routes",
    description: "Traffic raises roadside AQI sharply. Walk or exercise during cleaner windows such as early morning or later evening.",
    badgeColor: "#d9732f",
    badgeBg: "#fff0e6"
  },
  {
    tag: "WATER",
    title: "Stay well hydrated",
    description: "Adequate water intake helps the body recover from dry-air exposure and throat irritation caused by airborne pollutants.",
    badgeColor: "#1f5e9c",
    badgeBg: "#e8f0f7"
  },
  {
    tag: "AQI",
    title: "Track AQI daily",
    description: "Check AQI before planning travel, running, or outdoor work. Small day-to-day changes can matter for sensitive groups.",
    badgeColor: "#cc8a00",
    badgeBg: "#fff4da"
  },
  {
    tag: "DIET",
    title: "Antioxidant-rich diet",
    description: "Fruits, nuts, and leafy vegetables support recovery from oxidative stress linked to long-term pollution exposure.",
    badgeColor: "#d65a31",
    badgeBg: "#fbe8df"
  },
  {
    tag: "TREE",
    title: "Support green spaces",
    description: "Urban trees and green corridors can lower local particulate concentration and reduce roadside heat and dust.",
    badgeColor: "#2d8f68",
    badgeBg: "#e8f5ef"
  }
];

const FALLBACK_CITY_DETAILS = {
  Delhi: {
    condition: "Dust haze",
    temp: 28,
    humidity: 68,
    wind: "8.2 km/h",
    uv: 7,
    primaryPollutant: "PM2.5",
    weatherNote: "Sensitive groups should avoid prolonged afternoon exposure and keep indoor air circulation controlled.",
    pollutants: { pm25: 156, pm10: 224, no2: 68, o3: 82, co: 1.8, so2: 22 },
    forecast: [286, 312, 270, 249, 213, 256, 275]
  },
  Mumbai: {
    condition: "Humid haze",
    temp: 31,
    humidity: 76,
    wind: "12.1 km/h",
    uv: 8,
    primaryPollutant: "PM10",
    weatherNote: "Sea breeze improves dispersion later in the day, but roadside corridors remain moderately polluted.",
    pollutants: { pm25: 58, pm10: 96, no2: 34, o3: 61, co: 1.1, so2: 14 },
    forecast: [102, 108, 96, 92, 88, 93, 99]
  },
  Kolkata: {
    condition: "Warm haze",
    temp: 30,
    humidity: 72,
    wind: "10.8 km/h",
    uv: 8,
    primaryPollutant: "PM10",
    weatherNote: "Construction dust and traffic continue to push coarse particulate levels above safe limits.",
    pollutants: { pm25: 112, pm10: 165, no2: 52, o3: 74, co: 1.4, so2: 18 },
    forecast: [172, 184, 168, 151, 146, 154, 161]
  },
  Bangalore: {
    condition: "Light breeze",
    temp: 27,
    humidity: 61,
    wind: "9.1 km/h",
    uv: 7,
    primaryPollutant: "Ozone",
    weatherNote: "Overall air remains cleaner than northern cities, though midday ozone still deserves attention outdoors.",
    pollutants: { pm25: 28, pm10: 54, no2: 19, o3: 46, co: 0.8, so2: 8 },
    forecast: [68, 74, 66, 59, 54, 58, 63]
  },
  Jalandhar: {
    condition: "Dry smog",
    temp: 29,
    humidity: 64,
    wind: "11.2 km/h",
    uv: 7,
    primaryPollutant: "PM2.5",
    weatherNote: "Dry conditions and regional transport of particles keep health risk elevated across the day.",
    pollutants: { pm25: 131, pm10: 188, no2: 57, o3: 69, co: 1.5, so2: 21 },
    forecast: [191, 205, 182, 168, 159, 171, 180]
  },
  Chennai: {
    condition: "Coastal haze",
    temp: 32,
    humidity: 74,
    wind: "13.5 km/h",
    uv: 9,
    primaryPollutant: "Ozone",
    weatherNote: "Sunlight-driven ozone rises later in the day, so plan outdoor exercise for earlier hours if possible.",
    pollutants: { pm25: 42, pm10: 71, no2: 22, o3: 58, co: 0.9, so2: 10 },
    forecast: [78, 84, 73, 69, 65, 70, 74]
  }
};

const HOURLY_TEMPLATE = [
  0.76, 0.84, 0.92, 1.04, 1.11, 1.04, 0.97, 0.89,
  0.98, 1.05, 1.02, 0.96, 0.92, 0.89, 0.91, 0.95,
  1.0, 1.04, 1.02, 0.96, 0.9, 0.86, 0.93, 0.98
];

const HOURLY_LABELS = [
  "12am", "1am", "2am", "3am", "4am", "5am",
  "6am", "7am", "8am", "9am", "10am", "11am",
  "12pm", "1pm", "2pm", "3pm", "4pm", "5pm",
  "6pm", "7pm", "8pm", "9pm", "10pm", "11pm"
];

const state = {
  selectedCity: "Delhi",
  data: null
};

async function loadFallbackCsvText() {
  try {
    const response = await fetch("data/aqi_data.csv", { cache: "no-store" });
    if (!response.ok) {
      throw new Error("CSV request failed");
    }
    return await response.text();
  } catch (error) {
    return FALLBACK_CSV;
  }
}

async function fetchJson(url) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  return response.json();
}

function parseCsv(text) {
  const [headerLine, ...rows] = text.trim().split(/\r?\n/);
  const headers = headerLine.split(",");

  return rows.filter(Boolean).map((row) => {
    const values = row.split(",");
    const record = {};

    headers.forEach((header, index) => {
      record[header.trim()] = (values[index] || "").trim();
    });

    return {
      date: record.date,
      city: record.city,
      aqi: Number(record.aqi)
    };
  });
}

function getAqiLevel(aqi) {
  return AQI_LEVELS.find((level) => aqi <= level.max) || AQI_LEVELS[AQI_LEVELS.length - 1];
}

function getUniqueDates(records) {
  return [...new Set(records.map((record) => record.date))].sort();
}

function round(value, decimals = 0) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function average(values) {
  if (!values.length) {
    return 0;
  }
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function formatDay(dateString) {
  const date = new Date(`${dateString}T00:00:00`);
  return date.toLocaleDateString("en-IN", { weekday: "short" });
}

function formatDateTime(dateTime) {
  if (!dateTime) {
    return "--";
  }

  const [datePart, timePart = "00:00"] = dateTime.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hours, minutes] = timePart.split(":").map(Number);
  const localDate = new Date(year, month - 1, day, hours || 0, minutes || 0);

  return localDate.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  });
}

function formatHourLabel(dateTime) {
  const [, timePart = "00:00"] = dateTime.split("T");
  const hours = Number(timePart.split(":")[0]);
  const hour12 = hours % 12 || 12;
  const suffix = hours < 12 ? "am" : "pm";
  return `${hour12}${suffix}`;
}

function formatValue(value, decimals = 0) {
  return Number(value).toFixed(decimals);
}

function getLimitStatus(percent) {
  if (percent <= 80) {
    return { label: "Safe", color: "#2d8f68", bg: "#e8f5ef" };
  }
  if (percent <= 100) {
    return { label: "Near limit", color: "#cc8a00", bg: "#fff4da" };
  }
  if (percent <= 150) {
    return { label: "Exceeds limit", color: "#d65a31", bg: "#fbe8df" };
  }
  return { label: "Hazardous", color: "#9d2f7f", bg: "#f4e9f5" };
}

function buildFallbackHourlyTrend(aqi, cityIndex) {
  return HOURLY_TEMPLATE.map((factor, index) => {
    const modulation = Math.sin((index + 2 + cityIndex) / 2.3) * (5 + cityIndex);
    return Math.max(20, Math.round(aqi * factor + modulation));
  });
}

function buildAirQualityUrl(config) {
  const params = new URLSearchParams({
    latitude: config.latitude,
    longitude: config.longitude,
    current: AIR_QUALITY_FIELDS.join(","),
    hourly: AIR_QUALITY_FIELDS.join(","),
    past_days: "6",
    forecast_days: "7",
    timezone: "auto"
  });

  return `${AIR_QUALITY_API_URL}?${params.toString()}`;
}

function buildWeatherUrl(config) {
  const params = new URLSearchParams({
    latitude: config.latitude,
    longitude: config.longitude,
    current: WEATHER_CURRENT_FIELDS.join(","),
    daily: WEATHER_DAILY_FIELDS.join(","),
    timezone: "auto",
    forecast_days: "1"
  });

  return `${WEATHER_API_URL}?${params.toString()}`;
}

function normalizePollutantValue(key, rawValue) {
  const meta = POLLUTANT_META[key];
  const numericValue = Number(rawValue);

  if (!Number.isFinite(numericValue)) {
    return null;
  }

  const transformedValue = typeof meta.transform === "function"
    ? meta.transform(numericValue)
    : numericValue;

  return round(transformedValue, meta.displayDecimals || 0);
}

function buildDailyAverageEntries(times, values) {
  const buckets = new Map();

  times.forEach((time, index) => {
    const numericValue = Number(values[index]);

    if (!time || !Number.isFinite(numericValue)) {
      return;
    }

    const date = time.slice(0, 10);
    if (!buckets.has(date)) {
      buckets.set(date, []);
    }
    buckets.get(date).push(numericValue);
  });

  return [...buckets.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([date, samples]) => ({ date, value: average(samples) }));
}

function getTrailingAverage(key, values, endIndex) {
  const meta = POLLUTANT_META[key];
  const startIndex = Math.max(0, endIndex - meta.averageHours + 1);
  const samples = [];

  for (let index = startIndex; index <= endIndex; index += 1) {
    const normalized = normalizePollutantValue(key, values[index]);
    if (normalized != null) {
      samples.push(normalized);
    }
  }

  if (!samples.length) {
    return null;
  }

  return round(average(samples), meta.displayDecimals || 0);
}

function computeIndiaSubIndex(key, concentration) {
  if (!Number.isFinite(concentration)) {
    return null;
  }

  const breakpoints = INDIA_AQI_BREAKPOINTS[key] || [];

  for (const range of breakpoints) {
    if (concentration <= range.concHigh || !Number.isFinite(range.concHigh)) {
      if (!Number.isFinite(range.concHigh)) {
        return 500;
      }

      const aqiSpan = range.aqiHigh - range.aqiLow;
      const concentrationSpan = range.concHigh - range.concLow || 1;
      const subIndex = ((aqiSpan / concentrationSpan) * (concentration - range.concLow)) + range.aqiLow;
      return Math.max(range.aqiLow, Math.min(500, Math.round(subIndex)));
    }
  }

  return null;
}

function computeIndiaAqi(averages) {
  const subIndices = {};

  Object.keys(POLLUTANT_META).forEach((key) => {
    const subIndex = computeIndiaSubIndex(key, averages[key]);
    if (Number.isFinite(subIndex)) {
      subIndices[key] = subIndex;
    }
  });

  const ranked = Object.entries(subIndices).sort((left, right) => right[1] - left[1]);
  if (!ranked.length) {
    return {
      aqi: null,
      dominantPollutantKey: null,
      subIndices
    };
  }

  return {
    aqi: ranked[0][1],
    dominantPollutantKey: ranked[0][0],
    subIndices
  };
}

function findCurrentIndex(times, currentTime) {
  if (!times.length || !currentTime) {
    return times.length - 1;
  }

  const target = new Date(currentTime).getTime();
  let currentIndex = 0;

  times.forEach((time, index) => {
    const value = new Date(time).getTime();
    if (Number.isFinite(value) && value <= target) {
      currentIndex = index;
    }
  });

  return currentIndex;
}

function buildIndiaAqiSeries(hourly) {
  const times = hourly.time || [];

  if (!times.length) {
    return [];
  }

  return times.map((time, index) => {
    const averages = {};

    Object.keys(POLLUTANT_META).forEach((key) => {
      averages[key] = getTrailingAverage(key, hourly[POLLUTANT_META[key].apiKey] || [], index);
    });

    const aqiData = computeIndiaAqi(averages);
    if (!Number.isFinite(aqiData.aqi)) {
      return null;
    }

    return {
      time,
      date: time.slice(0, 10),
      aqi: aqiData.aqi,
      dominantPollutantKey: aqiData.dominantPollutantKey,
      subIndices: aqiData.subIndices
    };
  }).filter(Boolean);
}

function buildLiveHourlyTrend(series, currentTime, fallbackTrend) {
  if (!series.length) {
    return fallbackTrend;
  }

  const currentIndex = findCurrentIndex(
    series.map((point) => point.time),
    currentTime
  );
  const windowStart = Math.max(0, currentIndex - 23);
  const points = [];

  for (let index = windowStart; index <= currentIndex; index += 1) {
    const point = series[index];
    if (!point || !Number.isFinite(point.aqi)) {
      continue;
    }

    points.push({
      label: formatHourLabel(point.time),
      value: Math.round(point.aqi)
    });
  }

  if (points.length < 6) {
    return fallbackTrend;
  }

  return {
    labels: points.map((point) => point.label),
    values: points.map((point) => point.value)
  };
}

function buildWeeklyRecords(series, currentDate, fallbackRecords) {
  const recent = buildDailyAverageEntries(
    series.map((point) => point.time),
    series.map((point) => point.aqi)
  )
    .filter((entry) => entry.date <= currentDate)
    .slice(-7)
    .map((entry) => ({
      date: entry.date,
      aqi: Math.round(entry.value)
    }));

  return recent.length ? recent : fallbackRecords;
}

function buildForecastRecords(series, currentDate, fallbackRecords) {
  const dailyEntries = buildDailyAverageEntries(
    series.map((point) => point.time),
    series.map((point) => point.aqi)
  )
    .filter((entry) => entry.date >= currentDate)
    .slice(0, 7)
    .map((entry) => ({
      date: entry.date,
      aqi: Math.round(entry.value)
    }));

  return dailyEntries.length ? dailyEntries : fallbackRecords;
}

function getPreviousPollutantValue(key, times, values, currentDate, fallbackValue, currentValue) {
  const previousEntry = buildDailyAverageEntries(times, values)
    .filter((entry) => entry.date < currentDate)
    .at(-1);

  if (!previousEntry) {
    return currentValue ?? fallbackValue;
  }

  return normalizePollutantValue(key, previousEntry.value);
}

function getWeatherCondition(code) {
  const conditions = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Rime fog",
    51: "Light drizzle",
    53: "Drizzle",
    55: "Dense drizzle",
    61: "Light rain",
    63: "Rain",
    65: "Heavy rain",
    71: "Light snow",
    73: "Snow",
    75: "Heavy snow",
    80: "Rain showers",
    81: "Heavy showers",
    82: "Intense showers",
    95: "Thunderstorm"
  };

  return conditions[code] || "Local conditions";
}

function getPollutantKeyByLabel(label) {
  return Object.entries(POLLUTANT_META).find(([, meta]) => meta.label === label)?.[0] || "pm25";
}

function getPrimaryPollutantKey(subIndices, fallbackLabel) {
  const ranked = Object.entries(subIndices || {}).sort((left, right) => right[1] - left[1]);
  if (ranked.length) {
    return ranked[0][0];
  }
  return getPollutantKeyByLabel(fallbackLabel);
}

function buildWeatherSnapshot(weatherResponse, fallbackCity) {
  const current = weatherResponse?.current;
  const daily = weatherResponse?.daily;

  return {
    condition: Number.isFinite(current?.weather_code)
      ? getWeatherCondition(current.weather_code)
      : fallbackCity.condition,
    temp: Number.isFinite(current?.temperature_2m)
      ? Math.round(current.temperature_2m)
      : fallbackCity.temp,
    humidity: Number.isFinite(current?.relative_humidity_2m)
      ? Math.round(current.relative_humidity_2m)
      : fallbackCity.humidity,
    wind: Number.isFinite(current?.wind_speed_10m)
      ? `${round(current.wind_speed_10m, 1)} km/h`
      : fallbackCity.wind,
    uv: Number.isFinite(daily?.uv_index_max?.[0])
      ? round(daily.uv_index_max[0], 1)
      : fallbackCity.uv
  };
}

function buildWeatherNote(level, pollutantLabel) {
  return `${pollutantLabel} is the main driver right now. ${level.advice}`;
}

function buildFallbackDashboardData(text) {
  const records = parseCsv(text);
  const dates = getUniqueDates(records);
  const cityData = {};

  CITY_ORDER.forEach((city, cityIndex) => {
    const series = records
      .filter((record) => record.city === city)
      .sort((left, right) => left.date.localeCompare(right.date));
    const latestRecord = series[series.length - 1];
    const previousRecord = series[series.length - 2] || latestRecord;
    const details = FALLBACK_CITY_DETAILS[city];
    const latestDate = latestRecord?.date || dates[dates.length - 1];
    const forecastRecords = details.forecast.map((aqi, index) => {
      const forecastDate = new Date(`${latestDate}T00:00:00`);
      forecastDate.setDate(forecastDate.getDate() + index);
      return {
        date: forecastDate.toISOString().slice(0, 10),
        aqi
      };
    });

    const pollutantPrevious = Object.fromEntries(
      Object.keys(POLLUTANT_META).map((key) => {
        const currentValue = details.pollutants[key];
        const ratio = latestRecord?.aqi ? (previousRecord?.aqi || latestRecord.aqi) / latestRecord.aqi : 1;
        const previousValue = key === "co"
          ? round(currentValue * ratio, 1)
          : Math.round(currentValue * ratio);
        return [key, previousValue];
      })
    );

    cityData[city] = {
      city,
      currentAqi: latestRecord?.aqi || 0,
      currentTime: `${latestDate}T12:00`,
      timezone: "Asia/Kolkata",
      condition: details.condition,
      temp: details.temp,
      humidity: details.humidity,
      wind: details.wind,
      uv: details.uv,
      weatherNote: details.weatherNote,
      primaryPollutant: details.primaryPollutant,
      pollutants: { ...details.pollutants },
      pollutantPrevious,
      weeklyRecords: series.slice(-7),
      hourlyTrend: {
        labels: HOURLY_LABELS,
        values: buildFallbackHourlyTrend(latestRecord?.aqi || 0, cityIndex)
      },
      forecastRecords,
      source: "sample"
    };
  });

  return {
    cityData,
    latestRecords: CITY_ORDER.map((city) => ({
      city,
      aqi: cityData[city].currentAqi
    })),
    lastUpdated: `${dates[dates.length - 1]}T12:00`,
    sourceSummary: "Sample fallback data on the Indian AQI scale",
    liveCount: 0,
    totalCities: CITY_ORDER.length
  };
}

async function fetchCityLiveData(city, fallbackCity) {
  const config = CITY_CONFIG[city];
  const [airResult, weatherResult] = await Promise.allSettled([
    fetchJson(buildAirQualityUrl(config)),
    fetchJson(buildWeatherUrl(config))
  ]);

  if (airResult.status !== "fulfilled") {
    throw airResult.reason;
  }

  const airResponse = airResult.value;
  const weatherResponse = weatherResult.status === "fulfilled" ? weatherResult.value : null;
  const current = airResponse.current || {};
  const hourly = airResponse.hourly || {};
  const aqiSeries = buildIndiaAqiSeries(hourly);
  const currentTime = current.time || fallbackCity.currentTime;
  const currentDate = currentTime.slice(0, 10);
  const currentAqiIndex = findCurrentIndex(
    aqiSeries.map((point) => point.time),
    currentTime
  );
  const currentAqiPoint = aqiSeries[currentAqiIndex] || null;
  const pollutants = {};
  const pollutantPrevious = {};

  Object.keys(POLLUTANT_META).forEach((key) => {
    const meta = POLLUTANT_META[key];
    const currentValue = normalizePollutantValue(key, current[meta.apiKey]);
    pollutants[key] = currentValue ?? fallbackCity.pollutants[key];
    pollutantPrevious[key] = getPreviousPollutantValue(
      key,
      hourly.time || [],
      hourly[meta.apiKey] || [],
      currentDate,
      fallbackCity.pollutantPrevious[key],
      pollutants[key]
    );
  });

  const currentAqi = Number.isFinite(currentAqiPoint?.aqi)
    ? Math.round(currentAqiPoint.aqi)
    : fallbackCity.currentAqi;
  const primaryPollutantKey = getPrimaryPollutantKey(
    currentAqiPoint?.subIndices,
    fallbackCity.primaryPollutant
  );
  const level = getAqiLevel(currentAqi);
  const weather = buildWeatherSnapshot(weatherResponse, fallbackCity);

  return {
    city,
    currentAqi,
    currentTime,
    timezone: airResponse.timezone || weatherResponse?.timezone || fallbackCity.timezone,
    condition: weather.condition,
    temp: weather.temp,
    humidity: weather.humidity,
    wind: weather.wind,
    uv: weather.uv,
    weatherNote: buildWeatherNote(level, POLLUTANT_META[primaryPollutantKey].label),
    primaryPollutant: POLLUTANT_META[primaryPollutantKey].label,
    pollutants,
    pollutantPrevious,
    weeklyRecords: buildWeeklyRecords(
      aqiSeries,
      currentDate,
      fallbackCity.weeklyRecords
    ),
    hourlyTrend: buildLiveHourlyTrend(
      aqiSeries,
      currentTime,
      fallbackCity.hourlyTrend
    ),
    forecastRecords: buildForecastRecords(
      aqiSeries,
      currentDate,
      fallbackCity.forecastRecords
    ),
    source: "live"
  };
}

async function buildDashboardData(fallbackData) {
  const results = await Promise.allSettled(
    CITY_ORDER.map((city) => fetchCityLiveData(city, fallbackData.cityData[city]))
  );

  const cityData = {};
  let liveCount = 0;

  results.forEach((result, index) => {
    const city = CITY_ORDER[index];

    if (result.status === "fulfilled") {
      cityData[city] = result.value;
      liveCount += 1;
      return;
    }

    cityData[city] = fallbackData.cityData[city];
  });

  const currentTimes = CITY_ORDER
    .map((city) => cityData[city].currentTime)
    .filter(Boolean)
    .sort();

  let sourceSummary = "Sample fallback data";
  if (liveCount === CITY_ORDER.length) {
    sourceSummary = "Approx Indian AQI computed from Open-Meteo pollutant data";
  } else if (liveCount > 0) {
    sourceSummary = `Approx Indian AQI for ${liveCount}/${CITY_ORDER.length} cities - sample fallback for the rest`;
  }

  return {
    cityData,
    latestRecords: CITY_ORDER.map((city) => ({
      city,
      aqi: cityData[city].currentAqi
    })),
    lastUpdated: currentTimes[currentTimes.length - 1] || fallbackData.lastUpdated,
    sourceSummary,
    liveCount,
    totalCities: CITY_ORDER.length
  };
}

function getSelectedSnapshot() {
  const details = state.data.cityData[state.selectedCity];
  const level = getAqiLevel(details.currentAqi);
  const pollutants = Object.entries(POLLUTANT_META).map(([key, meta]) => {
    const current = details.pollutants[key];
    const previous = details.pollutantPrevious[key] ?? current;
    const change = previous ? ((current - previous) / previous) * 100 : 0;
    const percent = Math.round((current / meta.limit) * 100);
    const status = getLimitStatus(percent);

    return {
      key,
      ...meta,
      current,
      previous,
      change,
      percent,
      status
    };
  });

  return {
    city: state.selectedCity,
    details,
    level,
    latestRecord: { aqi: details.currentAqi },
    pollutants,
    hourlyTrend: details.hourlyTrend.values,
    hourlyLabels: details.hourlyTrend.labels,
    weeklyTrend: details.weeklyRecords.map((record) => record.aqi),
    weeklyLabels: details.weeklyRecords.map((record) => formatDay(record.date)),
    forecastRecords: details.forecastRecords
  };
}

function renderLastUpdated() {
  document.getElementById("last-updated").textContent = `Last Updated: ${formatDateTime(state.data.lastUpdated)} | ${state.data.sourceSummary}`;
}

function renderRefreshLabel() {
  const label = document.querySelector("#refresh-button span:last-child");

  if (state.data.liveCount === state.data.totalCities) {
    label.textContent = "Live - Updated now";
    return;
  }

  if (state.data.liveCount > 0) {
    label.textContent = "Live + fallback data";
    return;
  }

  label.textContent = "Sample fallback data";
}

function renderCityTabs() {
  const container = document.getElementById("city-tabs");
  container.innerHTML = state.data.latestRecords.map((record) => `
    <button type="button" class="city-tab ${record.city === state.selectedCity ? "active" : ""}" data-city="${record.city}">
      ${record.city}
    </button>
  `).join("");
}

function renderHero(snapshot) {
  const angle = Math.max(14, Math.min((snapshot.latestRecord.aqi / 500) * 360, 360));

  document.getElementById("hero-live-panel").innerHTML = `
    <div class="live-panel">
      <p class="live-panel-top">Live AQI - ${snapshot.city}</p>
      <div class="live-panel-grid">
        <div class="aqi-ring" style="--aqi-angle:${angle}deg; --aqi-color:${snapshot.level.color};">
          <div class="aqi-ring-inner">
            <div>
              <strong>${snapshot.latestRecord.aqi}</strong>
              <span>AQI</span>
            </div>
          </div>
        </div>
        <div class="live-copy">
          <p class="live-status-label">Air quality is</p>
          <h2 style="color:${snapshot.level.color}">${snapshot.level.label}</h2>
          <p>${snapshot.level.description}</p>
          <p class="live-advice">${snapshot.level.advice}</p>
        </div>
      </div>
      <div class="hero-meta-grid">
        <div class="hero-meta-item">
          <span>City</span>
          <strong>${snapshot.city}</strong>
        </div>
        <div class="hero-meta-item">
          <span>Primary pollutant</span>
          <strong>${snapshot.details.primaryPollutant}</strong>
        </div>
        <div class="hero-meta-item">
          <span>Humidity</span>
          <strong>${snapshot.details.humidity}%</strong>
        </div>
        <div class="hero-meta-item">
          <span>Temperature</span>
          <strong>${snapshot.details.temp}C</strong>
        </div>
      </div>
    </div>
  `;

  document.getElementById("weather-panel").innerHTML = `
    <div class="weather-card">
      <p class="weather-label">Weather snapshot</p>
      <div class="weather-main">
        <div class="weather-symbol">AQ</div>
        <div>
          <strong>${snapshot.details.temp}C</strong>
          <span>${snapshot.details.condition}</span>
        </div>
      </div>
      <div class="weather-grid">
        <div class="weather-stat">
          <span>Humidity</span>
          <strong>${snapshot.details.humidity}%</strong>
        </div>
        <div class="weather-stat">
          <span>Wind speed</span>
          <strong>${snapshot.details.wind}</strong>
        </div>
        <div class="weather-stat">
          <span>UV index</span>
          <strong>${snapshot.details.uv}</strong>
        </div>
        <div class="weather-stat">
          <span>Updated city</span>
          <strong>${snapshot.city}</strong>
        </div>
      </div>
      <p class="weather-note">${snapshot.details.weatherNote}</p>
    </div>
  `;
}

function formatSignedChange(change) {
  const sign = change >= 0 ? "+" : "";
  return `${sign}${change.toFixed(0)}%`;
}

function renderPollutantMetrics(snapshot) {
  const container = document.getElementById("pollutant-metrics");
  container.innerHTML = snapshot.pollutants.map((item) => `
    <article class="pollutant-card" style="--card-accent:${item.status.color}">
      <p class="pollutant-name">${item.label}</p>
      <p class="pollutant-reading">${formatValue(item.current, item.displayDecimals || 0)}<span> ${item.unit}</span></p>
      <p class="pollutant-limit">WHO limit: ${formatValue(item.limit, item.displayDecimals || 0)} ${item.unit}</p>
      <p class="pollutant-change"><strong>${formatSignedChange(item.change)}</strong> vs yesterday</p>
    </article>
  `).join("");
}

function buildLineChartSvg(values, labels, color) {
  if (!values.length) {
    return '<p class="panel-subtitle">Live trend data is unavailable right now.</p>';
  }

  const width = 980;
  const height = 360;
  const padding = { top: 20, right: 16, bottom: 48, left: 52 };
  const minValue = Math.max(0, Math.floor(Math.min(...values) / 20) * 20 - 20);
  const maxValue = Math.ceil(Math.max(...values) / 20) * 20 + 20;
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;
  const x = (index) => padding.left + (index * innerWidth) / Math.max(values.length - 1, 1);
  const y = (value) => height - padding.bottom - ((value - minValue) / (maxValue - minValue || 1)) * innerHeight;

  const ticks = 5;
  const gridLines = Array.from({ length: ticks + 1 }, (_, index) => {
    const value = minValue + ((maxValue - minValue) / ticks) * index;
    const yPosition = y(value);
    return `
      <line class="chart-grid-line" x1="${padding.left}" y1="${yPosition}" x2="${width - padding.right}" y2="${yPosition}"></line>
      <text class="chart-axis-label" x="${padding.left - 10}" y="${yPosition + 4}" text-anchor="end">${Math.round(value)}</text>
    `;
  }).join("");

  const visibleLabels = labels.map((label, index) => {
    if (index % 3 !== 0 && index !== labels.length - 1) {
      return "";
    }
    return `<text class="chart-axis-label" x="${x(index)}" y="${height - 16}" text-anchor="middle">${label}</text>`;
  }).join("");

  const linePoints = values.map((value, index) => `${x(index)},${y(value)}`).join(" ");
  const areaPoints = [
    `${padding.left},${height - padding.bottom}`,
    ...values.map((value, index) => `${x(index)},${y(value)}`),
    `${x(values.length - 1)},${height - padding.bottom}`
  ].join(" ");

  const dots = values.map((value, index) => {
    if (index % 3 !== 0 && index !== values.length - 1) {
      return "";
    }
    return `<circle class="chart-dot" cx="${x(index)}" cy="${y(value)}" r="5" stroke="${color}"></circle>`;
  }).join("");

  return `
    <svg class="chart-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="Line chart">
      ${gridLines}
      <polygon class="chart-area" points="${areaPoints}" style="fill:${color}22;"></polygon>
      <polyline class="chart-line" points="${linePoints}" style="stroke:${color};"></polyline>
      ${dots}
      ${visibleLabels}
    </svg>
  `;
}

function buildBarChartSvg(values, labels, color) {
  if (!values.length) {
    return '<p class="panel-subtitle">Daily AQI data is unavailable right now.</p>';
  }

  const width = 520;
  const height = 360;
  const padding = { top: 16, right: 16, bottom: 54, left: 46 };
  const maxValue = Math.ceil(Math.max(...values) / 20) * 20 + 20;
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;
  const barGap = 16;
  const barWidth = (innerWidth - barGap * (values.length - 1)) / values.length;
  const y = (value) => height - padding.bottom - (value / (maxValue || 1)) * innerHeight;

  const ticks = 5;
  const gridLines = Array.from({ length: ticks + 1 }, (_, index) => {
    const value = (maxValue / ticks) * index;
    const yPosition = y(value);
    return `
      <line class="chart-grid-line" x1="${padding.left}" y1="${yPosition}" x2="${width - padding.right}" y2="${yPosition}"></line>
      <text class="chart-axis-label" x="${padding.left - 10}" y="${yPosition + 4}" text-anchor="end">${Math.round(value)}</text>
    `;
  }).join("");

  const maxBarValue = Math.max(...values);
  const bars = values.map((value, index) => {
    const x = padding.left + index * (barWidth + barGap);
    const barHeight = height - padding.bottom - y(value);
    const fill = value === maxBarValue ? "#c5551e" : color;
    return `
      <rect x="${x}" y="${y(value)}" width="${barWidth}" height="${barHeight}" rx="10" fill="${fill}"></rect>
      <text class="chart-axis-label" x="${x + barWidth / 2}" y="${height - 18}" text-anchor="middle">${labels[index]}</text>
    `;
  }).join("");

  return `
    <svg class="chart-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="Bar chart">
      ${gridLines}
      ${bars}
    </svg>
  `;
}

function buildWhoChartSvg(items) {
  if (!items.length) {
    return '<p class="panel-subtitle">Pollutant comparison data is unavailable right now.</p>';
  }

  const width = 1180;
  const height = 320;
  const padding = { top: 20, right: 16, bottom: 58, left: 52 };
  const chartValues = items.flatMap((item) => {
    const multiplier = item.chartMultiplier || 1;
    return [item.current * multiplier, item.limit * multiplier];
  });
  const maxValue = Math.ceil(Math.max(...chartValues) / 25) * 25 + 25;
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;
  const groupWidth = innerWidth / items.length;
  const barWidth = Math.min(46, (groupWidth - 18) / 2);
  const y = (value) => height - padding.bottom - (value / (maxValue || 1)) * innerHeight;

  const ticks = 5;
  const gridLines = Array.from({ length: ticks + 1 }, (_, index) => {
    const value = (maxValue / ticks) * index;
    const yPosition = y(value);
    return `
      <line class="chart-grid-line" x1="${padding.left}" y1="${yPosition}" x2="${width - padding.right}" y2="${yPosition}"></line>
      <text class="chart-axis-label" x="${padding.left - 10}" y="${yPosition + 4}" text-anchor="end">${Math.round(value)}</text>
    `;
  }).join("");

  const groups = items.map((item, index) => {
    const multiplier = item.chartMultiplier || 1;
    const currentValue = item.current * multiplier;
    const limitValue = item.limit * multiplier;
    const startX = padding.left + index * groupWidth + (groupWidth - barWidth * 2 - 10) / 2;
    const currentHeight = height - padding.bottom - y(currentValue);
    const limitHeight = height - padding.bottom - y(limitValue);
    return `
      <rect x="${startX}" y="${y(currentValue)}" width="${barWidth}" height="${currentHeight}" rx="8" fill="${item.status.color}"></rect>
      <rect class="bar-limit" x="${startX + barWidth + 10}" y="${y(limitValue)}" width="${barWidth}" height="${limitHeight}" rx="8"></rect>
      <text class="chart-axis-label" x="${startX + barWidth}" y="${height - 18}" text-anchor="middle">${item.chartLabel || item.label}</text>
    `;
  }).join("");

  return `
    <svg class="chart-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="Current levels versus WHO limits">
      ${gridLines}
      ${groups}
    </svg>
  `;
}

function renderCharts(snapshot) {
  document.getElementById("hourly-chart").innerHTML = buildLineChartSvg(
    snapshot.hourlyTrend,
    snapshot.hourlyLabels,
    snapshot.level.color
  );

  document.getElementById("weekly-chart").innerHTML = buildBarChartSvg(
    snapshot.weeklyTrend,
    snapshot.weeklyLabels,
    "#1f5e9c"
  );

  document.getElementById("who-chart").innerHTML = buildWhoChartSvg(snapshot.pollutants);
}

function renderScale(snapshot) {
  const position = Math.min(100, (snapshot.latestRecord.aqi / 500) * 100);
  const scale = document.getElementById("aqi-scale-panel");
  document.getElementById("current-band-label").textContent = `Current: ${snapshot.latestRecord.aqi} - ${snapshot.level.label}`;
  document.getElementById("current-band-label").style.color = snapshot.level.color;

  scale.innerHTML = `
    <div class="scale-bar-wrap">
      <div class="scale-marker" style="left:${position}%;">
        <div class="scale-marker-value">${snapshot.latestRecord.aqi}</div>
        <div class="scale-marker-arrow"></div>
      </div>
      <div class="scale-bar"></div>
      <div class="scale-labels">
        <span>0</span>
        <span>50</span>
        <span>100</span>
        <span>200</span>
        <span>300</span>
        <span>400</span>
        <span>500</span>
      </div>
      <div class="scale-legend">
        <span class="scale-legend-item"><span class="scale-swatch" style="background:#2d8f68;"></span>Good (0-50)</span>
        <span class="scale-legend-item"><span class="scale-swatch" style="background:#cc8a00;"></span>Satisfactory (51-100)</span>
        <span class="scale-legend-item"><span class="scale-swatch" style="background:#f1a64a;"></span>Moderately polluted (101-200)</span>
        <span class="scale-legend-item"><span class="scale-swatch" style="background:#d65a31;"></span>Poor (201-300)</span>
        <span class="scale-legend-item"><span class="scale-swatch" style="background:#9d2f7f;"></span>Very poor (301-400)</span>
        <span class="scale-legend-item"><span class="scale-swatch" style="background:#7b1f27;"></span>Severe (401-500)</span>
      </div>
    </div>
  `;
}

function renderPollutantTable(snapshot) {
  const tbody = document.getElementById("pollutant-table-body");
  tbody.innerHTML = snapshot.pollutants.map((item) => `
    <tr>
      <td>
        <div class="pollutant-title">${item.label}</div>
        <div class="pollutant-description">${item.description}</div>
      </td>
      <td>
        <span class="value-chip" style="color:${item.status.color};">${formatValue(item.current, item.displayDecimals || 0)} ${item.unit}</span>
      </td>
      <td>${formatValue(item.limit, item.displayDecimals || 0)} ${item.unit}</td>
      <td>
        <span class="status-chip" style="--chip-bg:${item.status.bg}; --chip-color:${item.status.color};">${item.status.label}</span>
      </td>
      <td>
        <div class="progress-row">
          <div class="progress-track">
            <div class="progress-fill" style="--fill-color:${item.status.color}; width:${Math.min(item.percent, 100)}%;"></div>
          </div>
          <span>${item.percent}%</span>
        </div>
      </td>
      <td>${item.source}</td>
    </tr>
  `).join("");
}

function renderCityComparison() {
  const grid = document.getElementById("city-comparison-grid");
  grid.innerHTML = state.data.latestRecords.map((record) => {
    const level = getAqiLevel(record.aqi);
    return `
      <article class="city-card ${record.city === state.selectedCity ? "active" : ""}" data-city="${record.city}" style="--card-color:${level.color};">
        <h3>${record.city}</h3>
        <strong>${record.aqi}</strong>
        <span>${level.label}</span>
      </article>
    `;
  }).join("");
}

function renderForecast(snapshot) {
  const values = snapshot.forecastRecords;
  const peakValue = Math.max(...values.map((record) => record.aqi));

  document.getElementById("forecast-grid").innerHTML = values.map((record) => {
    const level = getAqiLevel(record.aqi);
    const isPeak = record.aqi === peakValue;
    return `
      <article class="forecast-card ${isPeak ? "peak" : ""}">
        <span class="forecast-day">${formatDay(record.date).toUpperCase()}</span>
        <span class="forecast-icon">${record.aqi >= 401 ? "ALRT" : "AQI"}</span>
        <p class="forecast-value" style="color:${level.color};">${record.aqi}</p>
        <span class="forecast-label">${level.shortLabel}</span>
      </article>
    `;
  }).join("");
}

function renderInfoCards(containerId, items) {
  document.getElementById(containerId).innerHTML = items.map((item) => `
    <article class="info-card">
      <div class="info-badge" style="--badge-bg:${item.badgeBg}; --badge-color:${item.badgeColor};">${item.tag}</div>
      <h3>${item.title}</h3>
      <p>${item.description}</p>
    </article>
  `).join("");
}

function renderAll() {
  if (!state.data.latestRecords.some((record) => record.city === state.selectedCity)) {
    state.selectedCity = state.data.latestRecords[0].city;
  }

  const snapshot = getSelectedSnapshot();
  renderLastUpdated();
  renderRefreshLabel();
  renderCityTabs();
  renderHero(snapshot);
  renderPollutantMetrics(snapshot);
  renderCharts(snapshot);
  renderScale(snapshot);
  renderPollutantTable(snapshot);
  renderCityComparison();
  renderForecast(snapshot);
}

async function refreshData() {
  const fallbackText = await loadFallbackCsvText();
  const fallbackData = buildFallbackDashboardData(fallbackText);

  try {
    state.data = await buildDashboardData(fallbackData);
  } catch (error) {
    console.error("Live AQI refresh failed. Showing fallback data instead.", error);
    state.data = {
      ...fallbackData,
      sourceSummary: "Live API unavailable - showing sample fallback data on the Indian AQI scale"
    };
  }

  renderAll();
}

function attachEvents() {
  document.getElementById("refresh-button").addEventListener("click", async () => {
    const button = document.getElementById("refresh-button");
    const label = button.querySelector("span:last-child");
    button.disabled = true;
    label.textContent = "Refreshing...";
    await refreshData();
    button.disabled = false;
  });

  document.getElementById("city-tabs").addEventListener("click", (event) => {
    const button = event.target.closest("[data-city]");
    if (!button) {
      return;
    }
    state.selectedCity = button.dataset.city;
    renderAll();
  });

  document.getElementById("city-comparison-grid").addEventListener("click", (event) => {
    const card = event.target.closest("[data-city]");
    if (!card) {
      return;
    }
    state.selectedCity = card.dataset.city;
    renderAll();
  });
}

async function init() {
  renderInfoCards("health-impact-grid", HEALTH_IMPACTS);
  renderInfoCards("protection-grid", PROTECTION_TIPS);
  attachEvents();
  await refreshData();
}

init();

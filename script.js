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

const AQI_LEVELS = [
  {
    max: 50,
    label: "Good",
    shortLabel: "Good",
    color: "#2d8f68",
    description: "Air quality is satisfactory and the risk to most people is low.",
    advice: "Outdoor activities are generally safe and natural ventilation is fine."
  },
  {
    max: 100,
    label: "Moderate",
    shortLabel: "Moderate",
    color: "#cc8a00",
    description: "Air quality is acceptable, but sensitive groups may feel discomfort.",
    advice: "Take short breaks from prolonged outdoor activity if you have breathing issues."
  },
  {
    max: 150,
    label: "Unhealthy for Sensitive Groups",
    shortLabel: "Sensitive",
    color: "#f1a64a",
    description: "Children, older adults, and people with asthma should be more careful.",
    advice: "Limit long outdoor exercise and use a mask near high traffic corridors."
  },
  {
    max: 200,
    label: "Unhealthy",
    shortLabel: "Unhealthy",
    color: "#d65a31",
    description: "Health effects become more likely for the general public.",
    advice: "Avoid heavy outdoor exertion and shift workouts indoors when possible."
  },
  {
    max: 300,
    label: "Very Unhealthy",
    shortLabel: "Very",
    color: "#9d2f7f",
    description: "Health warnings of emergency conditions. Everyone can be affected.",
    advice: "Stay indoors when possible, keep windows shut, and wear a high-filtration mask outside."
  },
  {
    max: Infinity,
    label: "Hazardous",
    shortLabel: "Hazardous",
    color: "#7b1f27",
    description: "This level creates serious health risks for the whole population.",
    advice: "Avoid all unnecessary outdoor exposure and use indoor air cleaning if available."
  }
];

const POLLUTANT_META = {
  pm25: {
    label: "PM2.5",
    description: "Fine particles (< 2.5 um)",
    limit: 35,
    unit: "ug/m3",
    source: "Vehicle exhaust, industry, open burning"
  },
  pm10: {
    label: "PM10",
    description: "Coarse particles (< 10 um)",
    limit: 150,
    unit: "ug/m3",
    source: "Road dust, construction, soil disturbance"
  },
  no2: {
    label: "NO2",
    description: "Nitrogen dioxide",
    limit: 40,
    unit: "ug/m3",
    source: "Traffic, generators, thermal power plants"
  },
  o3: {
    label: "Ozone",
    description: "Ground-level ozone",
    limit: 100,
    unit: "ug/m3",
    source: "Sunlight-driven reaction of NOx and VOCs"
  },
  co: {
    label: "CO",
    description: "Carbon monoxide",
    limit: 10,
    unit: "mg/m3",
    chartLabel: "CO x10",
    chartMultiplier: 10,
    source: "Incomplete combustion, vehicles, diesel sets"
  },
  so2: {
    label: "SO2",
    description: "Sulfur dioxide",
    limit: 20,
    unit: "ug/m3",
    source: "Coal combustion, refineries, industrial fuel"
  }
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

const CITY_DETAILS = {
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
  csvText: FALLBACK_CSV,
  data: null
};

async function loadCsvText() {
  try {
    const response = await fetch("data/aqi_data.csv");
    if (!response.ok) {
      throw new Error("CSV request failed");
    }
    return await response.text();
  } catch (error) {
    return FALLBACK_CSV;
  }
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
  return AQI_LEVELS.find((level) => aqi <= level.max);
}

function getUniqueDates(records) {
  return [...new Set(records.map((record) => record.date))].sort();
}

function buildDashboardData(records) {
  const dates = getUniqueDates(records);
  const recordMap = new Map(records.map((record) => [`${record.city}|${record.date}`, record]));
  const citySeries = {};

  CITY_ORDER.forEach((city) => {
    citySeries[city] = dates
      .map((date) => recordMap.get(`${city}|${date}`))
      .filter(Boolean);
  });

  const latestDate = dates[dates.length - 1];
  const latestRecords = CITY_ORDER
    .map((city) => recordMap.get(`${city}|${latestDate}`))
    .filter(Boolean);

  return {
    dates,
    latestDate,
    citySeries,
    latestRecords
  };
}

function pad(value) {
  return String(value).padStart(2, "0");
}

function formatLastUpdated(date) {
  return `Last Updated: ${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())} (Local Time)`;
}

function formatDay(dateString) {
  const date = new Date(`${dateString}T00:00:00`);
  return date.toLocaleDateString("en-IN", { weekday: "short" });
}

function round(value, decimals = 0) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
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

function buildHourlyTrend(aqi, cityIndex) {
  return HOURLY_TEMPLATE.map((factor, index) => {
    const modulation = Math.sin((index + 2 + cityIndex) / 2.3) * (5 + cityIndex);
    return Math.max(20, Math.round(aqi * factor + modulation));
  });
}

function getSelectedSnapshot() {
  const city = state.selectedCity;
  const series = state.data.citySeries[city] || [];
  const latestRecord = series[series.length - 1];
  const previousRecord = series[series.length - 2] || latestRecord;
  const details = CITY_DETAILS[city];
  const level = getAqiLevel(latestRecord.aqi);
  const pollutants = Object.entries(POLLUTANT_META).map(([key, meta]) => {
    const current = details.pollutants[key];
    const previousValue = latestRecord.aqi ? current * (previousRecord.aqi / latestRecord.aqi) : current;
    const previous = meta.unit === "mg/m3" ? round(previousValue, 1) : Math.round(previousValue);
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
    city,
    details,
    level,
    latestRecord,
    pollutants,
    hourlyTrend: buildHourlyTrend(latestRecord.aqi, CITY_ORDER.indexOf(city)),
    weeklyTrend: series.map((record) => record.aqi)
  };
}

function renderLastUpdated() {
  document.getElementById("last-updated").textContent = formatLastUpdated(new Date());
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
      <p class="pollutant-reading">${item.current}<span> ${item.unit}</span></p>
      <p class="pollutant-limit">WHO limit: ${item.limit} ${item.unit}</p>
      <p class="pollutant-change"><strong>${formatSignedChange(item.change)}</strong> vs yesterday</p>
    </article>
  `).join("");
}

function buildLineChartSvg(values, labels, color) {
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
    HOURLY_LABELS,
    snapshot.level.color
  );

  document.getElementById("weekly-chart").innerHTML = buildBarChartSvg(
    snapshot.weeklyTrend,
    state.data.citySeries[snapshot.city].map((record) => formatDay(record.date)),
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
        <span>150</span>
        <span>200</span>
        <span>300</span>
        <span>500</span>
      </div>
      <div class="scale-legend">
        <span class="scale-legend-item"><span class="scale-swatch" style="background:#2d8f68;"></span>Good (0-50)</span>
        <span class="scale-legend-item"><span class="scale-swatch" style="background:#cc8a00;"></span>Moderate (51-100)</span>
        <span class="scale-legend-item"><span class="scale-swatch" style="background:#f1a64a;"></span>Sensitive (101-150)</span>
        <span class="scale-legend-item"><span class="scale-swatch" style="background:#d65a31;"></span>Unhealthy (151-200)</span>
        <span class="scale-legend-item"><span class="scale-swatch" style="background:#9d2f7f;"></span>Very unhealthy (201-300)</span>
        <span class="scale-legend-item"><span class="scale-swatch" style="background:#7b1f27;"></span>Hazardous (301-500)</span>
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
        <span class="value-chip" style="color:${item.status.color};">${item.current} ${item.unit}</span>
      </td>
      <td>${item.limit} ${item.unit}</td>
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
  const startDate = new Date(`${state.data.latestDate}T00:00:00`);
  document.getElementById("forecast-grid").innerHTML = snapshot.details.forecast.map((value, index) => {
    const forecastDate = new Date(startDate);
    forecastDate.setDate(startDate.getDate() + index);
    const level = getAqiLevel(value);
    const isPeak = value === Math.max(...snapshot.details.forecast);
    return `
      <article class="forecast-card ${isPeak ? "peak" : ""}">
        <span class="forecast-day">${forecastDate.toLocaleDateString("en-IN", { weekday: "short" }).toUpperCase()}</span>
        <span class="forecast-icon">${value >= 300 ? "ALRT" : "AQI"}</span>
        <p class="forecast-value" style="color:${level.color};">${value}</p>
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
  state.csvText = await loadCsvText();
  state.data = buildDashboardData(parseCsv(state.csvText));
  renderAll();
}

function attachEvents() {
  document.getElementById("refresh-button").addEventListener("click", async () => {
    const button = document.getElementById("refresh-button");
    button.disabled = true;
    button.querySelector("span:last-child").textContent = "Refreshing...";
    await refreshData();
    button.querySelector("span:last-child").textContent = "Live - Updated now";
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

const API_BASE_URL = "https://api.data.gov.in/resource/3b01bcb8-0b14-4abf-b6f2-c1bfd384ba69";

const CITY_MAP = [
  { key: "delhi", frontendCity: "Delhi", apiCity: "Delhi", apiState: "Delhi", aliases: [] },
  { key: "mumbai", frontendCity: "Mumbai", apiCity: "Mumbai", apiState: "Maharashtra", aliases: [] },
  { key: "kolkata", frontendCity: "Kolkata", apiCity: "Kolkata", apiState: "West Bengal", aliases: ["calcutta"] },
  { key: "bangalore", frontendCity: "Bangalore", apiCity: "Bengaluru", apiState: "Karnataka", aliases: ["bengaluru"] },
  { key: "jalandhar", frontendCity: "Jalandhar", apiCity: "Jalandhar", apiState: "Punjab", aliases: [] },
  { key: "chennai", frontendCity: "Chennai", apiCity: "Chennai", apiState: "Tamil Nadu", aliases: ["madras"] }
];

const SUPPORTED_POLLUTANTS = ["PM2.5", "PM10", "NO2", "SO2", "CO", "OZONE", "NH3"];

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: buildCorsHeaders(env) });
    }

    const url = new URL(request.url);

    if (url.pathname === "/" || url.pathname === "/health") {
      return jsonResponse(
        {
          ok: true,
          service: "airwatch-aqi-proxy",
          source: "data.gov.in real-time AQI dataset",
          endpoints: [
            "/cities",
            "/aqi?city=Delhi"
          ]
        },
        env
      );
    }

    if (url.pathname === "/cities") {
      return jsonResponse(
        {
          cities: CITY_MAP.map((city) => ({
            city: city.frontendCity,
            state: city.apiState,
            apiCity: city.apiCity
          }))
        },
        env
      );
    }

    if (url.pathname !== "/aqi") {
      return jsonResponse({ error: "Not found" }, env, 404);
    }

    if (!env.DATA_GOV_API_KEY) {
      return jsonResponse(
        { error: "Missing DATA_GOV_API_KEY secret" },
        env,
        500
      );
    }

    const cityQuery = url.searchParams.get("city");
    const cityConfig = resolveCity(cityQuery);

    if (!cityConfig) {
      return jsonResponse(
        {
          error: "Unsupported city",
          supportedCities: CITY_MAP.map((city) => city.frontendCity)
        },
        env,
        400
      );
    }

    try {
      const payload = await fetchCityPayload(cityConfig, env.DATA_GOV_API_KEY);
      return jsonResponse(payload, env);
    } catch (error) {
      return jsonResponse(
        {
          error: "Failed to fetch official AQI data",
          detail: error.message
        },
        env,
        502
      );
    }
  }
};

async function fetchCityPayload(cityConfig, apiKey) {
  const params = new URLSearchParams({
    "api-key": apiKey,
    format: "json",
    limit: "200",
    offset: "0"
  });

  params.set("filters[state]", toFilterValue(cityConfig.apiState));
  params.set("filters[city]", toFilterValue(cityConfig.apiCity));

  const response = await fetch(`${API_BASE_URL}?${params.toString()}`, {
    headers: {
      Accept: "application/json"
    }
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`data.gov.in returned ${response.status}: ${detail}`);
  }

  const data = await response.json();
  const records = Array.isArray(data.records) ? data.records.map(normalizeRecord) : [];

  return {
    source: "data.gov.in",
    datasetId: "3b01bcb8-0b14-4abf-b6f2-c1bfd384ba69",
    city: cityConfig.frontendCity,
    state: cityConfig.apiState,
    fetchedAt: new Date().toISOString(),
    recordCount: records.length,
    summary: summarizeRecords(records),
    latestRecords: selectLatestRecords(records),
    records
  };
}

function buildCorsHeaders(env) {
  return {
    "Access-Control-Allow-Origin": env.FRONTEND_ORIGIN || "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
}

function jsonResponse(body, env, status = 200) {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...buildCorsHeaders(env)
    }
  });
}

function normalizeLookup(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function resolveCity(input) {
  const lookup = normalizeLookup(input);
  if (!lookup) {
    return null;
  }

  return CITY_MAP.find((city) => {
    if (normalizeLookup(city.frontendCity) === lookup) {
      return true;
    }

    if (normalizeLookup(city.apiCity) === lookup) {
      return true;
    }

    return city.aliases.some((alias) => normalizeLookup(alias) === lookup);
  }) || null;
}

function toFilterValue(value) {
  return String(value).replace(/\s+/g, "_");
}

function normalizeRecord(record) {
  const pollutant = String(record.pollutant_id || "").toUpperCase();
  return {
    id: record.id,
    country: record.country,
    state: record.state,
    city: record.city,
    station: record.station,
    lastUpdateRaw: record.last_update,
    lastUpdateIso: toIsoTimestamp(record.last_update),
    pollutantId: pollutant,
    pollutantMin: toNumber(record.min_value),
    pollutantMax: toNumber(record.max_value),
    pollutantAvg: toNumber(record.avg_value),
    pollutantUnit: record.pollutant_unit || null
  };
}

function summarizeRecords(records) {
  if (!records.length) {
    return {
      lastUpdateIso: null,
      stations: [],
      pollutants: {}
    };
  }

  const latestRecords = selectLatestRecords(records);
  const stationSet = new Set(latestRecords.map((record) => record.station).filter(Boolean));
  const pollutantSummary = {};

  for (const pollutant of SUPPORTED_POLLUTANTS) {
    const matches = latestRecords.filter((record) => record.pollutantId === pollutant);
    if (!matches.length) {
      continue;
    }

    const values = matches
      .map((record) => record.pollutantAvg)
      .filter((value) => Number.isFinite(value));

    if (!values.length) {
      continue;
    }

    pollutantSummary[pollutant] = {
      stationCount: matches.length,
      avg: round(average(values), 2),
      min: round(Math.min(...values), 2),
      max: round(Math.max(...values), 2),
      unit: matches[0].pollutantUnit
    };
  }

  return {
    lastUpdateIso: latestRecords[0]?.lastUpdateIso || null,
    lastUpdateRaw: latestRecords[0]?.lastUpdateRaw || null,
    stations: [...stationSet].sort(),
    pollutants: pollutantSummary
  };
}

function selectLatestRecords(records) {
  if (!records.length) {
    return [];
  }

  let latestTime = 0;
  for (const record of records) {
    const timestamp = Date.parse(record.lastUpdateIso || "");
    if (Number.isFinite(timestamp) && timestamp > latestTime) {
      latestTime = timestamp;
    }
  }

  return records.filter((record) => Date.parse(record.lastUpdateIso || "") === latestTime);
}

function toIsoTimestamp(value) {
  const match = String(value || "").match(/^(\d{2})-(\d{2})-(\d{4}) (\d{2}):(\d{2}):(\d{2})$/);
  if (!match) {
    return null;
  }

  const [, day, month, year, hour, minute, second] = match;
  const date = new Date(Date.UTC(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    Number(second)
  ));

  return date.toISOString();
}

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function average(values) {
  if (!values.length) {
    return 0;
  }
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function round(value, decimals = 0) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

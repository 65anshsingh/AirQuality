# Air Pollution Awareness Dashboard

This is a simplified dashboard project built with HTML, CSS, and JavaScript.

## Step-by-step workflow

1. Store pre-collected AQI data in `data/aqi_data.csv`.
2. Read the CSV in `script.js`.
3. Convert the raw rows into usable JavaScript objects.
4. Calculate daily averages, pollutant averages, and highest-risk cities.
5. Show the results using summary cards, a trend chart, and a table.
6. Add AQI health descriptions so users understand the meaning of each level.

## Project files

- `index.html` builds the page structure.
- `styles.css` controls the visual design and responsive layout.
- `script.js` loads the CSV, processes the data, and renders the dashboard.
- `data/aqi_data.csv` contains the sample air pollution data.

## Run locally

Use a simple local server so the browser can read the CSV file.

```powershell
python -m http.server 8000
```

Then open `http://localhost:8000` in your browser.

## Publish on GitHub Pages

1. Create an empty GitHub repository.
2. Push this project to the `main` branch of that repository.
3. In GitHub, open `Settings -> Pages`.
4. Set the source to `GitHub Actions`.
5. After the workflow finishes, the site will be available on your GitHub Pages URL.

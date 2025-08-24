const apiKey = "LOtNye1wqJIdZtnAqZX0fciNULCzO4xSbUFDV6Zj";
const url = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}`;

async function getAPOD() {
  try {
    const response = await fetch(url);
    const data = await response.json();

    document.getElementById("title").textContent = data.title;
    document.getElementById("description").textContent = data.explanation;
    document.getElementById("date").textContent = data.date;

    if (data.media_type === "image") {
      document.getElementById("image").src = data.url;
    } else {
      document.getElementById("image").style.display = "none";
      document.getElementById("description").innerHTML = 
        `Hoy es un video: <a href="${data.url}" target="_blank">Ver aquí</a>`;
    }
  } catch (error) {
    console.error("Error al obtener la Foto del Día:", error);
  }
}

// ========================
// 🚀 Explorador de Asteroides
// ========================
const startDate = "2025-08-20"; // Cambia la fecha si quieres
const endDate = "2025-08-24";
const asteroidURL = `https://api.nasa.gov/neo/rest/v1/feed?start_date=${startDate}&end_date=${endDate}&api_key=${apiKey}`;

async function getAsteroids() {
  try {
    const response = await fetch(asteroidURL);
    const data = await response.json();

    const asteroidData = data.near_earth_objects;
    const tableBody = document.getElementById("asteroid-body");
    tableBody.innerHTML = ""; // Limpiar tabla

    // Recorrer cada fecha
    for (let date in asteroidData) {
      asteroidData[date].forEach(asteroid => {
        const row = document.createElement("tr");

        // Nombre
        const name = document.createElement("td");
        name.textContent = asteroid.name;

        // Fecha
        const fecha = document.createElement("td");
        fecha.textContent = date;

        // Diámetro estimado (metros)
        const diameter = document.createElement("td");
        const diaMin = asteroid.estimated_diameter.meters.estimated_diameter_min.toFixed(0);
        const diaMax = asteroid.estimated_diameter.meters.estimated_diameter_max.toFixed(0);
        diameter.textContent = `${diaMin} - ${diaMax}`;

        // Velocidad (km/h)
        const velocity = document.createElement("td");
        const vel = asteroid.close_approach_data[0].relative_velocity.kilometers_per_hour;
        velocity.textContent = parseFloat(vel).toFixed(0);

        // Distancia (km)
        const distance = document.createElement("td");
        const dist = asteroid.close_approach_data[0].miss_distance.kilometers;
        distance.textContent = parseFloat(dist).toFixed(0);

        // Insertar celdas
        row.appendChild(name);
        row.appendChild(fecha);
        row.appendChild(diameter);
        row.appendChild(velocity);
        row.appendChild(distance);

        tableBody.appendChild(row);
      });
    }
  } catch (error) {
    console.error("Error al obtener asteroides:", error);
  }
}

getAsteroids();
getAPOD();

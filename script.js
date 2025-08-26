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


// ------------------
// 🚀 Explorador de Asteroides
// ------------------
async function getAsteroids(startDate, endDate) {
    const asteroidURL = `https://api.nasa.gov/neo/rest/v1/feed?start_date=${startDate}&end_date=${endDate}&api_key=${apiKey}`;
    const response = await fetch(asteroidURL);
    const data = await response.json();
    return data.near_earth_objects;
}
// Renderizar asteroides en tabla
async function updateAsteroids() {
    const startDate = document.getElementById("startDate").value || "2025-08-20";
    const endDate = document.getElementById("endDate").value || "2025-08-24";
    const search = document.getElementById("searchInput").value.toLowerCase();
    const dangerOnly = document.getElementById("dangerOnly").checked;

    const asteroidData = await getAsteroids(startDate, endDate);
    const tableBody = document.getElementById("asteroid-body");
    tableBody.innerHTML = "";

    let peligrosos = 0,
        seguros = 0;

    let rows = []; // aquí guardamos todas las filas

    for (let date in asteroidData) {
        asteroidData[date].forEach(asteroid => {
            const name = asteroid.name.toLowerCase();

            if (search && !name.includes(search)) return;
            if (dangerOnly && !asteroid.is_potentially_hazardous_asteroid) return;

            const row = document.createElement("tr");

            // Nombre (clickeable)
            const tdName = document.createElement("td");
            tdName.classList.add("asteroid-name");

            if (asteroid.is_potentially_hazardous_asteroid) {
                tdName.classList.add("danger");
                tdName.innerHTML = `<a href="#">${asteroid.name}</a>`;
            } else {
                tdName.classList.add("safe");
                tdName.innerHTML = `<a href="#">${asteroid.name}</a>`;
            }

            tdName.querySelector("a").addEventListener("click", (e) => {
                e.preventDefault();
                openModal(asteroid);
            });

            const tdFecha = document.createElement("td");
            tdFecha.textContent = date;

            const tdDiameter = document.createElement("td");
            const diaMin = asteroid.estimated_diameter.meters.estimated_diameter_min.toFixed(0);
            const diaMax = asteroid.estimated_diameter.meters.estimated_diameter_max.toFixed(0);
            tdDiameter.textContent = `${diaMin} - ${diaMax}`;

            const tdVelocity = document.createElement("td");
            const vel = asteroid.close_approach_data[0].relative_velocity.kilometers_per_hour;
            tdVelocity.textContent = parseFloat(vel).toFixed(0);

            const tdDistance = document.createElement("td");
            const dist = asteroid.close_approach_data[0].miss_distance.kilometers;
            tdDistance.textContent = parseFloat(dist).toFixed(0);

            if (asteroid.is_potentially_hazardous_asteroid) {
                row.classList.add("danger");
                peligrosos++;
            } else {
                row.classList.add("safe");
                seguros++;
            }

            row.appendChild(tdName);
            row.appendChild(tdFecha);
            row.appendChild(tdDiameter);
            row.appendChild(tdVelocity);
            row.appendChild(tdDistance);

            rows.push(row); // guardamos la fila en el arreglo
        });
    }

    // Mostrar solo las primeras 5
    rows.slice(0, 5).forEach(r => tableBody.appendChild(r));

    // Si hay más de 5, mostrar el botón
    const verMasBtn = document.getElementById("verMas");
    if (rows.length > 5) {
        verMasBtn.style.display = "block";
        verMasBtn.onclick = () => {
            rows.slice(5).forEach(r => tableBody.appendChild(r)); // mostrar las demás
            verMasBtn.style.display = "none"; // ocultar botón
        };
    } else {
        verMasBtn.style.display = "none";
    }

    renderAsteroidChart(peligrosos, seguros);
}


// ------------------
// 📊 Gráfico con Chart.js
// ------------------
function renderAsteroidChart(peligrosos, seguros) {
    const ctx = document.getElementById('asteroidChart').getContext('2d');
    if (window.asteroidChartInstance) {
        window.asteroidChartInstance.destroy();
    }
    window.asteroidChartInstance = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Peligrosos ⚠️', 'Seguros ✅'],
            datasets: [{
                data: [peligrosos, seguros],
                backgroundColor: ['#ff1744', '#00e676']
            }]
        }
    });
}


// ------------------
// 📌 Modal de detalles
// ------------------
function openModal(asteroid) {
    document.getElementById("modalName").textContent = asteroid.name;
    document.getElementById("modalMagnitude").textContent = asteroid.absolute_magnitude_h;
    document.getElementById("modalOrbit").textContent = asteroid.orbital_data ? asteroid.orbital_data.orbit_id : "N/A";
    document.getElementById("modalLink").href = asteroid.nasa_jpl_url;

    document.getElementById("modal").style.display = "block";
}

document.getElementById("closeModal").onclick = () => {
    document.getElementById("modal").style.display = "none";
};

updateAsteroids();

getAsteroids();
getAPOD();
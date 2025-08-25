const apiKey = "LOtNye1wqJIdZtnAqZX0fciNULCzO4xSbUFDV6Zj";
const url = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}`;

const LIBRE_TRANSLATE_URL = "https://translate.argosopentech.com/translate"; // Nuevo servidor

async function traducirTexto(texto, idiomaDestino = "es") {
    try {
        const response = await fetch(LIBRE_TRANSLATE_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                q: texto,
                source: "en",
                target: idiomaDestino,
                format: "text"
            })
        });

        const data = await response.json();
        return data.translatedText;
    } catch (error) {
        console.error("Error al traducir:", error);
        return texto;
    }
}


async function getAPOD() {
    try {
        const response = await fetch(url);
        const data = await response.json();

        const tituloTraducido = await traducirTexto(data.title);
        const descripcionTraducida = await traducirTexto(data.explanation);

        document.getElementById("title").textContent = tituloTraducido;
        document.getElementById("description").textContent = descripcionTraducida;
        document.getElementById("date").textContent = data.date;

        if (data.media_type === "image") {
            document.getElementById("image").src = data.url;
            document.getElementById("image").style.display = "block";
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
let allAsteroids = []; // Guardará todos los asteroides descargados
let currentIndex = 0; // Controla cuántos se han mostrado
const itemsPerPage = 5;

async function getAsteroids() {
    try {
        const response = await fetch(asteroidURL);
        const data = await response.json();

        const asteroidData = data.near_earth_objects;

        // Guardar todo en un arreglo plano
        allAsteroids = [];
        for (let date in asteroidData) {
            asteroidData[date].forEach(asteroid => {
                allAsteroids.push({
                    name: asteroid.name,
                    date: date,
                    diaMin: asteroid.estimated_diameter.meters.estimated_diameter_min.toFixed(0),
                    diaMax: asteroid.estimated_diameter.meters.estimated_diameter_max.toFixed(0),
                    vel: parseFloat(asteroid.close_approach_data[0].relative_velocity.kilometers_per_hour).toFixed(0),
                    dist: parseFloat(asteroid.close_approach_data[0].miss_distance.kilometers).toFixed(0)
                });
            });
        }

        // Limpiar tabla antes de cargar los primeros
        document.getElementById("asteroid-body").innerHTML = "";
        currentIndex = 0;
        renderAsteroids(); // Mostrar primeros 5
    } catch (error) {
        console.error("Error al obtener asteroides:", error);
    }
}

// Renderiza de 5 en 5
function renderAsteroids() {
    const tableBody = document.getElementById("asteroid-body");
    const slice = allAsteroids.slice(currentIndex, currentIndex + itemsPerPage);

    slice.forEach(a => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${a.name}</td>
            <td>${a.date}</td>
            <td>${a.diaMin} - ${a.diaMax}</td>
            <td>${a.vel}</td>
            <td>${a.dist}</td>
        `;
        tableBody.appendChild(row);
    });

    currentIndex += itemsPerPage;

    // Ocultar el botón si ya no hay más
    if (currentIndex >= allAsteroids.length) {
        document.getElementById("loadMore").style.display = "none";
    } else {
        document.getElementById("loadMore").style.display = "block";
    }
}

// Evento para el botón +
document.getElementById("loadMore").addEventListener("click", renderAsteroids);

// Inicializar
getAsteroids();
getAPOD();
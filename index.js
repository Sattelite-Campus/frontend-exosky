import {renderPlanet} from "./src/planetRendering.js";
import {createControls} from "./src/orbitControls.js";
import {setupButtons} from "./src/controlRendering.js";
import {showScreenshotArea} from "./src/screenshotHandling.js";


const url = new URL(window.location.href);  // Get the full URL

const params = new URLSearchParams(url.search);  // Parse query string

const planetKey = params.get("key");  // Get the planet key
console.log(planetKey)

// //fetch planet name
// fetch ("", {
//     method: "GET",
//     headers: {
//         "Content-Type": "application/json"
//
//     }
// })
//
// //fetch planet data from planet name
// fetch ("", {
//     method: "GET",
//     headers: {
//         "Content-Type": "application/json"
//
//     }
// })

document.addEventListener("DOMContentLoaded", () => {
    setupButtons();  // Initialize the buttons
    // You can also call the rendering function here
    // renderPlanet("Data\\star_data3.json");
    renderPlanet(planetKey);
    // renderPlanet(1920);
});
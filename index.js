import {renderPlanet} from "./src/planetRendering.js";
import {createControls} from "./src/orbitControls.js";
import {setupButtons} from "./src/controlRendering.js";

const path = window.location.pathname;

const pathSegments = path.split('/');

const planetName = pathSegments[1];

console.log(planetName);

var currentPlanet;
// //fetch planet name
fetch("/render?index=" + planetName, {
    method: "GET",
    headers: {
        "Content-Type": "application/json"
    }
})
    .then(r => {
        return r.json();
    })
    .then(data => {
        console.log(data);
        currentPlanet = data;
    })
    .catch(error => {
        console.error('Error:', error);
    });

document.addEventListener("DOMContentLoaded", () => {
    setupButtons();  // Initialize the buttons

    // remember to replace with data
    renderPlanet("Data\\star_data2.json");
});
import {renderPlanet} from "./src/planetRendering.js";
import {createControls} from "./src/orbitControls.js";
import {exitButton} from "./src/renderUI.js";
import {setupButtons} from "./src/controlRendering.js";

document.addEventListener("DOMContentLoaded", () => {
    setupButtons();  // Initialize the buttons

    // You can also call the rendering function here
    renderPlanet("Data\\star_data2.json");
});
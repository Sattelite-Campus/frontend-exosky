import {renderPlanet} from "./src/planetRendering.js";
import {createControls} from "./src/orbitControls.js";
import {setupButtons} from "./src/controlRendering.js";

document.addEventListener("DOMContentLoaded", () => {
    setupButtons();  // Initialize the buttons

    // You can also call the rendering function here
    renderPlanet("Data\\star_data_real.json");
});
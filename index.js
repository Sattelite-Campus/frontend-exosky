import {renderPlanet} from "./src/planetRendering.js";
import {createControls} from "./src/orbitControls.js";
import {exitButton} from "./src/renderUI.js";

document.addEventListener("DOMContentLoaded", () => {

    const startButton = document.getElementById("start");
    const stopButton = document.getElementById("stop");
    const resetButton = document.getElementById("reset");
    const toggleButton = document.getElementById("clmode");

    startButton.addEventListener("click", () => {
        console.log("Start");
    });

    stopButton.addEventListener("click", () => {
        console.log("Stop");
    });

    resetButton.addEventListener("click", () => {
        console.log("Reset");
    });

    toggleButton.addEventListener("click", () => {
        console.log("Toggle");
    });
});

renderPlanet("Data\\star_data2.json");
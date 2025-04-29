export const startButton = document.getElementById("start");
export const stopButton = document.getElementById("stop");
export const resetButton = document.getElementById("reset");
export const toggleButton = document.getElementById("clmode");

export const constellationModeDiv = document.getElementById("constellation-mode");
export const brightnessSlider = document.getElementById("brightness");
export const saveButton = document.getElementById("save");
export const exitButton = document.getElementById("exit");

export const showCameraButton = document.getElementById("show-camera");
export const screenshotButton = document.getElementById("screenshot");
export const showStoryButton = document.getElementById("show-story");
export const showDetailsButton = document.getElementById("show-details");

export const showColourButton = document.getElementById("show-colour");

export function setupButtons() {

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
        console.log("Toggle Constellation Maker");
    });

    brightnessSlider.addEventListener("input", (event) => {
        const brightnessValue = event.target.value;
        console.log("Brightness set to:", brightnessValue);
        // Add code to adjust starfield brightness based on slider value
    });

    // Handle save button click
    saveButton.addEventListener("click", () => {
        console.log("Settings saved.");
        // Add code to save brightness settings or other configurations
    });

    // Handle exit button click
    exitButton.addEventListener("click", () => {
        console.log("Exiting Constellation Mode.");
    });
}

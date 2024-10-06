export function setupButtons() {
    const startButton = document.getElementById("start");
    const stopButton = document.getElementById("stop");
    const resetButton = document.getElementById("reset");
    const toggleButton = document.getElementById("clmode");

    const constellationModeDiv = document.getElementById("constellation-mode");
    const brightnessSlider = document.getElementById("brightness");
    const saveButton = document.getElementById("save");
    const exitButton = document.getElementById("exit");

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
        if (constellationModeDiv.style.display === "none") {
            constellationModeDiv.style.display = "block";
        } else {
            constellationModeDiv.style.display = "none";
        }
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
        constellationModeDiv.style.display = "none";  // Hide the dropdown
    });
}

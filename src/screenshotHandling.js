//functions for screenshotting the DOM and saving it

import html2canvas from "html2canvas";
import {screenshotButton, showCameraButton} from "./controlRendering.js";

// Takes a screenshot of the DOM and downloads it as a .png file
export function takeScreenshot(renderer) {
    const width = 400;  // Width of the screenshot area
    const height = 300;  // Height of the screenshot area

    // Get the actual position and size of the Three.js canvas
    const rect = renderer.domElement.getBoundingClientRect();

    // Calculate the correct cropping coordinates relative to the canvas
    const x = (rect.width - width) / 2;
    const y = (rect.height - height) / 2;

    // Create an off-screen canvas to draw the cropped area
    const offScreenCanvas = document.createElement('canvas');
    offScreenCanvas.width = width;
    offScreenCanvas.height = height;
    const offScreenContext = offScreenCanvas.getContext('2d');

    // Draw the cropped area of the Three.js canvas onto the off-screen canvas
    offScreenContext.drawImage(
        renderer.domElement,  // The source canvas
        x + rect.left,  // Start cropping at the correct x coordinate
        y + rect.top,   // Start cropping at the correct y coordinate
        width, height,  // Crop width and height
        0, 0,  // Position to draw on the off-screen canvas
        width, height  // Size of the output
    );

    // Convert the off-screen canvas to a data URL and trigger download
    const dataURL = offScreenCanvas.toDataURL();
    const link = document.createElement('a');
    link.download = 'screenshot.png';
    link.href = dataURL;
    link.click();
}

//draw rectangle in middle of screen showing what gets screenshotted
export function showScreenshotArea() {
    const width = 400;
    const height = 300;
    const x = (window.innerWidth - width) / 2;
    const y = (window.innerHeight - height) / 2;

    const div = document.createElement('div');
    div.className = 'screenshot-area';  // Add a specific class
    //add active classname to button
    screenshotButton.classList.add('active');
    div.style.position = 'absolute';
    div.style.left = x + 'px';
    div.style.top = y + 'px';
    div.style.width = width + 'px';
    div.style.height = height + 'px';
    div.style.border = '2px solid red';
    document.body.appendChild(div);
}

export function hideScreenshotArea() {
    const div = document.querySelector('.screenshot-area');  // Select by class
    //remove active classname from button
    screenshotButton.classList.remove('active');
    if (div) {
        console.log(div);
        div.remove();
    }
}

var screenshotAreaVisible = false;

showCameraButton.addEventListener("click", () => {
    console.log(screenshotAreaVisible);
    if (!screenshotAreaVisible) {
        showScreenshotArea();
        screenshotAreaVisible = true;
    } else {
        hideScreenshotArea();
        screenshotAreaVisible = false;
    }
});
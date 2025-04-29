//functions for screenshotting the DOM and saving it
import { marked } from 'marked'; // markdown stuff
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

    const dataURL = offScreenCanvas.toDataURL('image/png');

// You can use this data URL directly as an image source in HTML:
    const img = document.createElement('img');
    img.src = dataURL;
    console.log(dataURL);

    const storyBoard = document.getElementById('constellation-story');
    storyBoard.innerHTML = `<p>Loading Constellation Story</p>`;

    offScreenCanvas.toBlob((blob) => {
        // Call a function to send this Blob to the backend server
        sendScreenshotToBackend(blob);
    });
}

function sendScreenshotToBackend(blob) {
    const formData = new FormData();
    formData.append('file', blob, 'screenshot.png');

    fetch('/api/upload', {
        method: 'POST',
        body: formData,
        mode: 'cors',  // Use 'cors' to handle the response
        headers: {
            'Accept': 'application/json',
            'Access-Control-Allow-Origin': '*'
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Image uploaded successfully:', data);
        })
        .catch(error => {
            console.error('Error uploading image:', error);
        });

    fetch('/api/generate_image_location', {
        method: 'GET',
        mode: 'cors',  // This allows handling of the response if the server supports it
        headers: {
            'Accept': 'application/json',
            'Access-Control-Allow-Origin': '*'
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            const storyBoard = document.getElementById('constellation-story');
            console.log('Generated text:', data.message);
            // Use this line to convert markdown to HTML before setting it to the innerHTML
            const parsedMessage = marked(data.message);
            storyBoard.innerHTML = `<p>${parsedMessage}</p>`;

        })
        .catch(error => {
            console.error('Error generating text:', error);
        });


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

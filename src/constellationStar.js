import * as THREE from "three";
import * as Buttons from "./controlRendering.js";

let const_stars = [];
let new_const_lines = [];
let new_const_stars = [];
let const_array = [];

// Create a new clickable constellation star
export function createConstellationStar(scene, x, y, z, radius) {

    var geometry = new THREE.SphereGeometry(radius, 32, 32);  // Creates a sphere with the given radius
    var material = new THREE.MeshBasicMaterial({
        color: 0xff5555,
        transparent: true,
        opacity: 0,  // Transparency for the sphere
        depthWrite: false  // Disable depth write so the sphere is always rendered on top
    });

    var sphere = new THREE.Mesh(geometry, material);
    sphere.position.set(x, y, z);  // Set the position of the sphere
    scene.add(sphere);  // Add the sphere to the scene
    const_stars.push(sphere);    
}

export function buildConst(scene, camera, drawLineBetweenStars) {

    const_stars.forEach(star => {
        star.material.color.set(0xff5555);
        star.material.opacity = 0.5;
    });
    // event listener for mouse clicks
    window.addEventListener('click', (event) => onLeftClick(event, camera, drawLineBetweenStars), false);
    window.addEventListener('contextmenu', () => onRightClick(scene)) // contextmenu <=> right-click
    Buttons.saveButton.addEventListener('click', () => saveConst(camera));
    Buttons.exitButton.addEventListener('click', () => exitConstMode(scene));

}

function onLeftClick(event, camera, drawLineBetweenStars) {

    // Raycaster and mouse for detecting clicks
    var raycaster = new THREE.Raycaster();
    raycaster.params.Points.threshold = 60;
    var mouse = new THREE.Vector2();

    // Convert mouse position to normalized device coordinates (-1 to +1)
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Update the raycaster with the mouse position and the camera
    raycaster.setFromCamera(mouse, camera);

    // Check for intersections between the ray and the objects in the scene
    var intersects = raycaster.intersectObjects(const_stars);
    
    if (intersects.length > 0) {
        new_const_stars.push(intersects[0].object);
        const length = new_const_stars.length - 1;
        new_const_stars[length].material.color.set(0x55ff00); // Change color of most recent halo to yellow
        new_const_stars[length].translateZ(1); // Bring to front
        if (new_const_stars.length >= 2) { // If there are more than 2 stars selected
            new_const_stars[length - 1].material.color.set(0x00ff00); // Turn the previous yellow halo green
            new_const_stars[length - 1].translateZ(1); // Bring to front
            drawLineBetweenStars(
                new_const_stars[new_const_stars.length - 1].position, 
                new_const_stars[new_const_stars.length - 2].position, 
                new THREE.LineBasicMaterial({
                    color: 0xFFFFFF,
                    opacity: 0.5,
                    transparent: true,
                    linewidth: 2
                }),
                new_const_lines
            );
        } 
    }

}

function onRightClick(scene) {
    
    // Remove last star object and set color back to red
    const star = new_const_stars.pop();
    star?.material.color.set(0xff5555);

    if (new_const_lines.length > 0) {
        scene.remove(new_const_lines.pop()); // Remove line from constallation and scene
    }

    // If there's a star remaining, make it's halo yellow
    const length = new_const_stars.length;
    if (length > 1) {
        new_const_stars[length - 1].material.color.set(0x00ff00);
    }
}

function exitConstMode(scene) {
    // Disable Bright Star Halo's
    const_stars.forEach(star => {
        star.material.opacity = 0;
    });
    while(new_const_lines.length > 0) {
        scene.remove(new_const_lines.pop());
    }
    new_const_stars = [];
    window.removeEventListener('click', (event) => onLeftClick(event, camera, drawLineBetweenStars), false);
    window.removeEventListener('contextmenu', () => onRightClick(scene));
}

function saveConst() {

    // Save new const to array
    const_array.push[new_const_lines];

    // Empty new const data
    new_const_lines = [];
    new_const_stars = [];

    // Leave Const/ Mode
    exitConstMode();
}

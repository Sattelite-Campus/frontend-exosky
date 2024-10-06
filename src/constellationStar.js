import * as THREE from "three";
import { brightnessSlider } from "./controlRendering";

let const_stars = [];
let new_const_lines = [];
let new_const_stars = [];
let const_array = [];

// Create a new clickable constellation star - params: x, y, z, radius
export function compileStarData(starData) {

    starData.forEach(star => {
        var geometry = new THREE.SphereGeometry(20, 32, 32);  // Creates a sphere with the given radius
        var material = new THREE.MeshBasicMaterial({
            color: new THREE.Color(1, .5, .5),
            transparent: true,
            opacity: 0,  // Transparency for the sphere
            depthWrite: false  // Disable depth write so the sphere is always rendered on top
        });
    
        var starObj = new THREE.Mesh(geometry, material);
        starObj.position.set(star.pos.x, star.pos.y, star.pos.z);  // Set the position of the sphere
        const_stars.push(starObj);
    });
    return const_stars;
}

export function showStars() {
    // Show Star Halo's
    const_stars.forEach(star => {
        star.material.color.setRGB(1,.5,.5);
        star.material.opacity = 0.5;
    });

}

export function hideStars() {
    // Disable Star Halo's
    const_stars.forEach(star => {
        star.material.color.setRGB(1,.5,.5);
        star.material.opacity = 0;
    });
}

export function onLeftClick(event, camera, drawLineBetweenStars) {

    // Raycaster and mouse for detecting clicks
    var raycaster = new THREE.Raycaster();
    var mouse = new THREE.Vector2();

    // Convert mouse position to normalized device coordinates (-1 to +1)
    
    mouse.x = (event.offsetX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Update the raycaster with the mouse position and the camera
    raycaster.setFromCamera(mouse, camera);

    // Check for intersections between the ray and the objects in the scene
    var intersects = raycaster.intersectObjects(const_stars);
    console.log(intersects);
    
    if (intersects.length > 0) {
        new_const_stars.push(intersects[0].object);
        const length = new_const_stars.length;
        new_const_stars[length - 1].material.color.setRGB(1,1,0); // Change color of most recent halo to yellow
        if (new_const_stars.length >= 2) { // If there are more than 2 stars selected
            new_const_stars[length - 2].material.color.setRGB(0,1,0); // Turn the previous yellow halo green
            drawLineBetweenStars(
                new_const_stars[length - 1].position, 
                new_const_stars[length - 2].position, 
                new THREE.LineBasicMaterial({
                    color: 0xFFFFFF,
                    opacity: 1,
                    transparent: true,
                    linewidth: brightnessSlider.value
                }),
                new_const_lines
            );
        } 
    }
    console.log();
    
}

export function onRightClick(scene) {
    
    // Remove last star object and set color back to red
    const star = new_const_stars.pop();
    star?.material.color.setRGB(1, .5, .5);

    if (new_const_lines.length > 0) {
        scene.remove(new_const_lines.pop()); // Remove line from constallation and scene
    }

    // If there's a star remaining, make it's halo yellow
    const length = new_const_stars.length;
    if (length >= 1) {
        new_const_stars[length - 1].material.color.setRGB(1,1,0);
    }
}

export function saveConst() {

    // Save new const to array
    const_array.push[new_const_lines];

    // Empty temp arrays
    new_const_lines = [];
    new_const_stars = [];

    // Reset Halo's
    const_stars.forEach(star => {
        star.material.color.setRGB(1,.5,.5);
    });
}

export function resetConstMaker(scene) {

    // Remove unsaved constelation lines from Scene
    while(new_const_lines.length > 0) {
        scene.remove(new_const_lines.pop());
    }

    // Empty temp arrays
    new_const_lines = [];
    new_const_stars = [];
}


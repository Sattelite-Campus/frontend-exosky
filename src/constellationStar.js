import * as THREE from "three";

let const_stars = [];
let new_const_lines = [];
let new_const_stars = [];
let const_array = [];

// Create a new clickable constellation star
export function createConstellationStar(scene, x, y, z, radius) {

    var geometry = new THREE.SphereGeometry(radius, 32, 32);  // Creates a sphere with the given radius
    var material = new THREE.MeshBasicMaterial({
        color: new THREE.Color(1, .5, .5),
        transparent: true,
        opacity: 0,  // Transparency for the sphere
        depthWrite: false  // Disable depth write so the sphere is always rendered on top
    });

    var sphere = new THREE.Mesh(geometry, material);
    sphere.position.set(x, y, z);  // Set the position of the sphere
    scene.add(sphere);  // Add the sphere to the scene
    const_stars.push(sphere);
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
            console.log("What");
            
            new_const_stars[length - 2].material.color.setRGB(0,1,0); // Turn the previous yellow halo green
            drawLineBetweenStars(
                new_const_stars[length - 1].position, 
                new_const_stars[length - 2].position, 
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
    console.log();
    
}

export function getConstStars() {
    return const_stars;
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

export function showConstMaker() {
    // Show Star Halo's
    const_stars.forEach(star => {
        star.material.color.setRGB(1,.5,.5);
        star.material.opacity = 0.5;
    });

}

export function hideConstMaker() {
    // Disable Star Halo's
    const_stars.forEach(star => {
        star.material.color.setRGB(1,.5,.5);
        star.material.opacity = 0;
    });
}

export function resetConstMaker(scene) {
    // Remove unsaved constelation lines from Scene
    while(new_const_lines.length > 0) {
        scene.remove(new_const_lines.pop());
    }

    new_const_lines = [];
    new_const_stars = [];
}

export function saveConst() {

    // Save new const to array
    const_array.push[new_const_lines];

    // Empty new const data
    new_const_lines = [];
    new_const_stars = [];

    const_stars.forEach(star => {
        star.material.color.setRGB(1,.5,.5);
    });
}

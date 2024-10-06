import * as THREE from "three";

let const_stars = [];
let new_const_lines = [];
let new_const_stars = [];
let const_array = [];
export function createConstellationStar(scene, camera, x, y, z, radius) {

    var geometry = new THREE.SphereGeometry(radius, 32, 32);  // Creates a sphere with the given radius
    var material = new THREE.MeshBasicMaterial({
        color: 0xffff00,
        transparent: true,
        opacity: 0.5,  // Transparency for the sphere
        depthWrite: false  // Disable depth write so the sphere is always rendered on top
    });

    var sphere = new THREE.Mesh(geometry, material);
    sphere.position.set(x, y, z);  // Set the position of the sphere
    scene.add(sphere);  // Add the sphere to the scene
    const_stars.push(sphere);    
}


export function buildConst(scene, camera, drawLineBetweenStars) {
    // Raycaster and mouse for detecting clicks
    var raycaster = new THREE.Raycaster();
    var mouse = new THREE.Vector2();

    // event listener for mouse clicks
    window.addEventListener('click', onClick, false);
    window.addEventListener('contextmenu', onRightClick) // contextmenu <=> right-click

    function onClick(event) {
        // Convert mouse position to normalized device coordinates (-1 to +1)
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        // Update the raycaster with the mouse position and the camera
        raycaster.setFromCamera(mouse, camera);

        // Check for intersections between the ray and the objects in the scene
        var intersects = raycaster.intersectObjects(const_stars);
        
        if (intersects.length > 0) {
            console.log('Sphere clicked!');
            intersects[0].object.material.color.set(0xff0000); // Change color to red when clicked
            new_const_stars.push(intersects[0].object)
            if (new_const_stars.length >= 2) {
                console.log(new_const_stars);
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

    function onRightClick(event) {
        if (new_const_stars.length == 0) {
            // Exit Constelation Mode on right click with no selected stars
            window.removeEventListener('click', onClick, false);
            window.removeEventListener('contextmenu', onRightClick);
            return;
        }
        const star = new_const_stars.pop(); // Remove last star object
        console.log("Lines: ", new_const_lines);
        
        if (new_const_lines.length > 0) {
            const line = new_const_lines.pop();
            console.log("Line: ", line);
            
            scene.remove(line);
        }
        console.log(new_const_stars);
        console.log(new_const_lines);
    }
}

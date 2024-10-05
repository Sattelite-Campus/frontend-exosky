import * as THREE from "three";


export function createConstellationStar(scene, camera, x, y, z, radius) {
// make a random sphere mesh and make it clickable
    var geometry = new THREE.SphereGeometry(radius + 10, 32, 32);
    var material = new THREE.MeshBasicMaterial({
        color: 0xffff00,
        opacity: 0.5
    });
    var sphere = new THREE.Mesh(geometry, material);
    sphere.position.set(x, y, z);
    scene.add(sphere); // Ensure sphere is added to the scene so raycasting can detect it

// Raycaster and mouse for detecting clicks
    var raycaster = new THREE.Raycaster();
    var mouse = new THREE.Vector2();

// Event listener for mouse clicks
    window.addEventListener('click', onClick, false);

    function onClick(event) {
        // Convert mouse position to normalized device coordinates (-1 to +1)
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        // Update the raycaster with the mouse position and the camera
        raycaster.setFromCamera(mouse, camera);

        // Check for intersections between the ray and the objects in the scene
        var intersects = raycaster.intersectObjects(scene.children);

        if (intersects.length > 0) {
            // Check if the clicked object is the sphere
            if (intersects[0].object === sphere) {
                console.log('Sphere clicked!');
                sphere.material.color.set(0xff0000); // Change color to red when clicked
            }
        }
    }
}
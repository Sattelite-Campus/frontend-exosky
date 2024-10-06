import * as THREE from "three";

export function createConstellationStar(scene, camera, x, y, z, radius) {

    var geometry = new THREE.SphereGeometry(radius+5, 32, 32);  // Creates a sphere with the given radius

    var material = new THREE.MeshBasicMaterial({
        color: 0xffff00,
        transparent: true,
        opacity: 0.5,  // Transparency for the sphere
        depthWrite: false  // Disable depth write so the sphere is always rendered on top
    });

    var sphere = new THREE.Mesh(geometry, material);
    sphere.position.set(x, y, z);  // Set the position of the sphere
    scene.add(sphere);  // Add the sphere to the scene

    // Raycaster and mouse for detecting clicks
    var raycaster = new THREE.Raycaster();
    var mouse = new THREE.Vector2();

    // event listener for mouse clicks
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
            else {
                console.log('Sphere not clicked!');
            }
        }
    }
}

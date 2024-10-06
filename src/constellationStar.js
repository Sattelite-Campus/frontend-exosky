import * as THREE from "three";


export function createConstellationStar(scene, camera, x, y, z, radius) {
    // Create the point geometry with a single vertex at the desired position
    var geometry = new THREE.BufferGeometry();
    var position = new Float32Array([x, y, z]);
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(position, radius*3));

    // Create a PointsMaterial for rendering the point (adjust size for visibility)
    var material = new THREE.PointsMaterial({
        color: 0xffff00,
        size: radius,   // The size of the point (radius can control how large it looks)
        transparent: true,
        opacity: 0.5,   // Transparency for the point
    });

    // Create the point object using Points
    var point = new THREE.Points(geometry, material);
    scene.add(point);  // Add the point to the scene

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
            if (intersects[0].object === point) {
                console.log('Sphere clicked!');
                point.material.color.set(0xff0000); // Change color to red when clicked
            }
        }
    }
}
import * as THREE from 'three';

// Create the main scene and the second scene
var scene = new THREE.Scene();
var scene2 = new THREE.Scene();

// Set up the camera
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 15000);
camera.position.set(0, 0, 1000);

// Set up the WebGL renderer
var renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Ambient light
var ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

renderer.setClearColor(0x000000);  // Set background to black

// Animate and render the active scene
function animate() {
    requestAnimationFrame(animate);
    renderer.render(activeScene, camera);
}
animate();

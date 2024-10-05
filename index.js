import * as THREE from 'three';
import { setupSceneChange } from "./src/sceneChange.js";
import { createControls } from "./src/orbitControls.js";

// Create the main scene and the second scene
var scene = new THREE.Scene();
var scene2 = new THREE.Scene();

// Set up the camera
var camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 15000);
camera.position.set(0, 0, 0);

// Set up the WebGL renderer
var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Orbit Controls Setup
createControls(camera, renderer);

// Ambient light
var ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

renderer.setClearColor(0x000000, 0);  // Set background to transparent // Set background to black

function radecToCartesian(ra, dec, distance) {
    ra = ra / 12 * Math.PI;  // Convert RA to radians
    dec = dec / 180 * Math.PI;  // Convert Dec to radians
    var x = distance * Math.cos(ra) * Math.cos(dec);
    var y = distance * Math.sin(ra) * Math.cos(dec);
    var z = distance * Math.sin(dec);
    return new THREE.Vector3(x, y, z);
}

// Create a star object
function createStar(ra, dec, distance, color) {
    var geometry = new THREE.BufferGeometry();
    var material = new THREE.PointsMaterial({ color: color, size: 5 });
    var position = radecToCartesian(ra, dec, distance);

    geometry.setAttribute('position', new THREE.Float32BufferAttribute([position.x, position.y, position.z], 3));

    return new THREE.Points(geometry, material);
}

function loadFloor(){
    var geometry = new THREE.PlaneGeometry(100000, 100000, 100, 100);
    var material = new THREE.MeshBasicMaterial({
        color: 0x8B4513,  // Brown color
        side: THREE.DoubleSide,
        transparent: false,
        opacity: 1,  // Full opacity
        depthWrite: true
    });
    var plane = new THREE.Mesh(geometry, material);
    plane.rotation.x = Math.PI / 2;
    plane.position.y = -1000;
    scene.add(plane);
}


//switched to direct link
fetch('Data\\planet_data.json', {
    mode: 'no-cors'
})
    .then(response => response.json())
    .then(data => {
        console.log(data);
        console.log('Loaded planet data:', data);
        data.forEach(planet => {
            var star = createStar(planet.ra, planet.dec, 10000, 0xffffff);
            scene.add(star);
        });
    })
    .catch(error => console.error('Error loading planet data:', error));


// New Scene (Scene 2)
renderer.setClearColor(0x222222);  // Different background for scene2
var cubeGeometry = new THREE.BoxGeometry(100, 100, 100);
var cubeMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
var cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
cube.position.set(0, 0, 0);
scene2.add(cube);

let activeScene = scene;
setupSceneChange(scene, scene2, (newScene) => {
    activeScene = newScene;
});
loadFloor();

// Animate and render the active scene
function animate() {
    requestAnimationFrame(animate);
    renderer.render(activeScene, camera);
}
animate();

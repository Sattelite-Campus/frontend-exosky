import * as THREE from 'three';
import { setupSceneChange } from "./src/sceneChange.js";
import { createControls } from "./src/orbitControls.js";
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

// Create the main scene
var scene = new THREE.Scene();

// Set up the camera
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 15000);
camera.position.set(0, 0, 100);

// Set up the WebGL renderer
var renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Orbit Controls Setup
createControls(camera, renderer);

// Bloom effect setup
var composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
var bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1,   // intensity of bloom
    1.3, // radius for bloom spread
    0.3  // threshold for bloom effect
);
composer.addPass(bloomPass);

renderer.setClearColor(0x000000);  // black background

function radecToCartesian(ra, dec, distance) {
    ra = ra / 12 * Math.PI;  // Convert RA to radians
    dec = dec / 180 * Math.PI;  // Convert Dec to radians
    var x = distance * Math.cos(ra) * Math.cos(dec);
    var y = distance * Math.sin(ra) * Math.cos(dec);
    var z = distance * Math.sin(dec);
    return new THREE.Vector3(x, y, z);
}

var textureLoader = new THREE.TextureLoader();
var starTexture = textureLoader.load('whiteCircleTexture.webp');
starTexture.minFilter = THREE.LinearFilter;

var starPositions = [];
var starSizes = [];  // Array for dynamically calculated sizes

// Create a star object and store positions and sizes
function createStar(ra, dec, distance, mag) {
    const size = 30 * Math.pow(1.2, Math.min(-Math.pow(mag, .9), 0.3)); // Dynamic size calculation
    var position = radecToCartesian(ra, dec, distance);
    starPositions.push(position.x, position.y, position.z);
    starSizes.push(size);
}

var vertexShader = `
    attribute float size;
    void main() {
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * (300.0 / -mvPosition.z);  // Adjust size based on distance
        gl_Position = projectionMatrix * mvPosition;
    }
`;

var fragmentShader = `
    uniform sampler2D pointTexture;
    void main() {
        gl_FragColor = texture2D(pointTexture, gl_PointCoord);
    }
`;

// Create the geometry for stars
var starGeometry = new THREE.BufferGeometry();
var starMaterial = new THREE.ShaderMaterial({
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    uniforms: {
        pointTexture: { value: starTexture }
    },
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthTest: true
});

function loadSkySphere() {
    var skygeo = new THREE.SphereGeometry(1600, 32, 16);
    var material = new THREE.MeshPhongMaterial({
        side: THREE.BackSide,
        color: 0x111111,
        shininess: 0,
        specular: 0x555555,
        emissive: 0x000000,
        depthWrite: false
    });
    var sky_sphere = new THREE.Mesh(skygeo, material);
    sky_sphere.rotateY(-Math.PI / 2);
    scene.add(sky_sphere);
}

function loadFloor(){
    var geometry = new THREE.CylinderGeometry(995, 995, 1, 64);
    var material = new THREE.MeshBasicMaterial({
        color: 0x8B4513,
        side: THREE.DoubleSide,
        transparent: false,
        opacity: 1,
        depthWrite: true
    });
    var plane = new THREE.Mesh(geometry, material);
    plane.position.y = -102;
    scene.add(plane);
}

fetch('Data\\star_data.json', {
    mode: 'no-cors'
})
    .then(response => response.json())
    .then(data => {
        data.forEach(planet => {
            createStar(planet.ra, planet.dec, 1000, planet.mag);
        });

        // Convert starPositions and starSizes to float32 arr
        starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));
        starGeometry.setAttribute('size', new THREE.Float32BufferAttribute(starSizes, 1)); // Add sizes

        // Create one Points object for all stars and add it to the scene
        var stars = new THREE.Points(starGeometry, starMaterial);
        scene.add(stars);
    })
    .catch(error => console.error('Error loading planet data:', error));

loadFloor();
loadSkySphere();

function animate() {
    requestAnimationFrame(animate);
    composer.render();
}
animate();

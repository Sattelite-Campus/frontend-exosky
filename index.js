import * as THREE from 'three';
import { setupSceneChange } from "./src/sceneChange.js";
import { createControls } from "./src/orbitControls.js";
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import {createConstellationStar} from "./src/constellationStar.js";

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
    2.5,   // intensity of bloom
    1.3, // radius for bloom spread
    0.5  // threshold for bloom effect
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
var starVertices = [];  // Store positions for constellation creation
var constellationCenters = [];  // Track constellation centers
let starColors = [];
function createStar(ra, dec, mag_b, mag_v) {
    const size = 70 * Math.pow(1.35, Math.min(-Math.pow(Math.max(0, (mag_b + mag_v) / 2), .9), 0.3)); // Dynamic size calculation lum ranges from -10 to 20
    // Create a star object and store positions and sizes
    var position = radecToCartesian(ra, dec, 1000);
    starPositions.push(position.x, position.y, position.z);
    starSizes.push(size);
    starVertices.push(position);

    const mag_index = Math.min(25, Math.max(0, 15 - (mag_b - mag_v)));
    const r = Math.min(1, 0.5 + mag_index / 25 / 16);
    const g = Math.min(1, 0.01 + mag_index / 25 / 2);
    const b = Math.min(1, Math.pow(mag_index / 25, 2));
    starColors.push(r, g, b);
}

var vertexShader = `
    attribute float size;
    attribute vec3 color;   // Add color attribute
    varying vec3 vColor;    // Pass color to fragment shader

    void main() {
        vColor = color;    // Assign color attribute to varying
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * (300.0 / -mvPosition.z);  // Adjust size based on distance
        gl_Position = projectionMatrix * mvPosition;
    }
`;

var fragmentShader = `
    uniform sampler2D pointTexture;
    varying vec3 vColor;

    void main() {
        vec4 texColor = texture2D(pointTexture, gl_PointCoord);
        gl_FragColor = vec4(vColor, 1.0) * texColor*1.4;  // Multiply color with texture
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
        shininess: 50,
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

// Function to draw dynamic constellations
function drawDynamicConstellations(vertices, maxBranches = 3, maxDepth = 2, distanceThreshold = 250, maxConstellationDistance = 500) {
var lineMaterial = new THREE.LineBasicMaterial({ color: 0x777777, opacity: 0.5, transparent: true, linewidth: 2 });

    function createBranch(currentStar, depth, maxDepth) {
        if (depth > maxDepth) return;

        let branches = Math.floor(Math.random() * (maxBranches - 1)) + 1;
        for (let i = 0; i < branches; i++) {
            let nearbyStar = getFilteredNearbyStar(currentStar, distanceThreshold, vertices);
            if (nearbyStar) {
                drawLineBetweenStars(currentStar, nearbyStar, lineMaterial);
                createBranch(nearbyStar, depth + 1, maxDepth);
            }
        }
    }

    var selectedStartStars = selectUniqueStartStars(vertices, 20, maxConstellationDistance);  // Enforce separation
    selectedStartStars.forEach(startStar => createBranch(startStar, 0, maxDepth));
}

// Select unique starting points with a maximum distance constraint
function selectUniqueStartStars(vertices, count, maxConstellationDistance) {
    let selectedStars = [];

    for (let attempts = 0; attempts < 5 * count && selectedStars.length < count; attempts++) {
        let candidateStar = vertices[Math.floor(Math.random() * vertices.length)];

        // Ensure candidate star is sufficiently far from other constellation centers
        let isFar = constellationCenters.every(center => center.distanceTo(candidateStar) > maxConstellationDistance);

        if (isFar) {
            selectedStars.push(candidateStar);
            constellationCenters.push(candidateStar);  // Track this constellation's center
        }
    }
    return selectedStars;
}

// Filter to find a suitable nearby star for better shapes
function getFilteredNearbyStar(currentStar, threshold, vertices) {
    let candidates = vertices.filter(star => 
        star !== currentStar &&
        currentStar.distanceTo(star) < threshold &&
        Math.abs(currentStar.x - star.x) > threshold / 5 &&
        Math.abs(currentStar.y - star.y) > threshold / 5 &&
        Math.abs(currentStar.z - star.z) > threshold / 5
    );
    return candidates.length > 0 ? candidates[Math.floor(Math.random() * candidates.length)] : null;
}

function drawLineBetweenStars(star1, star2, material) {
    var lineGeometry = new THREE.BufferGeometry();
    const lineVertices = new Float32Array([star1.x, star1.y, star1.z, star2.x, star2.y, star2.z]);
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(lineVertices, 3));
    var line = new THREE.Line(lineGeometry, material);
    scene.add(line);
}

fetch('Data\\star_data2.json', { mode: 'no-cors' })
    .then(response => response.json())
    .then(data => {
        data.forEach(planet => {
            createStar(planet.ra, planet.dec, planet.mag_b, planet.mag_v);
        });
        starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));
        starGeometry.setAttribute('size', new THREE.Float32BufferAttribute(starSizes, 1));
        starGeometry.setAttribute('color', new THREE.Float32BufferAttribute(starColors, 3));  // Pass color data
        var stars = new THREE.Points(starGeometry, starMaterial);
        scene.add(stars);

        // Create dynamic constellations
        drawDynamicConstellations(starVertices);
    })
    .catch(error => console.error('Error loading planet data:', error));

loadFloor();
loadSkySphere();

function animate() {
    requestAnimationFrame(animate);
    composer.render();
}
animate();

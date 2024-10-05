import * as THREE from 'three';
import { setupSceneChange } from "./src/sceneChange.js";
import { createControls } from "./src/orbitControls.js";
import {Cache as sky_group} from "three";

// Create the main scene and the second scene
var scene = new THREE.Scene();

// Set up the camera
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 15000);
camera.position.set(0, 0, 100);

// Set up the WebGL renderer
var renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Orbit Controls Setup test
createControls(camera, renderer);

// Ambient light
// var ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
// scene.add(ambientLight);

renderer.setClearColor(0x000000);  // Set background to black

function radecToCartesian(ra, dec, distance) {
    ra = ra / 12 * Math.PI;  // Convert RA to radians
    dec = dec / 180 * Math.PI;  // Convert Dec to radians
    var x = distance * Math.cos(ra) * Math.cos(dec);
    var y = distance * Math.sin(ra) * Math.cos(dec);
    var z = distance * Math.sin(dec);
    return new THREE.Vector3(x, y, z);
}

var textureLoader = new THREE.TextureLoader();
var starTexture = textureLoader.load('whiteCircleTexture.webp');  // Replace with the actual path

// Create a star object
function createStar(ra, dec, distance, color, mag) {
    const size = 30 * Math.pow(1.35, Math.min(-mag, 0.15));
    var geometry = new THREE.BufferGeometry();
    var material = new THREE.PointsMaterial({ color: color, size: size, map: starTexture, transparent: true });
    var position = radecToCartesian(ra, dec, distance);

    geometry.setAttribute('position', new THREE.Float32BufferAttribute([position.x, position.y, position.z], 3));

    var starGroup = new THREE.Group();
    var star = new THREE.Points(geometry, material);
    starGroup.add(star);      // Add the visual star

    return starGroup;
}

function loadSkySphere() {
    var skygeo = new THREE.SphereGeometry(1000, 32, 16);


    var material = new THREE.MeshPhongMaterial({
    });

    var sky_sphere = new THREE.Mesh(skygeo, material);
    sky_sphere.material.side = THREE.BackSide;

    sky_sphere.rotateY(-Math.PI / 2);

    //scene.add(sky_sphere);
    sky_group.add(sky_sphere);

    return sky_sphere;
}

function loadFloor(){
    var geometry = new THREE.CylinderGeometry(995, 995, 1, 64);  // Circular ground
    var material = new THREE.MeshBasicMaterial({
        color: 0x8B4513,  // Brown color
        side: THREE.DoubleSide,
        transparent: false,
        opacity: 1,
        depthWrite: true
    });
    var plane = new THREE.Mesh(geometry, material);
    plane.position.y = -102;
    scene.add(plane);
}


//switched to direct link
fetch('Data\\star_data.json', {
    mode: 'no-cors'
})
    .then(response => response.json())
    .then(data => {
        console.log(data);``
        console.log('Loaded planet data:', data);
        data.forEach(planet => {
            var starGroup = createStar(planet.ra, planet.dec, 1000, 0xffffff, planet.mag);
            scene.add(starGroup);
        });
    })
    .catch(error => console.error('Error loading planet data:', error));


loadFloor();
scene.add(loadSkySphere());

// Animate and render the active scene
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

animate();

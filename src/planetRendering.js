import * as THREE from 'three';
// import { setupSceneChange } from "./src/sceneChange.js";
import { createControls } from "./orbitControls.js";
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { periodToRotationSpeed, getAxialTilt} from "./rotationalFunctions.js";

import * as ConstMaker from "./constellationStar.js";
import * as Buttons from './controlRendering.js';
import { takeScreenshot } from "./screenshotHandling.js";
import {screenshotButton} from "./controlRendering.js";
import * as starDetails from "./starDetails.js";

export function renderPlanet (filePath) {

// Create the main scene
    var scene = new THREE.Scene();

// Set up the camera
    var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 15000);
    camera.position.set(0, 0, 100);  // Starting position
    let default_cam_dir = new THREE.Vector3();
    camera.getWorldDirection(default_cam_dir);
    let default_cam_pos = new THREE.Vector3();
    camera.getWorldPosition(default_cam_pos);


// Set up the WebGL renderer
    var renderer = new THREE.WebGLRenderer({
        antialias: true,
        preserveDrawingBuffer: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);


// Orbit Controls Setup (allowing free camera movement)
    createControls(camera, renderer);

// Bloom effect setup
    var composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    var bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        2,   // intensity of bloom
        1.3, // radius for bloom spread
        0.5  // threshold for bloom effect
    );
    composer.addPass(bloomPass);

    renderer.setClearColor(0x000000);  // black background
    renderer.autoClear = false;


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
    let starInfo = [];

    function createStar(ra, dec, mag_b, mag_v, st_temp, st_mass, st_lum) {
        // Dynamic size calculation based on magnitudes
        const size = 55 * Math.pow(1.22, Math.min(-Math.pow(Math.max(0, (mag_b + mag_v) / 2), 0.9), 0.3)); // Luminosity ranges from -10 to 20
        var position = radecToCartesian(ra, dec, 1000);
        starPositions.push(position.x, position.y, position.z);
        starSizes.push(size);
        if ((mag_b + mag_v) < 16.5) {
            starVertices.push(position);
        }
    
        // Color assignment based on temperature or magnitude indices
        let r, g, b;
    
        // If the temperature is valid, compute the RGB color using blackbody radiation principles
        if (st_temp > 0) {
            // console.log("VALID RGB CALC");
            [r, g, b] = getRGBfromTemperature(st_temp);
        } else {
            // Default behavior using magnitude indices when temperature is not available
            const min_offset = 2; // A value to raise the smallest B-V values above 0
            const max = 2; // The typical largest mag index you'd get, following the operations below
            const mag_index = Math.min(max, Math.max(0, min_offset - (mag_b - mag_v)));
    
            // The RGB operations map the mag_index values (0 - max) evenly onto a color distribution ranging from dark red to light blue
            r = Math.min(1, 0.8 * (0.5 - mag_index / max / 3.5));
            g = Math.min(1, 0.6 * (0.01 + mag_index / max / 3));
            b = Math.min(1, Math.pow(mag_index / max, 4));
        }
    
        // Push the computed color to the starColors array
        starColors.push(r, g, b);
        starInfo.push(st_mass, st_temp, mag_b, mag_v, st_lum);
    }
    
    // Function to compute RGB from blackbody temperature
    function getRGBfromTemperature(temp) {
        // Define constants
        const h = 6.626e-34; // Planck's constant (J·s)
        const c = 3e8; // Speed of light (m/s)
        const k = 1.38e-23; // Boltzmann's constant (J/K)
    
        // Sampled wavelengths for RGB components (in nanometers)
        const wavelengths = [440, 550, 675]; // Blue, Green, Red respectively
        const rgb = [0, 0, 0];
    
        // Calculate intensity for each wavelength
        wavelengths.forEach((lambda, i) => {
            lambda *= 1e-9; // Convert nm to meters
            const intensity = (2 * h * c ** 2) / (lambda ** 5 * (Math.exp((h * c) / (lambda * k * temp)) - 1));
            rgb[i] = intensity;
        });
    
        // Normalize the RGB values
        const maxVal = Math.max(...rgb);
        if (maxVal > 0) {
            rgb[0] /= maxVal; // Normalize Red
            rgb[1] /= maxVal; // Normalize Green
            rgb[2] /= maxVal; // Normalize Blue
        }
    
        // Apply gamma correction to simulate human color perception
        const gammaCorrect = (x) => (x <= 0.0031308) ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055;
    
        return rgb.map(gammaCorrect);
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
            pointTexture: {value: starTexture}
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

    function loadFloor() {
        var geometry = new THREE.CylinderGeometry(995, 995, 1, 64);
        var material = new THREE.MeshBasicMaterial({
            color: 0x8B4513,
            side: THREE.DoubleSide,
            transparent: false,
            opacity: 1,
            depthWrite: true
        });
        var plane = new THREE.Mesh(geometry, material);
        plane.position.set(0, -102, 0);  // Set X and Z to 0 for centering
        plane.name = "floor";
        scene.add(plane);
    }

    function drawDynamicConstellations(vertices, maxBranches = 3, maxDepth = 2, distanceThreshold = 470, maxConstellationDistance = 800) {
        var lineMaterial = new THREE.LineBasicMaterial({
            color: 0x777777,
            opacity: 0.5,
            transparent: true,
            linewidth: 2
        });

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

        var selectedStartStars = selectUniqueStartStars(vertices, 20, maxConstellationDistance);
        selectedStartStars.forEach(startStar => createBranch(startStar, 0, maxDepth));
    }

    function selectUniqueStartStars(vertices, count, maxConstellationDistance) {
        let selectedStars = [];
        for (let attempts = 0; attempts < 5 * count && selectedStars.length < count; attempts++) {
            let candidateStar = vertices[Math.floor(Math.random() * vertices.length)];
            let isFar = constellationCenters.every(center => center.distanceTo(candidateStar) > maxConstellationDistance);

            if (isFar) {
                selectedStars.push(candidateStar);
                constellationCenters.push(candidateStar);
            }
        }
        return selectedStars;
    }

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


    var allLines = [];

    function drawLineBetweenStars(star1, star2, material) {
        var lineGeometry = new THREE.BufferGeometry();
        const lineVertices = new Float32Array([star1.x, star1.y, star1.z, star2.x, star2.y, star2.z]);
        lineGeometry.setAttribute('position', new THREE.BufferAttribute(lineVertices, 3));
        var line = new THREE.Line(lineGeometry, material);
        allLines.push(line);
        scene.add(line);
    }

    function drawLineBetweenStars(star1, star2, material, list_array) {
        var lineGeometry = new THREE.BufferGeometry();
        const lineVertices = new Float32Array([star1.x, star1.y, star1.z, star2.x, star2.y, star2.z]);
        lineGeometry.setAttribute('position', new THREE.BufferAttribute(lineVertices, 3));
        var line = new THREE.Line(lineGeometry, material);
        allLines.push(line);
        list_array?.push(line)
        scene.add(line);
    }

    var stars;
    var brightStars = [];
    var detailedStars = [];

    fetch(filePath, {mode: 'no-cors'})
        .then(response => response.json())
        .then(data => {
            data.forEach(star => {
                createStar(star.ra, star.dec, star.mag_b, star.mag_v, star.st_temp, star.st_mass, star.st_lum);
                if (star.mag_b + star.mag_v < 13) {
                    const pos = radecToCartesian(star.ra, star.dec, 1000);
                    brightStars.push({
                        "name" : star.name, 
                        "pos": pos, 
                        "mag_b": star.mag_b, 
                        "mag_v": star.mag_v, 
                        "temp": star.temp, 
                        "lum": star.lum
                    });
                    ConstMaker.createConstellationStar(scene, pos.x, pos.y, pos.z, 20);
                }
            });
            starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));
            starGeometry.setAttribute('size', new THREE.Float32BufferAttribute(starSizes, 1));
            starGeometry.setAttribute('color', new THREE.Float32BufferAttribute(starColors, 3));
            stars = new THREE.Points(starGeometry, starMaterial);
            if(stars) {
                scene.add(stars);
            }
            drawDynamicConstellations(starVertices);
            starDetails.compileStarDetails(brightStars).forEach(mesh => scene.add(mesh));
            
            
        })
        .catch(error => console.error('Error loading planet data:', error));

    loadFloor();
    loadSkySphere();

    var rotationAxis = new THREE.Vector3(0.3977, 0.9175, 0);
    const maxRotationSpeed = 0.001
    var rotationSpeed = 0;
    var orbitRadius = 100;
    var orbitSpeed = 0.01;
    var total_rotation = 0;

    function handleRotate(){
        stars.rotateOnAxis(rotationAxis, rotationSpeed);
        ConstMaker.getConstStars().forEach(star => star.rotateOnAxis(rotationAxis, rotationSpeed));
        // console.log(getConstStars());
        allLines.forEach(line => line.rotateOnAxis(rotationAxis, rotationSpeed));
        total_rotation = (total_rotation + rotationSpeed) % (2 * Math.PI);
    }


    function animate() {
        requestAnimationFrame(animate);

        //wait for stars to load
        if (stars && ConstMaker.getConstStars().length > 0) {
            handleRotate();
        }

        // Orbit the floor around the origin
        scene.getObjectByName("floor").position.x = orbitRadius * Math.cos(Date.now() * orbitSpeed / 1000);
        scene.getObjectByName("floor").position.z = orbitRadius * Math.sin(Date.now() * orbitSpeed / 1000);

        composer.render();
    }
    let constellation = false;



    Buttons.toggleButton.addEventListener('click', () => {
        resetRotation();
        stopRotation();
        if (!constellation) {
            constellation = true;
            const constMode = document.getElementById("constellation-mode");
            constMode.style.display = "block";
            ConstMaker.showConstMaker();            

            // event listener for mouse clicks
            window.addEventListener('click', (event) => ConstMaker.onLeftClick(event, camera, drawLineBetweenStars), false);
            window.addEventListener('contextmenu', () => ConstMaker.onRightClick(scene)) // contextmenu <=> right-click
        }
    });

    Buttons.exitButton.addEventListener('click', () => {
        exitConstMaker();
    });

    function exitConstMaker() {
        //Remove ActionEvents
        window.removeEventListener('click', (event) => ConstMaker.onLeftClick(event, camera, drawLineBetweenStars), false);
        window.removeEventListener('contextmenu', () => ConstMaker.onRightClick(scene)) // contextmenu <=> right-click
    
        ConstMaker.resetConstMaker(scene);
        ConstMaker.hideConstMaker();

        const constMode = document.getElementById("constellation-mode");
        constMode.style.display = "none";

        constellation = false;
    }

    Buttons.saveButton.addEventListener('click', () => {
        ConstMaker.saveConst();
        exitConstMaker();
    });

    Buttons.startButton.addEventListener('click', () => {
        if (!constellation) {
            rotationSpeed = maxRotationSpeed;
        }
    });

    Buttons.resetButton.addEventListener('click', resetRotation);

    function resetRotation() {
        stars?.rotateOnAxis(rotationAxis, -total_rotation);
        ConstMaker.getConstStars().forEach(star => star.rotateOnAxis(rotationAxis, -total_rotation));
        allLines.forEach(line => line.rotateOnAxis(rotationAxis, -total_rotation));
        total_rotation = 0;
    }

    Buttons.stopButton.addEventListener('click', stopRotation);

    function stopRotation() {
        rotationSpeed = 0;
    }

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        composer.setSize(window.innerWidth, window.innerHeight);
    }

    // Add event listener for window resize
    window.addEventListener('resize', onWindowResize, false);

    window.addEventListener('mousemove', (event) => starDetails.showDetails(event, camera));

    animate();

    Buttons.screenshotButton.addEventListener('click', () => {
        if(screenshotButton.classList.contains('active')) {
            takeScreenshot(renderer);
        }
    });
}

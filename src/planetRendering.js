import * as THREE from 'three';
// import { setupSceneChange } from "./src/sceneChange.js";
import { createControls } from "./orbitControls.js";
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { periodToRotationSpeed, getAxialTilt} from "./rotationalFunctions.js";

import * as constMaker from "./constellationStar.js";
import * as Buttons from './controlRendering.js';
import { takeScreenshot } from "./screenshotHandling.js";
import {screenshotButton} from "./controlRendering.js";
import * as starDetails from "./starDetails.js";

export function renderPlanet (filePath) {

    var realisticBloom = true;
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
        3.7,   // intensity of bloom DEFAULT 4.2
        1.3, // radius for bloom spread DEFAULT 1.3
        0.44  // threshold for bloom effect DEFAULT .44
    );
    composer.addPass(bloomPass);

    function determinePass(realisticBloom){
        composer.removePass(bloomPass);

        if(realisticBloom){
            bloomPass = new UnrealBloomPass(
                new THREE.Vector2(window.innerWidth, window.innerHeight),
                4.2,   // intensity of bloom DEFAULT 4.2
                1.3, // radius for bloom spread DEFAULT 1.3
                0.44  // threshold for bloom effect DEFAULT .44
            );
            realisticBloom = false;
        }
        else {
            bloomPass = new UnrealBloomPass(
                new THREE.Vector2(window.innerWidth, window.innerHeight),
                17,   // intensity of bloom DEFAULT 4.2
                1.3, // radius for bloom spread DEFAULT 1.3
                0  // threshold for bloom effect DEFAULT .44
            );
            realisticBloom = true;
        }
        composer.addPass(bloomPass);
    }

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
    let originalStarColours = []; // Bloom-affected colors
    let tempStarColours = [];     // Colors from getRGBfromTemperature

    function createStar(ra, dec, mag_b, mag_v, st_temp, st_mass, st_lum) {
        const size = 55 * Math.pow(1.22, Math.min(-Math.pow(Math.max(0, (mag_b + mag_v) / 2), 0.9), 0.3));
        var position = radecToCartesian(ra, dec, 1000);
        starPositions.push(position.x, position.y, position.z);
        if ((mag_b + mag_v) < 16.5) {
            starVertices.push(position);
        }
        starSizes.push(size);

        let r, g, b;

        // Original colors based on magnitude or bloom effects
        const min_offset = 2;
        const max = 2;
        const mag_index = Math.min(max, Math.max(0, min_offset - (mag_b - mag_v)));

        r = Math.min(1, 0.8 * (0.5 - mag_index / max / 3.5));
        g = Math.min(1, 0.6 * (0.01 + mag_index / max / 3));
        b = Math.min(1, Math.pow(mag_index / max, 4));

        // Store these as the original star colors (used when bloom is active)
        originalStarColours.push(r, g, b);

        // If temperature is valid, store temp-based RGB values
        if (st_temp > 0) {
            [r, g, b] = getRGBfromTemperature(st_temp);
        } else {
            [r, g, b] = [0.5, 0.5, 0.5]; // Fallback color for stars without temperature data
        }

        // Store temperature-based colors
        tempStarColours.push(r, g, b);
    }

    function handleStarColourSwitch(useTempColors) {
        // Decide which array to use (either the bloom-based or temperature-based colors)
        let selectedColors = useTempColors ? tempStarColours : originalStarColours;

        // Update the color attribute of the star geometry
        starGeometry.setAttribute('color', new THREE.Float32BufferAttribute(selectedColors, 3));

        // Update the scene by re-rendering it
        composer.render();
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

    var planetDistances = {};

    function loadFloor() {
        // Create a large sphere to act as a planet
        const planetRadius = 9950;
        const geometry = new THREE.SphereGeometry(planetRadius, 64, 64);

        // Load texture image for the planet's surface
        const texture = new THREE.TextureLoader().load('../Textures/Gaseous1.png');

        // Use MeshBasicMaterial to ensure no lighting interaction
        const material = new THREE.MeshBasicMaterial({
            map: texture,            // Use the loaded texture
            side: THREE.FrontSide,    // Render only the outside of the sphere
            transparent: false,       // No transparency needed
            opacity: 1,               // Full opacity
            depthWrite: true,         // Correct depth layering
            depthTest: true,          // Enable z-order testing
            color: new THREE.Color(0xffffff)  // Set color to full white to preserve texture colors
        });

        // Create the planet mesh using the sphere geometry and material
        const planet = new THREE.Mesh(geometry, material);
        planet.position.set(0, -planetRadius - 50, 0);  // Lower the sphere so camera is on its surface
        planet.name = "floor";  // Keep the name as "floor" for compatibility
        planet.layers.set(1);
        scene.add(planet);

        // Adjust the camera position to simulate standing on the surface of the planet
        camera.position.set(0, 0, 100);  // Place the camera on the surface of the sphere along the Z-axis
        // camera.lookAt(planet.position);

        // Adjust renderer settings to prevent overexposure or bloom
        if (renderer) {
            renderer.toneMapping = THREE.NoToneMapping;  // Disable tone mapping to prevent unintended glow
            renderer.toneMappingExposure = 1.0;          // Set default exposure value
            renderer.gammaFactor = 2.2;                  // Set standard gamma for correct color perception
            renderer.gammaOutput = true;                 // Ensure gamma correction is applied to final output
        }
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
    var constellationStars = [];
    var detailedStars = [];

    var index = 0;

    //filePath is the planetName

    // DISABLING TO TRY TEST DATA
    fetch("/api/render?index=" + filePath, {
        method: 'GET',
        mode: 'cors',  // This allows handling of the response if the server supports it
        headers: {
            'Accept': 'application/json',
            'Access-Control-Allow-Origin': '*'
        }
    })
        .then(response => response.json())
        .then(data => {
            console.log("DATA FOUND");
            // console.log(data);
            const starsData = JSON.parse(data.stars);
            const keyList = Object.keys(starsData);


            keyList.forEach(key => {
                var starData = starsData[key];
                createStar(starData.ra, starData.dec, starData.sy_bmag, starData.sy_vmag, starData.st_teff, starData.st_mass, starData.st_lum);
                if (starData.sy_bmag + starData.sy_vmag < 20) {
                    const pos = radecToCartesian(starData.ra, starData.dec, 1000);
                    brightStars.push({
                        "name": starData.sy_name,
                        "dist": starData.sy_dist,
                        "pos": pos,
                        "mag_b": starData.sy_bmag,
                        "mag_v": starData.sy_vmag,
                        "temp": starData.st_teff,
                        "lum": starData.st_lum
                    });
                }
            });
            console.log(brightStars);
            starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));
            starGeometry.setAttribute('size', new THREE.Float32BufferAttribute(starSizes, 1));
            stars = new THREE.Points(starGeometry, starMaterial);
            if(stars) {
                scene.add(stars);
            }
            drawDynamicConstellations(starVertices);
            detailedStars = starDetails.compileStarData(brightStars);
            detailedStars.forEach(star => scene.add(star));
            starDetails.hideStars();
            constellationStars = constMaker.compileStarData(brightStars);
            constellationStars.forEach(star => scene.add(star));
            constMaker.hideStars();
            console.log("Meow");
        })
        .catch(error => console.error('Error loading planet data:', error));
    loadFloor();
    loadSkySphere();
    var rotationAxis = new THREE.Vector3(0.3977, 0.9175, 0);
    const maxRotationSpeed = 0.001
    var rotationSpeed = maxRotationSpeed;
    var orbitRadius = 100;
    var orbitSpeed = 0.01;
    var total_rotation = 0;

    function handleRotate(){
        stars.rotateOnAxis(rotationAxis, rotationSpeed);
        constellationStars.forEach(star => star.rotateOnAxis(rotationAxis, rotationSpeed));
        allLines.forEach(line => line.rotateOnAxis(rotationAxis, rotationSpeed));
        total_rotation = (total_rotation + rotationSpeed) % (2 * Math.PI);
    }

    function renderBloomLayer() {
        // Render only the objects on layer 0 for the bloom effect
        camera.layers.set(0);
        composer.render();
    }

    function renderFinalScene() {
        // Render all objects, including those on layer 1 (planet)
        camera.layers.set(1);  // Set to layer 1 to include the planet in the render
        renderer.clearDepth();  // Clear depth to ensure proper rendering order
        renderer.render(scene, camera);
    }

    function animate() {
        requestAnimationFrame(animate);

        //wait for stars to load
        if (stars && constellationStars.length > 0) {
            handleRotate();
        }
        // COMPUTATIONAL COP-OUT BC GEODESICS WERE TOO EXPENSIVE

        // Orbit the floor around the origin
        scene.getObjectByName("floor").position.x = orbitRadius * Math.cos(Date.now() * orbitSpeed / 1000);
        scene.getObjectByName("floor").position.z = orbitRadius * Math.sin(Date.now() * orbitSpeed / 1000);

        renderBloomLayer();
        renderFinalScene();
        // composer.render();
    }

    let is_rotate_locked = false;

    Buttons.toggleButton.addEventListener('click', () => {
        resetRotation();
        stopRotation();
        if (!is_rotate_locked) {
            is_rotate_locked = true;
            const constMode = document.getElementById("constellation-mode");
            constMode.style.display = "block";
            constMaker.showStars();

            // event listener for mouse clicks
            window.addEventListener('click', (event) => constMaker.onLeftClick(event, camera, drawLineBetweenStars), false);
            window.addEventListener('contextmenu', () => constMaker.onRightClick(scene)) // contextmenu <=> right-click
        }
    });

    Buttons.exitButton.addEventListener('click', () => {
        exitConstMaker();
    });

    function exitConstMaker() {
        //Remove ActionEvents
        window.removeEventListener('click', (event) => constMaker.onLeftClick(event, camera, drawLineBetweenStars), false);
        window.removeEventListener('contextmenu', () => constMaker.onRightClick(scene)) // contextmenu <=> right-click

        constMaker.resetConstMaker(scene);
        constMaker.hideStars(scene);

        const constMode = document.getElementById("constellation-mode");
        constMode.style.display = "none";

        is_rotate_locked = false;
    }

    Buttons.saveButton.addEventListener('click', () => {
        constMaker.saveConst();
        exitConstMaker();
    });

    Buttons.startButton.addEventListener('click', () => {
        if (!is_rotate_locked) {
            rotationSpeed = maxRotationSpeed;
        }
    });

    Buttons.resetButton.addEventListener('click', resetRotation);

    function resetRotation() {
        stars?.rotateOnAxis(rotationAxis, -total_rotation);
        constellationStars.forEach(star => star.rotateOnAxis(rotationAxis, -total_rotation));
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
            const storyBoard = document.getElementById('constellation-story');
            stopRotation();
            storyBoard.style.visibility = "visible";
            story = true;
            takeScreenshot(renderer);
        }
    });

    Buttons.showDetailsButton.addEventListener('click', () => {
        stopRotation();
        resetRotation();
        realisticBloom = true;
        determinePass(realisticBloom);
        handleStarColourSwitch(realisticBloom);
        if (!is_rotate_locked) {
            starDetails.showStars();
            is_rotate_locked = true;
        } else {
            starDetails.hideStars();
            is_rotate_locked = false;
        }
    });

    let story = false;
    Buttons.showStoryButton.addEventListener('click', () => {
        const storyBoard = document.getElementById('constellation-story');
        if (!story) {
            storyBoard.style.visibility = "visible";
            story = true;
        } else {
            storyBoard.style.visibility = "hidden";
            story = false;
        }
    });

    Buttons.showColourButton.addEventListener('click', () => {
        // Toggle between the two color sets
        realisticBloom = !realisticBloom;
        determinePass(realisticBloom);
        handleStarColourSwitch(realisticBloom);
    });

}

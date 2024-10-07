import * as THREE from 'three'

let stars = [];

export function compileStarData(starData) {
  
  starData.forEach(star => {
    var geometry = new THREE.SphereGeometry(20, 32, 32);  // Creates a sphere with the given radius
    var material = new THREE.MeshBasicMaterial({
      color: new THREE.Color(1, 1, 1,),
      transparent: true,
      opacity: 0.5,  // Transparency for the sphere
      depthWrite: false  // Disable depth write so the sphere is always rendered on top
    });

    var starMesh = new THREE.Mesh(geometry, material);
    starMesh.position.set(star.pos.x, star.pos.y, star.pos.z);  // Set the position of the sphere
    starMesh.userData = star;
    
    stars.push(starMesh);
  });
  return stars;
}

export function showStars() {
  stars.forEach(star => star.visible = true);
}

export function hideStars() {
  stars.forEach(star => star.visible = false);
}

// Display details of the star the mouse is hovered over
export function showDetails(event, camera) {

  // Raycaster and mouse for detecting clicks
  var starFinder = new THREE.Raycaster();
  var mouse = new THREE.Vector2();

  // Convert mouse position to normalized device coordinates (-1 to +1)
  
  mouse.x = (event.offsetX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // Update the raycaster with the mouse position and the camera
  starFinder.setFromCamera(mouse, camera);

  // Check for intersections between the ray and the objects in the scene
  var intersects = starFinder.intersectObjects(stars);

  if (intersects.length == 0) {
    return false;
  }

  const starData = intersects[0].object.userData;

  function renderDetails(){
    const detailsDiv = document.querySelector('.star-details');
    detailsDiv.innerHTML = '';
    for (const [key, value] of Object.entries(starData)) {
      const p = document.createElement('p');
      p.innerHTML = `<strong>${key}:</strong> ${value}`;
      detailsDiv.appendChild(p);
    }
  }

  renderDetails(starData);


  return starData;
}
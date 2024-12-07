import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'dat.gui';
import gsap from 'gsap';
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// define colors for random generated shoe
const colors = [
  0xffffff, // white
  0xff0000, // red
  0xffa500, // orange
  0xffff00, // yellow
  0x008000, // green
  0x0000ff, // blue
  0x4b0082, // indigo
  0x9400d3, // violet
  0xffc0cb, // pink
  0x000000, // black
  0x808080  // gray
];

// get random color generator function
function getRandomColor() {
  const randomIndex = Math.floor(Math.random() * colors.length);
  return colors[randomIndex];
}

// Variables for hover animation
let initialY = 0;

// Renderer setup
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// Scene setup
const scene = new THREE.Scene();

// Add a cubemap as the scene background
const cubeTextureLoader = new THREE.CubeTextureLoader();
const cubeMap = cubeTextureLoader.load([
  '/cubeMap/px.png',
  '/cubeMap/nx.png',
  '/cubeMap/py.png',
  '/cubeMap/ny.png',
  '/cubeMap/pz.png',
  '/cubeMap/nz.png',
]);
scene.background = cubeMap;

// Load textures for materials
const textureLoader = new THREE.TextureLoader();
const materials = {
  army: textureLoader.load('/shoeMaterial/army.jpg'),
  crocodile: textureLoader.load('/shoeMaterial/crocodile.jpg'),
  glitter: textureLoader.load('/shoeMaterial/glitter.jpg'),
  leather: textureLoader.load('/shoeMaterial/leather.jpg'),
  leopard: textureLoader.load('/shoeMaterial/leopard.jpg'),
  blocked: textureLoader.load('/shoeMaterial/blocked.jpg'),
  zebra: textureLoader.load('/shoeMaterial/zebra.jpg'),
  flower: textureLoader.load('/shoeMaterial/flower.jpg'),
  pizza: textureLoader.load('/shoeMaterial/pizza.jpg')
};

// Mapping of object names to descriptive names
const objectNameMapping = {
  "Object_2": " insole and ankle band",
  "Object_3": "heart and heel",
  "Object_4": "straps",
  "Object_5": "sole"
};

// Camera setup
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 5); // Increased Y value for more height
camera.lookAt(0, 0, 0); // Still looking at the origin

// Controls setup
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.maxPolarAngle = Math.PI / 2; // Maximum angle from the top
controls.minPolarAngle = Math.PI / 2; // Minimum angle to restrict vertical movement
controls.enableZoom = false; // Disable zoom functionality
controls.enablePan = false; // Disable panning with the right mouse button
controls.update();

// Lighting setup
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 7.5);
directionalLight.castShadow = true;

// Adjust shadow properties
directionalLight.shadow.mapSize.width = 2048;  // Increase shadow map size for better quality
directionalLight.shadow.mapSize.height = 2048; // Increase shadow map size for better quality
directionalLight.shadow.camera.near = 0.5;      // Near plane of the shadow camera
directionalLight.shadow.camera.far = 50;        // Far plane of the shadow camera
directionalLight.shadow.camera.left = -10;      // Adjust shadow camera's left side
directionalLight.shadow.camera.right = 10;      // Adjust shadow camera's right side
directionalLight.shadow.camera.top = 10;         // Adjust shadow camera's top side
directionalLight.shadow.camera.bottom = -10;     // Adjust shadow camera's bottom side

scene.add(directionalLight);

// Additional light to illuminate the backside of the shoe
const backLight = new THREE.PointLight(0xffffff, 5, 10);
backLight.position.set(-2, 2, -3);
backLight.castShadow = false;
scene.add(backLight);

// Additional light to illuminate the front side of the shoe
const frontLight = new THREE.PointLight(0xffffff, 5, 10);
frontLight.position.set(-4, 2, 2);
frontLight.castShadow = false;
scene.add(frontLight);

// Responsive window
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

window.addEventListener('click', onMouseClick);

function onMouseClick(event) {
  // Normalize mouse coordinates to (-1, 1)
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // Update the raycaster with camera and mouse position
  raycaster.setFromCamera(mouse, camera);

  // Calculate intersected objects
  const intersects = raycaster.intersectObjects(sneakerModel.children, true);

  if (intersects.length > 0) {
    // Get the first intersected object
    const intersectedObject = intersects[0].object;

    // Set currentIntersect to the clicked object
    currentIntersect = intersectedObject;

    // Determine the step based on the object's name
    const objectName = intersectedObject.name;
    const stepIndex = objectsInOrder.indexOf(objectName);

    if (stepIndex !== -1) {
      currentStep = stepIndex;
      setCurrentObject();
    } else {
      console.log(`Clicked on: ${objectName}, but it's not part of the customizable objects.`);
    }
  }
}

// Load the GLTF model for the pillar
const standLoader = new GLTFLoader().setPath('/models/pillar/');
let groundModel;

standLoader.load('marble_pillar.glb', (gltf) => {
  groundModel = gltf.scene;
  groundModel.scale.set(0.3, 0.3, 0.3);
  groundModel.position.set(0, -1.5, 0);

  // Load the marble texture
  const textureLoader = new THREE.TextureLoader();
  const marbleTexture = textureLoader.load('/textures/marmer.jpg', (texture) => {
    // Set texture properties if needed
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 1);
  });

  // Create a new material for the pillar using the loaded texture
  const marbleMaterial = new THREE.MeshStandardMaterial({
    map: marbleTexture,
    metalness: 0,
    roughness: 0.8,
  });

  // Traverse through the pillar model and apply the new material
  groundModel.traverse((child) => {
    if (child.isMesh) {
      child.material = marbleMaterial;
      child.receiveShadow = true;
    }
  });

  scene.add(groundModel);
});

// Load the sneaker model
const loader = new GLTFLoader().setPath('/models/shoes_with_heart_heel/');
let sneakerModel;

loader.load('scene.gltf', (gltf) => {
  sneakerModel = gltf.scene;
  sneakerModel.scale.set(0.45, 0.45, 0.45);
  sneakerModel.position.set(0.6, -1, 0);

  // Store the initial Y position for hover animation
  initialY = sneakerModel.position.y;

  // Ensure the sneaker model casts shadows
  sneakerModel.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true; // Enable shadow casting for the sneaker
    }
  });

  // Apply a random color to the sneaker model
  sneakerModel.traverse((child) => {
    if (child.isMesh) {
      const randomColor = getRandomColor(); // Get a random color
      child.material.color.set(randomColor); // Set the random color
    }
  });

  scene.add(sneakerModel); // Add the model to the scene
  console.log("Model loaded");

  // Initialize the first object only after the sneaker model is loaded
  setCurrentObject();
});

// Step-wise interaction management
const objectsInOrder = ["Object_2", "Object_3", "Object_4", "Object_5"]; // Replace with your actual object names
let currentStep = 0; // Keep track of the current object step
let currentIntersect = null; // Current object to interact with

// Function to show the overlay
function showOverlay() {
  const overlay = document.createElement('div');
  overlay.id = 'overlay';
  overlay.style.position = 'fixed';
  overlay.style.top = 0;
  overlay.style.left = 0;
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
  overlay.style.color = '#fff';
  overlay.style.fontSize = '2em';
  overlay.style.display = 'flex';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';
  overlay.textContent = "Your order has been sent!"; // Customize this text if needed
  document.body.appendChild(overlay);
}

function setDefaultColor(model) {
  model.traverse((child) => {
    if (child.isMesh) {
      child.material.color.set(0xffffff); // Set to white
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const materialButton = document.getElementById('material-button');
  const colorsDiv = document.querySelector('.colors');
  const materialsDisplay = document.querySelector('.materials-display');

  materialButton.addEventListener('click', () => {
    // Toggle visibility
    if (colorsDiv.style.display === 'none') {
      colorsDiv.style.display = 'flex'; // Show colors
      materialsDisplay.style.display = 'none'; // Hide materials
    } else {
      colorsDiv.style.display = 'none'; // Hide colors
      materialsDisplay.style.display = 'flex'; // Show materials
    }
  });
});

// After sneakerModel is loaded and currentObject is set, add event listeners for materials
document.querySelectorAll('.materials-display .material').forEach((materialLink) => {
  materialLink.addEventListener('click', (event) => {
    event.preventDefault(); // Prevent the default anchor behavior
    const selectedMaterial = event.target.dataset.material;
    if (currentIntersect) {
      if (selectedMaterial === 'none') {
        currentIntersect.material.map = null; // Clear the texture
        currentIntersect.material.needsUpdate = true;
      } else if (materials[selectedMaterial]) {
        const newMaterial = new THREE.MeshStandardMaterial({ map: materials[selectedMaterial] });
        currentIntersect.material = newMaterial;
      }
    }
  });
});

// Function to set the current object for interaction
function setCurrentObject() {
  // Hide all color/material selectors initially
  document.querySelectorAll('.color').forEach(color => color.style.display = 'none');

  // Get the name of the current object to interact with
  const currentObjectName = objectsInOrder[currentStep];
  const currentObject = sneakerModel.getObjectByName(currentObjectName);

  if (currentObject) {
    // Show color/material selectors for the current object
    document.querySelectorAll('.color').forEach(color => color.style.display = 'block');

    // Set currentIntersect as the current object for later use
    currentIntersect = currentObject;

    // Update the main text to reflect the current object using the mapping
    document.getElementById('main-text').innerText = `Edit ${objectNameMapping[currentObjectName] || currentObjectName}`;

    // Update the step indicator
    document.getElementById('current-step').innerText = currentStep + 1; // +1 to make it 1-indexed

    // Log the current object name
    console.log(`Interacting with: ${currentObjectName}`);
  }
}

// Set up click event for the next object
document.getElementById('next-button').addEventListener('click', () => {
  if (currentStep < objectsInOrder.length - 1) {
    currentStep++;
    setCurrentObject();
  } else {
    console.log("No more objects to interact with.");
  }
});

// Set up click event for the previous object
document.getElementById('prev-button').addEventListener('click', () => {
  if (currentStep > 0) {
    currentStep--;
    setCurrentObject();
  } else {
    console.log("No previous objects to interact with.");
  }
});

// Color change for sneaker only
document.querySelectorAll('.color').forEach((color) => {
  color.addEventListener('click', (event) => {
    const dataColor = event.target.dataset.color;
    if (currentIntersect) {
      // Set the color based on the selected option
      if (dataColor === 'none') {
        // If 'No Color' is selected, you can choose to keep the existing material or set a default
        currentIntersect.material.color.set(0xffffff); // Set to white or keep current
      } else {
        // Set the color based on other selected colors
        currentIntersect.material.color.set(dataColor);
      }
    }
  });
});

// Function to complete the order and make an API call
function completeOrder() {
  // Check if an object is selected
  if (!currentIntersect) {
    alert('Please select a part of the shoe to customize before completing your order.');
    return;
  }

  // Prepare the order data
  const orderData = {
    step: currentStep,
    material: currentIntersect.material.map ? currentIntersect.material.map.image.src : null,
    color: currentIntersect.material.color.getHexString(),
  };

  console.log('Order data being sent:', orderData); // Debugging log

  // Make the API call to the correct URL
  fetch('https://build-configurator-back-end.onrender.com/api/v1/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(orderData),
  })
    .then(response => {
      console.log('Response status:', response.status); // Log response status
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }
      return response.json();
    })
    .then(data => {
      console.log('Order completed successfully:', data);
      showOverlay(); // Show the success overlay
    })
    .catch(error => {
      console.error('There was a problem with the fetch operation:', error);
      alert('There was an error completing your order. Please try again.'); // Error handling
    });
}

// Animation variables
let hoverDirection = 1;
let hoverSpeed = 0.002;
let hoverHeight = 0.3;

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  // Update hover animation for the sneaker model
  if (sneakerModel) {
    // Adjust the position within bounds
    sneakerModel.position.y += hoverSpeed * hoverDirection;
    if (sneakerModel.position.y >= initialY + hoverHeight || sneakerModel.position.y <= initialY) {
      hoverDirection *= -1; // Reverse the hover direction
    }
  }

  // Render the scene
  renderer.render(scene, camera);

  // Update controls
  controls.update();
}

animate();
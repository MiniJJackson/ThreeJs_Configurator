import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'dat.gui';
import gsap from 'gsap';

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
camera.position.set(0, 2, 7);
camera.lookAt(0, 0, 0);

// Controls setup
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.maxPolarAngle = Math.PI / 2;

// Set minimum and maximum zoom distances
controls.minDistance = 5; // Minimum distance to zoom in
controls.maxDistance = 10; // Maximum distance to zoom out

// Disable panning with the right mouse button
controls.enablePan = false;

controls.update();


// Lighting setup
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 7.5);
directionalLight.castShadow = true;
scene.add(directionalLight);

// Responsive window
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Load the GLTF model for the pillar
const standLoader = new GLTFLoader().setPath('/models/pillar/');
let groundModel;

standLoader.load('marble_pillar.glb', (gltf) => {
  groundModel = gltf.scene;
  groundModel.scale.set(0.3, 0.3, 0.3);
  groundModel.position.set(0, -0.8, 0);
  scene.add(groundModel);
});

// Load the sneaker model
const loader = new GLTFLoader().setPath('/models/shoes_with_heart_heel/');
let sneakerModel;

loader.load('scene.gltf', (gltf) => {
  sneakerModel = gltf.scene;
  sneakerModel.scale.set(0.35, 0.35, 0.35);
  sneakerModel.position.set(0.6, 0, 0);
  scene.add(sneakerModel);
  console.log("Model loaded");

  // Set the default color to white when the model is loaded
  setDefaultColor(sneakerModel);

  // Initialize the first object only after the sneaker model is loaded
  setCurrentObject();
});

// Step-wise interaction management
const objectsInOrder = ["Object_2", "Object_3", "Object_4", "Object_5"]; // Replace with your actual object names
let currentStep = 0; // Keep track of the current object step
let currentIntersect = null; // Current object to interact with

function setDefaultColor(model) {
  model.traverse((child) => {
    if (child.isMesh) {
      child.material.color.set(0xffffff); // Set to white
    }
  });
}

// Function to set the current object for interaction
function setCurrentObject() {
  // Hide all color/material selectors initially
  document.querySelectorAll('.color').forEach(color => color.style.display = 'none');
  document.getElementById('material-select').style.display = 'none';

  // Get the name of the current object to interact with
  const currentObjectName = objectsInOrder[currentStep];
  const currentObject = sneakerModel.getObjectByName(currentObjectName);

  if (currentObject) {
    // Show color/material selectors for the current object
    document.querySelectorAll('.color').forEach(color => color.style.display = 'block');
    document.getElementById('material-select').style.display = 'block';

    // Set currentIntersect as the current object for later use
    currentIntersect = currentObject;

    // Update the main text to reflect the current object using the mapping
    document.getElementById('main-text').innerText = `Edit  ${objectNameMapping[currentObjectName] || currentObjectName}`;

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

// Material change for sneaker only
const materialSelect = document.getElementById('material-select');
materialSelect.addEventListener('change', (event) => {
  const selectedMaterial = event.target.value;
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

// Animation for the sneaker model
let hoverDirection = 1;
let hoverSpeed = 0.002;
let hoverHeight = 0.3; // The maximum height hover

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  // Update hover animation for the sneaker model
  if (sneakerModel) {
    sneakerModel.position.y += hoverSpeed * hoverDirection;
    // Update the hover bounds based on the new initial position
    if (sneakerModel.position.y >= 0 + hoverHeight || sneakerModel.position.y <= 0) {
      hoverDirection *= -1; // Reverse the hover direction
    }
  }

  // Render the scene
  renderer.render(scene, camera);

  // Update controls
  controls.update();
}

animate();
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'dat.gui';

// Renderer setup
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb); // Light blue background

// Camera setup
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 2, 5);
camera.lookAt(0, 0, 0);

// Controls setup
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Smooth damping effect
controls.update();

// Lighting setup
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 7.5);
directionalLight.castShadow = true;
scene.add(directionalLight);

// Add a circle on the ground to show the model over
const circleGeometry = new THREE.CircleGeometry(2, 32);
const circleMaterial = new THREE.MeshBasicMaterial({ color: 0xCE3D85 });
const circle = new THREE.Mesh(circleGeometry, circleMaterial);
circle.rotation.x = -Math.PI / 2;
circle.position.y = 0.01;
scene.add(circle);

// Ground plane 
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(20, 20),
  new THREE.MeshStandardMaterial({ color: 0x808080 })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// Load model GLTF
let sneakerModel = null;
const loader = new GLTFLoader().setPath('/assets/models/pschoboy_sneaker/');
loader.load('scene.gltf', (gltf) => {
  sneakerModel = gltf.scene;
  sneakerModel.scale.set(0.08, 0.08, 0.08);
  sneakerModel.position.set(0, 0.4, 0);
  scene.add(sneakerModel);

  console.log("Model loaded");
});

// Environment map
const cubeTextureLoader = new THREE.CubeTextureLoader();
const environmentMap = cubeTextureLoader.load([
  '/assets/textures/px.jpg',
  '/assets/textures/nx.jpg',
  '/assets/textures/py.jpg',
  '/assets/textures/ny.jpg',
  '/assets/textures/pz.jpg',
  '/assets/textures/nz.jpg',
]);
scene.environment = environmentMap;

// dat.GUI
const gui = new dat.GUI();
const lightFolder = gui.addFolder('Light Settings');
lightFolder.add(directionalLight.position, 'x', -10, 10);
lightFolder.add(directionalLight.position, 'y', -10, 10);
lightFolder.add(directionalLight, 'intensity', 0, 2);
lightFolder.open();

// Interaction variables
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };

// Mouse event listeners
window.addEventListener('mousedown', (event) => {
  // Check if the mouse is over the sneaker
  if (sneakerModel) {
    const mouse = new THREE.Vector2(
      (event.clientX / window.innerWidth) * 2 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1
    );
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(sneakerModel, true);

    if (intersects.length > 0) {
      isDragging = true;
    }
  }
});

window.addEventListener('mouseup', () => {
  isDragging = false;
});

window.addEventListener('mousemove', (event) => {
  if (isDragging && sneakerModel) {
    const deltaX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
    const deltaY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

    // Rotate the sneaker based on mouse movement
    sneakerModel.rotation.y += deltaX * 0.01; // Adjust rotation sensitivity
    sneakerModel.rotation.x += deltaY * 0.01; // Adjust rotation sensitivity
  }
});

// Animation loop
function animate() {
  controls.update(); // Update OrbitControls
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();

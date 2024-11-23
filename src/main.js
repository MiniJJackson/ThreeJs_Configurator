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


// Camera setup
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 2, 7);
camera.lookAt(0, 0, 0);

// Controls setup
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.maxPolarAngle = Math.PI / 2; // Prevent orbiting below the horizontal plane
controls.update();

// Lighting setup
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 7.5);
directionalLight.castShadow = true;
scene.add(directionalLight);

// responsive window
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Load a 3D GLTF object to replace the circle

const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load('/textures/blueVelvet.jpg'); 

// Load the GLTF model
const standLoader = new GLTFLoader().setPath('/models/statue_stand/');

let groundModel;

standLoader.load('scene.gltf', (gltf) => { 
  groundModel = gltf.scene;
  groundModel.scale.set(1, 1, 1); // Adjust the scale of the model
  groundModel.position.set(0, -0.8, 0); // Slightly raise it above the ground

  // Traverse through the model to apply the texture to all meshes
  groundModel.traverse((child) => {
    if (child.isMesh) {
      child.material.map = texture; // Assign the texture to the material
      child.material.needsUpdate = true; // Ensure the material updates with the new texture
    }
  });

  scene.add(groundModel);

  console.log("Stand with texture loaded");
});

// Load model GLTF and make it hover
const loader = new GLTFLoader().setPath('/models/pschoboy_sneaker/');
let sneakerModel;
let hoverDirection = 1;
let hoverSpeed = 0.002;
let hoverHeight = 0.3;

loader.load('scene.gltf', (gltf) => {
  sneakerModel = gltf.scene;
  sneakerModel.scale.set(0.08, 0.08, 0.08);
  sneakerModel.position.set(0, 0.4, 0);
  scene.add(sneakerModel);
  console.log("Model loaded");
});

// traverse through the model to know which layers are in the model
loader.load('scene.gltf', (gltf) => {
  gltf.scene.traverse((child) => {
    //console.log(child.name);
  });
});


// Raycaster 
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let currentIntersect = null;

// mouse click
window.addEventListener('click', (event) => {
  // raycatser
  raycaster.setFromCamera(mouse, camera);

  // intersect objects
  const intersects = raycaster.intersectObjects(scene.children, true);
  const firstIntersect = intersects[0];
  
  // if name = Object_3
  if (firstIntersect && firstIntersect.object.name === "Object_3") {
    //alert('You clicked on the astronaut');
    // current intersect
    currentIntersect = firstIntersect;
    // gsap animate Z position towards object
    gsap.to(camera.position, {
      z: 2,
      y: 1,
      duration: 1,
    });

    // gsap animate .colors bottom to 0
    gsap.to('.colors', {
      bottom: 0,
      duration: 1,
    });
  }

});

// mouse move
window.addEventListener('mousemove', (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
  //console.log(mouse);
});

// dat.GUI
const gui = new dat.GUI();
const lightFolder = gui.addFolder('Light Settings');
lightFolder.add(directionalLight.position, 'x', -10, 10);
lightFolder.add(directionalLight.position, 'y', -10, 10);
lightFolder.add(directionalLight, 'intensity', 0, 2);
lightFolder.close();

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  // Update hover animation for the sneaker model
  if (sneakerModel) {
    sneakerModel.position.y += hoverSpeed * hoverDirection;
    if (sneakerModel.position.y >= 0.4 + hoverHeight || sneakerModel.position.y <= 0.4) {
      hoverDirection *= -1;
    }
  }

  // Render the scene
  renderer.render(scene, camera);

  // Update controls
  controls.update();
}

animate();

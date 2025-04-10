import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Configuration and Initialization
const voxelSize = 1;
const materials = JSON.parse(localStorage.getItem('materials'));
const simulationSettings = JSON.parse(localStorage.getItem('simulationSettings'));
const pointsXY = parseInt(simulationSettings.pointsXY);
const pointsZ = parseInt(simulationSettings.pointsZ);

let mapData;
const voxelSpace = Array.from({ length: pointsXY }, () => 
  Array.from({ length: pointsXY }, () => Array(pointsZ).fill(0))
);

let scene, camera, renderer, controls;

/**
 * Initializes the Three.js scene, camera, renderer, and controls.
 */
function initializeScene() {
  const container = document.getElementById('container');
  container.children[0].style.display = "none"

  // Scene setup
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff);

  // Camera setup
  camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.set(pointsXY/2, pointsXY/2, pointsXY/2);
  camera.lookAt(pointsXY/2,0,pointsXY/2);

  // Renderer setup
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  // Lighting setup
  scene.add(new THREE.AmbientLight(0xffffff, 1.5));
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
  directionalLight.position.set(5, 10, 7.5);
  scene.add(directionalLight);

  // Controls setup
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.1;

  // Animation loop
  const animate = () => {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  };

  animate();
}

/**
 * Clears all objects from the scene.
 */
function clearScene() {
  while (scene.children.length > 0) {
    const object = scene.children[0];
    if (object.isMesh) {
      object.geometry.dispose();
      object.material.dispose();
    }
    scene.remove(object);
  }
}

/**
 * Adds a voxel to the scene.
 * @param {number} x - X coordinate.
 * @param {number} y - Y coordinate.
 * @param {number} z - Z coordinate.
 * @param {string} color - Hexadecimal color code.
 */
function addVoxel(x, y, z, color) {
  const geometry = new THREE.BoxGeometry(voxelSize, voxelSize, voxelSize);
  const material = new THREE.MeshBasicMaterial({ color: new THREE.Color(color) });
  const voxel = new THREE.Mesh(geometry, material);

  voxel.position.set(x,z,y)

  scene.add(voxel);
}

/**
 * Renders voxels based on the provided data.
 * @param {object} data - Voxel data containing positions and colors.
 */
function renderVoxels(data) {
  clearScene();

  data.voxels.forEach((voxel) => {
    const material = materials.find((m) => m.color === voxel.c);
    let x = voxel.x + Math.floor(pointsXY / 2)
    let y = voxel.y + Math.floor(pointsXY / 2)
    const vins = (x < pointsXY && x >= 0 && y < pointsXY && y >= 0 && voxel.z < pointsXY && voxel.z >= 0)
    if (material && vins) {
      addVoxel(voxel.x, voxel.y, voxel.z, voxel.c);
      try {
        voxelSpace[x][y][voxel.z] = material.id;
      } catch (e) {
      }
    } else {
      //console.warn(`Material not found for voxel color: ${voxel.c}`);
    }
  });

  localStorage.setItem('voxelSpace', JSON.stringify(voxelSpace));
}

/**
 * Handles file upload to update voxel data and re-render the scene.
 */
function setupFileUpload() {
  const fileInput = document.getElementById('mapInput');

  fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const jsonData = JSON.parse(e.target.result);
          mapData = jsonData;

          if (!scene) {
            initializeScene();
          }

          renderVoxels(mapData);
        } catch (error) {
          console.error('Error parsing JSON file:', error);
          alert('Invalid JSON file.');
        }
      };

      document.getElementById("mapFileInputURL").innerHTML = file.name
      reader.readAsText(file);
    }
  });
}

// Initialize file upload handling
setupFileUpload();

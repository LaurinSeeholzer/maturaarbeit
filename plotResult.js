import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Configuration and Initialization
const voxelSize = 1;
const materials = JSON.parse(localStorage.getItem('materials'));
const simulationSettings = JSON.parse(localStorage.getItem('simulationSettings'));
const pointsXY = parseInt(simulationSettings.pointsXY);
const pointsZ = parseInt(simulationSettings.pointsZ);

var voxelMap = new Map();
const voxelSpace = JSON.parse(localStorage.getItem('voxelSpace'))
let scene, camera, renderer, controls;

document.getElementById("runSimulation").addEventListener("click", initializeScene)

/**
 * Initializes the Three.js scene, camera, renderer, and controls.
 */
function initializeScene() {
  const container = document.getElementById('resultContainer');

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

  renderVoxels();

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

  voxel.position.set(x-pointsXY/2,z,y-pointsXY/2)

  voxelMap.set(`${x},${y},${z}`, voxel);

  scene.add(voxel);
}

/**
 * Renders voxels based on the provided data.
 * @param {object} data - Voxel data containing positions and colors.
 */
function renderVoxels() {
    for (let x = 0; x < pointsXY; x++) {
        for (let y = 0; y < pointsXY; y++) {
            for (let z = 0; z < pointsZ; z++) {
                if (voxelSpace[x][y][z] != 0) {
                    addVoxel(x,y,z, "#ffffff")
                }
            }
        }
    }
}

function mapTemperaturesToColors(temperatureArray) {

    let min = Infinity;
    let max = -Infinity;
  
    temperatureArray.forEach((layer) => {
      layer.forEach((row) => {
        row.forEach((value) => {
          if (value < min) min = value;
          if (value > max) max = value;
        });
      });
    });

    const hex = ['0','1','2','3','4','5','6','7','8','9',"A","B","C","D","E","F"]

    const colorsArray = temperatureArray.map((layer) =>
      layer.map((row) =>
        row.map((temp) => {
          const normalizedValue = ((temp - min) / (max - min));
          const r = Math.floor(255 * Math.max(0, (normalizedValue - 0.5) * 2)); // Red increases after 0.5
          const g = Math.floor(255 * (1 - Math.abs(normalizedValue - 0.5) * 2)); // Green peaks at 0.5
          const b = Math.floor(255 * Math.max(0, (0.5 - normalizedValue) * 2)); // Blue decreases after 0.5
          return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
        })
      )
    );

    return colorsArray;
  }

function updateVoxels() {

    const temperatureArray = JSON.parse(localStorage.getItem("simulationResult"))
    const colorsArray = mapTemperaturesToColors(temperatureArray)

    localStorage.setItem("colorsArray", JSON.stringify(colorsArray))

    for (let x = 0; x < pointsXY; x++) {
        for (let y = 0; y < pointsXY; y++) {
            for (let z = 0; z < pointsZ; z++) {
                try {
                    let voxel = voxelMap.get(`${x},${y},${z}`)
                    voxel.material.color = new THREE.Color(colorsArray[x][y][z])

                    voxel.material.needsUpdate = true;
                } catch {
                    
                }
            }
        }
    }

    renderer.render(scene, camera)
}

function componentToHex(c) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}


window.updateVoxels = updateVoxels;
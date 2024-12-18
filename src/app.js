// src/app.js

import {
  Viewer,
  Cartesian3,
  Cesium3DTileset,
  Ion,
  Cartographic,
  Math as CesiumMath,
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
  Color,
  HeightReference,
  VerticalOrigin,
  Entity,
} from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';
import './css/main.css';
import { Buffer } from 'buffer';

// Import your icon images
import icon1 from './assets/icons/icon1.png';
import icon2 from './assets/icons/icon2.png';


window.Buffer = Buffer;

// Set Cesium Ion access token
Ion.defaultAccessToken = process.env.CESIUM_ION_ACCESS_TOKEN;

// Initialize the Cesium Viewer
const viewer = new Viewer('cesiumContainer', {
  timeline: false,
  animation: false,
  sceneModePicker: false,
  baseLayerPicker: false,
  geocoder: true,
  homeButton: false,
});

// Set up the Cesium scene and camera
const { scene, camera } = viewer;
scene.verticalExaggeration = 3.0;
camera.setView({
  destination: new Cartesian3(-2215372.824, -3754338.187, 4642735.146),
  orientation: {
    heading: 50.794062761901799,
    pitch: -0.30293409742984756,
    roll: 0.0009187098191985044,
  },
});

scene.skyAtmosphere.show = true;

// Function to show the iframe overlay
function showIframe(url) {
  const iframeOverlay = document.getElementById('iframeOverlay');
  const infoIframe = document.getElementById('infoIframe');
  if (iframeOverlay && infoIframe) {
    infoIframe.src = url;
    iframeOverlay.style.display = 'flex';
  }
}

// Function to hide the iframe overlay and unselect the box
function hideIframe() {
  const iframeOverlay = document.getElementById('iframeOverlay');
  const infoIframe = document.getElementById('infoIframe');
  if (iframeOverlay && infoIframe) {
    iframeOverlay.style.display = 'none';
    infoIframe.src = '';
    // Unselect any selected entity
    viewer.selectedEntity = null;
  }
}

// Close iframe button event listener
const closeIframeButton = document.getElementById('closeIframe');
if (closeIframeButton) {
  closeIframeButton.addEventListener('click', hideIframe);
}

// Function to set up the real-time coordinate display
function setupCoordinateDisplay() {
  viewer.scene.camera.moveEnd.addEventListener(() => {
    const cartesian = viewer.camera.positionWC;
    const cartographic = Cartographic.fromCartesian(cartesian);
    const longitude = CesiumMath.toDegrees(cartographic.longitude);
    const latitude = CesiumMath.toDegrees(cartographic.latitude);
    const height = cartographic.height;

    const coordinatesDisplay = document.getElementById('coordinatesDisplay');
    if (coordinatesDisplay) {
      coordinatesDisplay.innerHTML = `
        <strong>Cartesian Coordinates:</strong><br>
        X: ${cartesian.x.toFixed(3)}<br>
        Y: ${cartesian.y.toFixed(3)}<br>
        Z: ${cartesian.z.toFixed(3)}<br><br>
        <strong>Geographic Coordinates:</strong><br>
        Longitude: ${longitude.toFixed(6)}°<br>
        Latitude: ${latitude.toFixed(6)}°<br>
        Height: ${height.toFixed(2)} meters
      `;
    }
  });
}

// Function to initialize a building and its clickable box with icons
/**
 * Initializes a building by loading its tileset and creating a clickable box with icons.
 * @param {number} ionAssetId - The Cesium Ion asset ID for the 3D tileset.
 * @param {Cartesian3} boxPosition - The position of the clickable box.
 * @param {Cartesian3} boxDimensions - The dimensions of the clickable box.
 * @param {string} iframeUrl - The URL to load in the iframe upon click.
 */
async function initializeBuilding(ionAssetId, boxPosition, boxDimensions, iframeUrl) {
  try {
    // Load the tileset from Cesium Ion
    const tileset = await Cesium3DTileset.fromIonAssetId(ionAssetId);
    scene.primitives.add(tileset);

    // Optionally adjust tileset properties (e.g., modelMatrix, scale) here
    // tileset.modelMatrix = ...;
    // tileset.scale = ...;

    // Create a clickable box entity
    const clickableBox = viewer.entities.add({
      position: boxPosition,
      box: {
        dimensions: boxDimensions,
        material: Color.WHITE.withAlpha(0.901), // Invisible box
        outline: false,
      },
      properties: {
        name: `Building ${ionAssetId}`,
      },
    });

    // Define icon positions relative to the box - above the hitbox 
    //take the difference between the coordinates of where we want it and the position of the box
    const iconOffsets = [
      new Cartesian3((-2214143.982)- boxPosition.x,
                    (-3753795.455) - boxPosition.y ,
                    (4643989.822)- boxPosition.z), // Center top
    ];

    // Array of icon image paths
    const icons = [icon1, icon2]; // Add as many icons as needed

    // Add billboard entities for each icon
    const iconEntities = iconOffsets.map((offset, index) => {
      return viewer.entities.add({
        position: Cartesian3.add(boxPosition, offset, new Cartesian3()),
        billboard: {
          image: icons[index % icons.length], // Cycle through icons if more icons than offsets
          verticalOrigin: VerticalOrigin.TOP,
          heightReference: HeightReference.CLAMP_TO_3D_TILE,
          scale: 0.1, // Adjust scale as needed
          color: Color.WHITE.withAlpha(0.8),
        },
        properties: {
          parentBox: clickableBox,
          iconType: `icon${index + 1}`, // e.g., 'icon1', 'icon2', etc.
        },
      });
    });

    // Set up click handler for the box and its icons
    const handler = new ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction((click) => {
      const pickedObject = viewer.scene.pick(click.position);
      if (pickedObject) {
        if (pickedObject.id === clickableBox) {
          viewer.selectedEntity = clickableBox;
          showIframe(iframeUrl);
        } else if (iconEntities.includes(pickedObject.id)) {
          const iconType = pickedObject.id.properties.iconType.getValue();
          // Perform different actions based on iconType
          if (iconType === 'icon1') {
            showIframe('https://example.com/icon1-info'); // Replace with your URL
          } else if (iconType === 'icon2') {
            showIframe('https://example.com/icon2-info'); // Replace with your URL
          } else if (iconType === 'icon3') {
            showIframe('https://example.com/icon3-info'); // Replace with your URL
          }
          // Add more conditions as needed
        }
      }
    }, ScreenSpaceEventType.LEFT_CLICK);

    // Hide loading overlay if present
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) loadingOverlay.style.display = 'none';
  } catch (error) {
    console.error(`Error initializing building with Ion Asset ID ${ionAssetId}: ${error}`);
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) loadingOverlay.innerHTML = 'Failed to load tileset.';
  }
}

// Function to load multiple buildings
async function loadBuildings() {
    // Load the 3Dtileset from Cesium Ion
  const tileset = await Cesium3DTileset.fromIonAssetId(2275207);
  scene.primitives.add(tileset);

  // Example data for buildings
  const buildings = [

    {
      ionAssetId: 2770811,
      boxPosition: new Cartesian3(-2213992.200, -3753500.070, 4643615.175),
      boxDimensions: new Cartesian3(100.0, 100.0, 670.0),
      iframeUrl: 'https://my.matterport.com/show/?m=cJnnkSvYtEB', // Replace with your URL
    },
    // Add more buildings as needed
  ];

  // Show loading overlay before starting
  const loadingOverlay = document.getElementById('loadingOverlay');
  if (loadingOverlay) loadingOverlay.style.display = 'flex';

  // Initialize each building
  for (const building of buildings) {
    await initializeBuilding(
      building.ionAssetId,
      building.boxPosition,
      building.boxDimensions,
      building.iframeUrl
    );
  }
}

// Initialize all functionalities
async function initializeApp() {
  await loadBuildings();
  setupCoordinateDisplay();
}

// Start the application
initializeApp();

// src/app.js

import {
  Viewer,
  Cartesian3,
  Cesium3DTileset,
  Ion,
  knockout,
  SingleTileImageryProvider,
  Rectangle,
} from 'cesium';
import './css/main.css';

// Set the Cesium Ion access token from environment variables
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

// Destructure scene and camera for convenience
const { scene, camera } = viewer;
scene.verticalExaggeration = 3.0;

// Set the initial camera view
camera.setView({
  destination: new Cartesian3(
    -2710292.813384663,
    -4360657.061518585,
    3793571.786860543
  ),
  orientation: {
    heading: 5.794062761901799,
    pitch: -0.30293409742984756,
    roll: 0.0009187098191985044,
  },
});

// Enable rendering the sky
scene.skyAtmosphere.show = true;

// Asynchronously add Photorealistic 3D Tileset
(async () => {
  try {
    const tileset = await Cesium3DTileset.fromIonAssetId(2275207); // Replace with your asset ID
    scene.primitives.add(tileset);

    // Hide the loading overlay once done
    document.getElementById('loadingOverlay').style.display = 'none';
  } catch (error) {
    console.error(`Error loading 3D Tileset.\n${error}`);
    // Optionally display an error message to the user
    document.getElementById('loadingOverlay').innerHTML = 'Failed to load tileset.';
  }
})();

// ViewModel for toolbar controls
const viewModel = {
  exaggeration: scene.verticalExaggeration,
  relativeHeight: scene.verticalExaggerationRelativeHeight || 0,
};

function updateExaggeration() {
  scene.verticalExaggeration = Number(viewModel.exaggeration);
  scene.verticalExaggerationRelativeHeight = Number(viewModel.relativeHeight);
}

// Apply knockout bindings
knockout.track(viewModel);
const toolbarElement = document.getElementById('toolbar');
knockout.applyBindings(viewModel, toolbarElement);

// Subscribe to changes in the ViewModel
for (const name in viewModel) {
  if (viewModel.hasOwnProperty(name)) {
    knockout.getObservable(viewModel, name).subscribe(updateExaggeration);
  }
}

// Function to add a gray overlay with 30% opacity using Imagery Layer
function addGrayOverlay() {
  // Create a 1x1 pixel canvas with semi-transparent gray color
  const grayCanvas = document.createElement('canvas');
  grayCanvas.width = 1;
  grayCanvas.height = 1;
  const context = grayCanvas.getContext('2d');
  context.fillStyle = 'rgba(128, 128, 128, 0.3)'; // Gray color with 30% opacity
  context.fillRect(0, 0, 1, 1);

  const grayImageryProvider = new SingleTileImageryProvider({
    url: grayCanvas.toDataURL(),
    rectangle: Rectangle.MAX_VALUE, // Covers the entire globe
  });

  // Add the imagery layer
  const grayImageryLayer = viewer.imageryLayers.addImageryProvider(grayImageryProvider);
  grayImageryLayer.alpha = 1.0; // Fully apply the opacity from the image
  grayImageryLayer.brightness = 1.0;
}

// Call the function to add the gray overlay
addGrayOverlay();

// Event listener to capture coordinates after a search is performed
viewer.scene.camera.moveEnd.addEventListener(() => {
  const cartesian = viewer.camera.positionWC;
  const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
  const longitude = Cesium.Math.toDegrees(cartographic.longitude);
  const latitude = Cesium.Math.toDegrees(cartographic.latitude);
  const height = cartographic.height;

  console.log(`Coordinates: Longitude: ${longitude}, Latitude: ${latitude}, Height: ${height}`);

  // Update the coordinates display
  const coordDisplay = document.getElementById('coordinatesDisplay');
  if (coordDisplay) {
    coordDisplay.innerHTML = `Longitude: ${longitude.toFixed(6)}, Latitude: ${latitude.toFixed(6)}, Height: ${height.toFixed(2)} meters`;
  }
});

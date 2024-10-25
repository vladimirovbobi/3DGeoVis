// src/app.js

import {
  Viewer,
  Cartesian3,
  Cesium3DTileset,
  Ion,
  knockout,
  Cartographic,
  Math as CesiumMath,
} from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css'; // Import Cesium Widgets CSS
import './css/main.css';
import { Buffer } from 'buffer';

// Make Buffer available globally
window.Buffer = Buffer;

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
    -2215372.824,
    -3754338.187,
    4642735.146
  ),
  orientation: {
    heading: 50.794062761901799,
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
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
      loadingOverlay.style.display = 'none';
    }

    // Optionally, show the gray overlay after loading
    // toggleGrayOverlay(true);
  } catch (error) {
    console.error(`Error loading 3D Tileset.\n${error}`);
    // Optionally display an error message to the user
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
      loadingOverlay.innerHTML = 'Failed to load tileset.';
    }
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

// Function to toggle the gray overlay
function toggleGrayOverlay(show) {
  if (show) {
    document.body.classList.add('active-overlay');
  } else {
    document.body.classList.remove('active-overlay');
  }
}

// Example: Show the overlay when a search starts and hide when it ends
function performSearch(query) {
  // Show the gray overlay
  toggleGrayOverlay(true);

  // Perform search operations...
  // Simulate search with a timeout
  setTimeout(() => {
    // After search completes, hide the overlay
    toggleGrayOverlay(false);
  }, 2000); // 2-second delay for demonstration
}

// Example: Trigger search on some event, e.g., form submission
// Assume you have a search form with id 'searchForm'
/*
const searchForm = document.getElementById('searchForm');
if (searchForm) {
  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = e.target.elements['searchInput'].value;
    performSearch(query);
  });
}
*/

// Event listener to capture coordinates after a search is performed or camera movement ends
viewer.scene.camera.moveEnd.addEventListener(() => {
  const cartesian = viewer.camera.positionWC;
  const x = cartesian.x;
  const y = cartesian.y;
  const z = cartesian.z;

  // Compute longitude, latitude, and height
  const cartographic = Cartographic.fromCartesian(cartesian);
  const longitude = CesiumMath.toDegrees(cartographic.longitude);
  const latitude = CesiumMath.toDegrees(cartographic.latitude);
  const height = cartographic.height;

  console.log(`Coordinates: X: ${x}, Y: ${y}, Z: ${z}`);

  // Update the coordinates display
  const coordDisplay = document.getElementById('coordinatesDisplay');
  if (coordDisplay) {
    coordDisplay.innerHTML = `
      <strong>Cartesian Coordinates:</strong><br>
      X: ${x.toFixed(3)}<br>
      Y: ${y.toFixed(3)}<br>
      Z: ${z.toFixed(3)}<br><br>
      <strong>Geographic Coordinates:</strong><br>
      Longitude: ${longitude.toFixed(6)}°<br>
      Latitude: ${latitude.toFixed(6)}°<br>
      Height: ${height.toFixed(2)} meters
    `;
  }
});

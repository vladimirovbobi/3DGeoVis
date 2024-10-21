# GeoVis

## Description
GeoVis is a project that visualizes population data on a 3D globe using CesiumJS. It fetches population data from a JSON file and renders visuals on the globe based on population density. These visuals are dynamic based on the level of zoom the users is viewing.

## Installation
1. **Install Node.js and npm**: If you haven't already, download and install Node.js from [nodejs.org](https://nodejs.org/en). npm will be installed along with Node.js.
2. **Install Dependencies**: Navigate to the project directory in your terminal and run the following command to install the required dependencies:
```
npm install
```

## Usage
1. **Build the Project**: Before starting the development server or deploying, build the project to generate the latest version of the `dist` folder. Run the following command:
```
npm run build
```
This step compiles the source code and assets into the `dist` directory, making it ready for deployment or local hosting.

2. **Start the Development Server**: Run the following command to start the development server:
```
npm start
```

3. **View the Application**: Open your web browser and navigate to `http://localhost:8080` to view the application.

## Additional Notes
- Ensure that you have a valid Cesium Ion access token set in [index.js](/src/index.js) (if you are experiencing issues, it may be because my provided token is no longer active). You can get your own access token at [Cesium](https://cesium.com/).
- The application uses CesiumJS for rendering the 3D globe and requires an internet connection to connect imagery data.
- Customize the visualization by modifying the code in [index.js](/src/index.js).
- Once running, you can view the render at `http://localhost:{PORT}/`. The default port is 8080, but you can also locate your environment within the node terminal that your webpack-dev-server is running.

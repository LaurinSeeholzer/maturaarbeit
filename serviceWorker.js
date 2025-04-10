importScripts('./utils.js')
importScripts('./params.js');
importScripts('./simulation.js');

self.onmessage = event => {
    const { type, data } = event.data;
    
    if (type === 'startSimulation') {
        // Create params object and run simulation
        const params = new Params(
            data.pointsXY, data.pointsZ,
            data.deltaX, data.iterations, data.deltaTime,
            data.initialTemperature, data.date, data.geoLongitude, data.geoLatitude,
            data.radiation, data.albedo, data.emissivity, data.evapotranspirationFactor, data.boundary, data.capacity,
            data.density, data.conductivity, data.maxWindSpeed
        );

        //initialize new simulation
        const simulation = new Simulation();

        // Run simulation
        const result = simulation.run(params);

        // Notify all clients when the simulation is complete
        self.postMessage({ type: 'simulationComplete', result: result });
    }
}

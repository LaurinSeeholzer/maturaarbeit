document.getElementById("runSimulation").addEventListener("click", runSimulation)

function runSimulation() {
    var simulationSettings = JSON.parse(localStorage.getItem("simulationSettings"))
    var materials = JSON.parse(localStorage.getItem("materials"));
    var voxelSpace = JSON.parse(localStorage.getItem("voxelSpace"))

    const pointsXY = parseInt(simulationSettings["pointsXY"]);
    const pointsZ = parseInt(simulationSettings['pointsZ']);
    const deltaX = parseFloat(simulationSettings['deltaX']);
    const iterations = parseInt(simulationSettings['iterations']);
    const deltaTime = parseInt(simulationSettings['deltaTime']);
    const initialTemperature = parseFloat(simulationSettings['initialTemperature']);
    const date = simulationSettings['date'];
    const geoLongitude = parseFloat(simulationSettings['geoLongitude']);
    const geoLatitude = parseFloat(simulationSettings['geoLatitude']);
    const radiation = parseFloat(simulationSettings['radiation']);

    var albedo = Array.from({ length: pointsXY }, () => Array.from({ length: pointsXY }, () => Array(pointsZ).fill(0)));
    var emissivity = Array.from({ length: pointsXY }, () => Array.from({ length: pointsXY }, () => Array(pointsZ).fill(0)));
    var evapotranspirationFactor = Array.from({ length: pointsXY }, () => Array.from({ length: pointsXY }, () => Array(pointsZ).fill(0)));
    var boundary = Array.from({ length: pointsXY }, () => Array.from({ length: pointsXY }, () => Array(pointsZ).fill(false)));
    var capacity = Array.from({ length: pointsXY }, () => Array.from({ length: pointsXY }, () => Array(pointsZ).fill(0)));
    var density = Array.from({ length: pointsXY }, () => Array.from({ length: pointsXY }, () => Array(pointsZ).fill(0)));
    var conductivity = Array.from({ length: pointsXY }, () => Array.from({ length: pointsXY }, () => Array(pointsZ).fill(0)));

    for (let x = 0; x<pointsXY; x++) {
        for (let y = 0; y<pointsXY; y++) {
            for (let z = 0; z<pointsZ; z++) {
                let id = voxelSpace[x][y][z]

                let material = materials.find(obj => obj.id === id);

                albedo[x][y][z] = parseFloat(material.albedo)
                emissivity[x][y][z] = parseFloat(material.emissivity)
                evapotranspirationFactor[x][y][z] = parseFloat(material.evapotranspirationFactor)
                boundary[x][y][z] = (id!=0)
                capacity[x][y][z] = parseFloat(material.capacity)
                density[x][y][z] = parseFloat(material.density)
                conductivity[x][y][z] = parseFloat(material.conductivity)

            }
        }
    }

    const maxWindSpeed = parseFloat(simulationSettings['maxWindSpeed'])

    const message = {
        type: 'startSimulation',
        data: {
            pointsXY, pointsZ, deltaX, iterations, deltaTime,
            initialTemperature, date, geoLongitude, geoLatitude, radiation,
            albedo, emissivity, evapotranspirationFactor, boundary, capacity, density, conductivity, maxWindSpeed
        }
    };

    var lastVoxelUpdate = new Date(date)

    var serviceWorker = new Worker("serviceWorker.js");

    serviceWorker.postMessage(message);

    loadPlot()

    // Listen for the simulation result
    serviceWorker.onmessage = event => {
        const { type, progress, result } = event.data;

        if (type === 'simulationProgress') {
            // Update progress bar or status

            document.getElementById("max").innerHTML = progress.max.toFixed(2) + " \&degC"
            document.getElementById("avg").innerHTML = progress.avg.toFixed(2) + " \&degC"
            document.getElementById("min").innerHTML = progress.min.toFixed(2) + " \&degC"
            document.getElementById("currentDate").innerHTML = progress.currentDate.toLocaleString('de', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(',', '').replace(/\//g, '.')
            
            updatePlot(progress.max, progress.avg, progress.min, progress.tempMap)

            if (progress.currentDate - lastVoxelUpdate >= 3600000) {
                localStorage.setItem("simulationResult", JSON.stringify(progress.tempMap))
                lastVoxelUpdate = progress.currentDate
                updateVoxels();
                update2DPlot(false);
            }
        }

        if (type === 'simulationComplete') {
            localStorage.setItem("simulationResult", JSON.stringify(result))
            updateVoxels();
            update2DPlot(true);
        }
    };
}
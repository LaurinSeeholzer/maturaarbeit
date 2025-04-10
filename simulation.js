/* -----------------------------------------------
/* Author : Laurin Seeholzer
/* MIT license: http://opensource.org/licenses/MIT
/* v2.0.0
/* ----------------------------------------------- */

class Simulation {

    run(params) {

        //set start date and time of simulation
        let currentDate = new Date(params.date);

        //initialize temperature map
        var tempMap = Array.from({ length: params.pointsXY }, () => Array.from({ length: params.pointsXY }, () => Array(params.pointsZ).fill(params.initialTemperature)));

        //determine exposed faces of each voxel
        var exposedFaces = this.getExposedFaces(params)

        //Main Loop
        for (let time = 0; time < params.iterations; time++) {

            //send Status Update to Frontend
            if (time%5==0) {
                let simulationProgress = this.getStats(params, tempMap, currentDate)
                postMessage({type: 'simulationProgress', progress: simulationProgress});
                console.log(time, currentDate)
            }
            //calculate the sun position
            let sunPosition = this.calculateSunPosition(params, currentDate);
            let azimut = sunPosition.azimut
            let elevation = sunPosition.elevation

            //if Sun is over the horizon
            if (elevation > 2) {

                //calculate Map of shadows
                let solarMap = this.calculateSolarMap(params, azimut, elevation);

                //calculate net solar radiation at calculatet elevation angle
                const solarRadiation = Math.abs(sin(elevation) * params.radiation);

                //calculate temperatruechange based on the radiation and shadows
                this.applySolarRadiation(params, solarMap, tempMap, solarRadiation, exposedFaces);

        
            }

            //calculate average Air Temperature around voxels
            var avgAirTemp = this.calculateAvgAirTemp(params, tempMap, exposedFaces)

            //apply Evaporation and Transpiration Cooling to Exposed surfaces
            this.applyEvapotranspirationCooling(params, tempMap, avgAirTemp, exposedFaces)

            //apply heat convection
            this.applyConvectionHeatTransfer(params, tempMap, avgAirTemp, exposedFaces)

            //apply heat diffusion
            tempMap = this.applyHeatDiffusion(params, tempMap);    

            //apply black body radiation
            this.applyBlackBodyRadiation(params, tempMap)

            //update current Date and Time (+ deltaTime)
            this.updateCurrentDate(params, currentDate, time);

        }

        return(tempMap);
    }


    getExposedFaces(params) {

        let exposedFaces = Array.from({ length: params.pointsXY }, () => Array.from({ length: params.pointsXY }, () => Array.from({ length: params.pointsZ }, () => [])));
        
        let directions = [[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]]

        for (let x = 0; x < params.pointsXY; x++) {
            for (let y = 0; y < params.pointsXY; y++) {
                for (let z = 0; z < params.pointsZ; z++) {

                    if (params.boundary[x][y][z]) {

                        for (let [dx, dy, dz] of directions) {
                            const nx = x + dx
                            const ny = y + dy
                            const nz = z + dz;

                            if (nx >= 0 && nx < params.pointsXY && ny >= 0 && ny < params.pointsXY && nz >= 0 && nz < params.pointsZ) {
                                if ( params.boundary[nx][ny][nz] === false) {
                                    exposedFaces[x][y][z].push([dx,dy,dz])
                                }
                            }             
                        }
                        
                    }
                }
            }
        }
    
        return exposedFaces;
    }


    calculateSunPosition(params, currentDate) {
        
        const T = currentDate.getHours() + currentDate.getMinutes() / 60 + currentDate.getSeconds() / 3600;
        const JD = currentDate.getJulian();
        const new_date = new Date(currentDate.getTime());
        new_date.setHours(0, 0, 0, 0);
        const JD_0 = new_date.getJulian();

        const n = JD - 2451545.0;
        const L = 280.460 + 0.9856474 * n;
        const g = 357.528 + 0.9856003 * n;
        const A = L + 1.915 * sin(g) + 0.01997 * sin(2 * g);
        const epsilon = 23.439 - 0.0000004 * n;
        let alpha = cos(A) <= 0 ? atan(cos(epsilon) * tan(A)) + 4 * atan(1) : atan(cos(epsilon) * tan(A));
        const delta = asin(sin(epsilon) * sin(A));
        const T_0 = (JD_0 - 2451545.0) / 36525;
        const O = (6.697376 + 2400.05134 * T_0 + 1.002738 * T) * 15 + params.geoLongitude;
        const theta = O - alpha;

        const an = cos(theta) * sin(params.geoLatitude) - tan(delta) * cos(params.geoLatitude)
        const a = an <= 0 ? (atan(sin(theta) / an) + 360) % 360 : (atan(sin(theta) / an) + 540) % 360;
        const h = asin(cos(delta) * cos(theta) * cos(params.geoLatitude) + sin(delta) * sin(params.geoLatitude));

        const R = 1.02 / tan(h + (10.3 / (h + 5.11)));
        const h_R = h + R / 60;

        let sunPosition = {
            azimut: a,
            elevation: h_R,
        }

        return sunPosition;
    }


    calculateSolarMap(params, azimut, elevation) {

        let solarMap = Array.from({ length: params.pointsXY }, () => Array.from({ length: params.pointsXY }, () => Array(params.pointsZ).fill(false)));

        let deltaXRay = cos(elevation) * sin(azimut)
        let deltaYRay = cos(elevation) * cos(azimut)
        let deltaZRay = sin(elevation)
        
        var maxXRay = params.pointsXY * (Math.sign(deltaXRay) + 1)/2 + deltaXRay * params.pointsZ / deltaZRay
        var maxYRay = params.pointsXY * (Math.sign(deltaYRay) + 1)/2 + deltaYRay * params.pointsZ / deltaZRay
        
        var minXRay = (params.pointsXY + deltaXRay * params.pointsZ / deltaZRay) - maxXRay - Math.sign(deltaXRay)
        var minYRay = (params.pointsXY + deltaYRay * params.pointsZ / deltaZRay) - maxYRay - Math.sign(deltaYRay)
            
        var XRayStep = -0.5 * Math.sign(deltaXRay)
        var YRayStep = -0.5 * Math.sign(deltaYRay)
        
        let x = maxXRay
        let y = maxYRay
        
        while(Math.floor(x) != minXRay) {
            while(Math.floor(y) != minYRay) {
        
                let posx = x;
                let posy = y;
                let posz = params.pointsZ;
        
                while (true) {

                    if (inSpace(posx,posy,posz,params.pointsXY,params.pointsXY,params.pointsZ)) {
                        if (params.boundary[Math.floor(posx)][Math.floor(posy)][Math.floor(posz)]) {
                            solarMap[Math.floor(posx)][Math.floor(posy)][Math.floor(posz)] = true;
                            break
                        }
                    }
        
                    posx -= deltaXRay
                    posy -= deltaYRay
                    posz -= deltaZRay
        
                    if (posz<0) {
                        break
                    }
        
                }

                y += YRayStep
            }

            y = maxYRay
            x+= XRayStep
        }
    
        return solarMap
    }


    applySolarRadiation(params, solarMap, tempMap, solarRadiation) {

        for (let x = 0; x < params.pointsXY; x++) {
            for (let y = 0; y < params.pointsXY; y++) {
                for (let z = 0; z < params.pointsZ; z++) {

                    if (solarMap[x][y][z]) {
                        tempMap[x][y][z] += params.deltaTime * (params.deltaX ** 2 * solarRadiation * (1 - params.albedo[x][y][z]) / (params.capacity[x][y][z] * params.density[x][y][z] * params.deltaX ** 3))
                    }

                }
            }
        }

    }


    calculateAvgAirTemp(params, tempMap, exposedFaces) {

        let newavgAirTemp = Array.from({ length: params.pointsXY }, () => Array.from({ length: params.pointsXY }, () => Array(params.pointsZ).fill(0)));

        for (let x = 0; x < params.pointsXY; x++) {
            for (let y = 0; y < params.pointsXY; y++) {
                for (let z = 0; z < params.pointsZ; z++) {

                    if (params.boundary[x][y][z] && exposedFaces[x][y][z].length > 0) {
                        
                        for (let i = 0; i < exposedFaces[x][y][z].length; i++) {
                            let [dx, dy, dz] = exposedFaces[x][y][z][i]
                            newavgAirTemp[x][y][z] += tempMap[x + dx][y + dy][z + dz]
                        }

                        newavgAirTemp[x][y][z] /= exposedFaces[x][y][z].length
                    }

                }
            }
        }

        return newavgAirTemp;
    }

    
    applyEvapotranspirationCooling(params, tempMap, avgAirTemp, exposedFaces) {

        for (let x = 0; x < params.pointsXY; x++) {
            for (let y = 0; y < params.pointsXY; y++) {
                for (let z = 0; z < params.pointsZ; z++) {

                    if (params.boundary[x][y][z] && exposedFaces[x][y][z].length > 0) {

                        const B = 0.102 * params.maxWindSpeed/ (Math.log(params.deltaX/0.0003) ** 2) / 1000 / 86400
                        const eas = 611 * Math.exp((17.27 * avgAirTemp[x][y][z])/(237.3 + avgAirTemp[x][y][z]))
                        const ea = 0.7 * eas
                        const Ea = B * (eas - ea)
        
                        const lv = 2501000 - 2370 * avgAirTemp[x][y][z]
                        const Er = params.radiation / (lv * 998)
        
                        const d = (4098 *eas) / ((237.3 + avgAirTemp[x][y][z]) ** 2)
                        const E = (d / (d+66.8)) * Er + (66.8/(d+66.8)) * Ea

                        const mass = 1.5 * params.evapotranspirationFactor[x][y][z] * E * params.deltaTime * (params.deltaX ** 2) * 998
                        
                        const q = mass * 2258000
                        
                        tempMap[x][y][z] -= q / (params.capacity[x][y][z] * params.density[x][y][z] * params.deltaX ** 3);

                    }

                }
            }
        }

    }    


    applyConvectionHeatTransfer(params, tempMap, avgAirTemp, exposedFaces) {

        for (let x = 0; x < params.pointsXY; x++) {
            for (let y = 0; y < params.pointsXY; y++) {
                for (let z = 0; z < params.pointsZ; z++) {

                    if(params.boundary[x][y][z] && exposedFaces[x][y][z].length > 0) {
                        
                        const Re = (1.225 * params.maxWindSpeed * 1) / 1.7894e-5;
                        const Pr = (1.7894e-5 * 1005) / 0.0257;
                        const Nu = 0.332 * (Re ** (1 / 2)) * (Pr ** (1 / 3))
                        const h = (Nu * 0.0257) / params.deltaX;
            
                        const Q = h * params.deltaX ** 2 * (tempMap[x][y][z] - avgAirTemp[x][y][z]) * params.deltaTime;
                        tempMap[x][y][z] -= Q / (params.capacity[x][y][z] * params.deltaX ** 3 * params.density[x][y][z])

                    }

                } 
            }
        }

    }


    applyHeatDiffusion(params, tempMap) {

        let newTemp = Array.from({ length: params.pointsXY }, () => Array.from({ length: params.pointsXY }, () => Array(params.pointsZ).fill(0)));

        for (let x = 0; x < params.pointsXY; x++) {
            for (let y = 0; y < params.pointsXY; y++) {
                for (let z = 0; z < params.pointsZ; z++) {

                    const nx = x + 1 === params.pointsXY ? x : x + 1;
                    const px = x - 1 === -1 ? x : x - 1;
                    const ny = y + 1 === params.pointsXY ? y : y + 1;
                    const py = y - 1 === -1 ? y : y - 1;
                    const nz = z + 1 === params.pointsZ ? z : z + 1
                    const pz = z - 1 === -1 ? z : z - 1;

                    const thermalDiffusivity = params.conductivity[x][y][z] / (params.density[x][y][z] * params.capacity[x][y][z]);
                    
                    newTemp[x][y][z] = tempMap[x][y][z] + (thermalDiffusivity * params.deltaTime * (tempMap[nx][y][z] + tempMap[px][y][z] + tempMap[x][ny][z] + tempMap[x][py][z] + tempMap[x][y][nz] + tempMap[x][y][pz]  - 6 * tempMap[x][y][z]) / (params.deltaX ** 2));  
                
                }
            }
        }
        
        return newTemp;
    }

    applyBlackBodyRadiation(params, tempMap) {

        const sBc = 5.67 * (10 ** -8)

        for (let x = 0; x < params.pointsXY; x++) {
            for (let y = 0; y < params.pointsXY; y++) {
                for (let z = 0; z < params.pointsZ; z++) {

                    const Q = 0.05 * params.deltaTime * params.deltaX ** 2 * params.emissivity[x][y][z] * sBc * (tempMap[x][y][z] + 273.15) ** 4
                    const m = params.density[x][y][z] * params.deltaX ** 3
                    tempMap[x][y][z] -= Q / (params.capacity[x][y][z] * m)

                }
            }
        }

    }


    getStats(params, tempMap, currentDate) {
        
        let min = Infinity;
        let max = -Infinity;
        let sum = 0;
        let count = 0;

        let roundedTemp = Array.from({ length: params.pointsXY }, () => Array.from({ length: params.pointsXY }, () => Array(params.pointsZ).fill(0)));

        for (let x = 0; x < params.pointsXY; x++) {
            for (let y = 0; y < params.pointsXY; y++) {
                for (let z = 0; z < params.pointsZ; z++) {

                    if (params.boundary[x][y][z]) {

                        let value = tempMap[x][y][z]

                        min = Math.min(min, value);
                        max = Math.max(max, value);
                        sum += value;
                        count++;

                    }

                    roundedTemp[x][y][z] = Math.round(tempMap[x][y][z] * 10000)/10000
                    
                }
            }
        } 
        
        const avg = count > 0 ? sum / count : 0;

        return {
            max: Math.round(max * 10000) / 10000,
            avg: Math.round(avg * 10000) / 10000,
            min: Math.round(min * 10000) / 10000,
            currentDate: currentDate,
            tempMap: roundedTemp
        }
    }


    updateCurrentDate(params, currentDate) {
        currentDate.setSeconds(currentDate.getSeconds() + params.deltaTime);
    }

}

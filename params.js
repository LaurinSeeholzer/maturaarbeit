/* -----------------------------------------------
/* Author : Laurin Seeholzer
/* MIT license: http://opensource.org/licenses/MIT
/* v2.0.0
/* ----------------------------------------------- */

class Params {
    constructor(pointsXY, pointsZ, deltaX, iterations, deltaTime, initialTemperature, date, geoLongitude, geoLatitude, radiation, albedo, emissivity, evapotranspirationFactor, boundary, capacity, density, conductivity, maxWindSpeed) {

        this.pointsXY = parseInt(pointsXY); //Integer// gridcells in x & y-direction
        this.pointsZ = parseInt(pointsZ); //Integer// gridcells in z-direction
        this.deltaX = parseFloat(deltaX); //Float// length and width of one cell in meters
        
        this.iterations = parseInt(iterations); //Integer// number of iterations
        this.deltaTime = parseInt(deltaTime); //Integer// duration of one iteration in seconds
        
        this.date = new Date(date); //DateTime// date and time of the simulation szenario
        
        this.geoLongitude = parseFloat(geoLongitude); //Float// longitude of simulation location
        this.geoLatitude = parseFloat(geoLatitude); //Float// latittude of simulation location

        this.initialTemperature = parseFloat(initialTemperature); //Float// initial temperature
        
        this.radiation = parseFloat(radiation); //Float// amount of solarradation at an angle of 90 degrees
        this.albedo = albedo; //3D-Array// albedo values for each cell
        this.boundary = boundary; //3D-Array// stores for each cell if it is an obstacle
        
        this.capacity = capacity; //3D-Array// specific heat capacity of each cell
        this.density = density; //3D-Array// material density of each cell
        this.conductivity = conductivity; //3D-Array// thermal conductivity of each cell

        this.emissivity = emissivity; //3D-Array// emissivity values for each cell
        
        this.evapotranspirationFactor = evapotranspirationFactor; //3D-Array// amount of Biomass / Evapotranspiration (0-1)
        
        this.maxWindSpeed = parseFloat(maxWindSpeed); //Float// maximum WindSpeed used to scale fluidproperties
    }
}

// Object to hold form data
var simulationSettings = JSON.parse(localStorage.getItem("simulationSettings"))

if (simulationSettings === null || simulationSettings === undefined) {
    fetch('./preset/settings.json')
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to fetch JSON: ${response.status}`);
        }
        return response.json(); // Parse the JSON
      })
      .then(jsonData => {
        simulationSettings = jsonData;
        localStorage.setItem("simulationSettings", JSON.stringify(simulationSettings));
        updateFormWithData();
      })
      .catch(error => {
        console.error('Error loading JSON:', error);
      });
} else {
    updateFormWithData();
}

// Function to handle input changes and update simulationSettings
function handleInputChange(event) {
    const { id, value, type } = event.target;
    simulationSettings[id] = type === 'number' ? parseFloat(value) : value;
    localStorage.setItem("simulationSettings", JSON.stringify(simulationSettings))

    if (id === "date") {
        let d = new Date (simulationSettings.date)
        document.getElementById("currentDate").innerHTML = d.toLocaleString('de', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(',', '').replace(/\//g, '.')
    } else if (id === "initialTemperature")  {
        document.getElementById("max").innerHTML = simulationSettings.initialTemperature.toFixed(2) + " \&degC"
        document.getElementById("avg").innerHTML = simulationSettings.initialTemperature.toFixed(2) + " \&degC"
        document.getElementById("min").innerHTML = simulationSettings.initialTemperature.toFixed(2) + " \&degC"
    }
}

// Attach event listeners to input fields
document.querySelectorAll('.settingsinput').forEach(input => {
    input.addEventListener('blur', handleInputChange);
});

// Handle file upload and parse the uploaded JSON file
function handleFileChange(file) {
    const reader = new FileReader();
    reader.onload = function(event) {
        const uploadedData = JSON.parse(event.target.result);
        Object.assign(simulationSettings, uploadedData);
        localStorage.setItem("simulationSettings", JSON.stringify(simulationSettings))
        updateFormWithData();
    };
    reader.readAsText(file);
}

// Updates the form fields with the values from simulationSettings
function updateFormWithData() {
    for (let key in simulationSettings) {
        let input = document.getElementById(key);
        if (input) {
            input.value = simulationSettings[key];
        }
    }

    let d = new Date (simulationSettings.date)

    document.getElementById("max").innerHTML = simulationSettings.initialTemperature.toFixed(2) + " \&degC"
    document.getElementById("avg").innerHTML = simulationSettings.initialTemperature.toFixed(2) + " \&degC"
    document.getElementById("min").innerHTML = simulationSettings.initialTemperature.toFixed(2) + " \&degC"
    document.getElementById("currentDate").innerHTML = d.toLocaleString('de', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(',', '').replace(/\//g, '.')

}

// Handle file input and trigger the upload on click
document.getElementById('fileinputSettings').addEventListener('change', (event) => {
    handleFileChange(event.target.files[0]);
});

// Trigger the file input for file upload
document.getElementById('uploadSettings').addEventListener('click', () => {
    document.getElementById('fileinputSettings').click();
});

// Function to download simulation settings as JSON
function downloadSimulationSettings() {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(simulationSettings));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'simulation-settings.json');
    downloadAnchor.click();
}

// Attach download simulation button functionality
document.getElementById('downloadSettings').addEventListener('click', downloadSimulationSettings);


var materials = JSON.parse(localStorage.getItem("materials"));

if (materials === null || materials === undefined) {
  fetch('./preset/materials.json')
    .then(response => {
      if (!response.ok) {
        throw new Error(`Failed to fetch JSON: ${response.status}`);
      }
      return response.json(); // Parse the JSON
    })
    .then(jsonData => {
      materials = jsonData;
      localStorage.setItem("materials", JSON.stringify(materials));
      updateMaterialsTable();
    })
    .catch(error => {
      console.error('Error loading JSON:', error);
    });
} else {
  updateMaterialsTable();
}


// Handle form submission
document.getElementById('materialForm').addEventListener('click', function (e) {
  e.preventDefault();

  const id = Math.floor(Date.now() / 100);
  const name = document.getElementById('name').value;
  const albedo = document.getElementById('albedo').value;
  const emissivity = document.getElementById('emissivity')
  const evapotranspirationFactor = document.getElementById('evapotranspirationFactor').value;
  const capacity = document.getElementById('capacity').value;
  const density = document.getElementById('density').value;
  const conductivity = document.getElementById('conductivity').value;
  const color = document.getElementById('color').value;

  const newMaterial = {
    id: parseInt(id),
    name: name,
    albedo: parseFloat(albedo),
    emissivity: parseFloat(emissivity),
    evapotranspirationFactor: parseFloat(evapotranspirationFactor),
    capacity: parseFloat(capacity),
    density: parseFloat(density),
    conductivity: parseFloat(conductivity),
    color: color
  };

  materials.push(newMaterial);
  updateMaterialsTable();
});

// Handle file upload
document.getElementById('uploadMaterials').addEventListener('change', function (e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (event) {
      try {
        const uploadedMaterials = JSON.parse(event.target.result);
        if (Array.isArray(uploadedMaterials)) {
          // Merge the uploaded materials with the existing ones
          materials = materials.concat(uploadedMaterials);
          updateMaterialsTable();
        } else {
          alert("Invalid file format. Please upload a valid JSON file.");
        }
      } catch (error) {
        alert("Error parsing JSON file.");
      }
    };
    reader.readAsText(file);
  }
});

document.getElementById('downloadMaterials').addEventListener('click', function () {
    const materialsJSON = JSON.stringify(materials, null, 2);

    const blob = new Blob([materialsJSON], { type: "application/json" });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'materials.json';
    link.click();

    URL.revokeObjectURL(link.href);
});

function updateMaterialsTable() {
  const tableBody = document.getElementById('materialsList');
  const materialSelection = document.getElementById('materialSelection');
  tableBody.innerHTML = ''; 

  materials.forEach((mat, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td class="whitespace-nowrap px-2 py-2 text-sm text-gray-900">${mat.name}</td>
      <td class="whitespace-nowrap px-2 py-2 text-sm text-gray-500">${mat.color}</td>
      <td class="whitespace-nowrap px-2 py-2 text-sm text-gray-500">${mat.density}</td>
      <td class="whitespace-nowrap px-2 py-2 text-sm text-gray-500">${mat.albedo}</td>
      <td class="whitespace-nowrap px-2 py-2 text-sm text-gray-500">${mat.emissivity}</td>
      <td class="whitespace-nowrap px-2 py-2 text-sm text-gray-500">${mat.capacity}</td>
      <td class="whitespace-nowrap px-2 py-2 text-sm text-gray-500">${mat.conductivity}</td>
      <td class="whitespace-nowrap px-2 py-2 text-sm text-gray-500">${mat.evapotranspirationFactor}</td>
      <td onClick="deleteMaterial(${index})" class="relative whitespace-nowrap py-2 pl-3 pr-4 text-right text-sm font-medium sm:pr-0 text-accentcolor">
        delete
      </td>
    `;
    tableBody.appendChild(row);
  });

  localStorage.setItem("materials", JSON.stringify(materials));
}

function deleteMaterial(index) {
  materials.splice(index, 1);
  updateMaterialsTable();
}

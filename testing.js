function setupFileUpload() {
    const fileInput = document.getElementById('compareInput');
  
    fileInput.addEventListener('change', (event) => {
      const file = event.target.files[0];

      if (file) {
        const reader = new FileReader();
  
        reader.onload = (e) => {
          try {
            const jsonData = JSON.parse(e.target.result);
            const tempMap = jsonData;

            localStorage.setItem("compareMap", JSON.stringify(tempMap))

            const heatMap = arrayToColorScaleHex(tempMap, "rgb")

            const div = document.getElementById('compareDisplay');
            div.innerHTML = '<canvas id="compareCanvas" class="mx-auto max-w-96 w-full aspect-square"></canvas>'
            const canvas = document.getElementById('compareCanvas');
            const ctx = canvas.getContext('2d');
        
            // Set canvas size based on the heatmap dimensions
            const cellSize = 5; // Each cell is 50x50 pixels
            canvas.width = heatMap[0].length * cellSize;
            canvas.height = heatMap.length * cellSize;
        
            // Render the heat map
            heatMap.forEach((row, x) => {
              row.forEach((value, y) => {
                ctx.fillStyle = value;
                ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
              });
            });

          } catch (error) {
            console.error('Error parsing JSON file:', error);
            alert('Invalid JSON file.');
          }
        };
  
        document.getElementById("compareFileInputURL").innerHTML = file.name
        reader.readAsText(file);
      }
    });
  }
  
  // Initialize file upload handling
  setupFileUpload();
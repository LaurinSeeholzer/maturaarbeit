var plotData;

function loadPlot() {
    plotData = [
      {
          x: [1],
          y: [37],
          mode: 'lines',
          line: {
            dash: 'solid',
            color: 'rgb(0,0,0)',
            width: 4
          }
      },
      {
          x: [1],
          y: [37],
          mode: 'lines',
          line: {
            dash: 'dashdot',
            color: 'rgb(0,0,0)',
            width: 4
          }
      },
      {
          x: [1],
          y: [37],
          mode: 'lines',
          line: {
            dash: 'dot',
            color: 'rgb(0,0,0)',
            width: 4
          }
      },
  ]
  Plotly.newPlot('plot', plotData, layout={showlegend: false});
}
  
function updatePlot(max, avg, min, tempMap) {

    plotData[0].y.push(max)
    plotData[0].x.push(plotData[0].x.length + 1)

    plotData[1].y.push(avg)
    plotData[1].x.push(plotData[1].x.length + 1)

    plotData[2].y.push(min)
    plotData[2].x.push(plotData[2].x.length + 1)

    Plotly.animate('plot', {
      data: plotData,
      traces: [0,1,2],
      layout: {showlegend: false}
    })
}

var pointsXY = JSON.parse(localStorage.getItem("simulationSettings")).pointsXY
var pointsZ = JSON.parse(localStorage.getItem("simulationSettings")).pointsZ
var compareMap = JSON.parse(localStorage.getItem("compareMap"))
var voxelSpace = JSON.parse(localStorage.getItem("voxelSpace"))

function update2DPlot(done) {
  const tempMap3d = JSON.parse(localStorage.getItem("simulationResult"))
  let tempMap =  Array.from({ length: pointsXY }, () => Array(pointsXY).fill(0));
  let diffMap = Array.from({ length: pointsXY }, () => Array(pointsXY).fill(0));

  for (let x = 0; x < pointsXY; x++) {
    for (let y = 0; y < pointsXY; y++) {
        for (let z = 0; z < pointsZ; z++) {
          if (voxelSpace[x][y][z]!= 0) {
            tempMap[x][y] = tempMap3d[x][y][z]
            diffMap[x][y] = tempMap3d[x][y][z] - compareMap[x][y]
          } else {
            break;
          }
        }
    }
  }

  if(done) {
    const jsonStr = JSON.stringify(tempMap, null, 2); // Convert array to JSON string
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement("a");
    a.href = url;
    a.download = "result.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    URL.revokeObjectURL(url);
  }

  const heatMapCompare = arrayToColorScaleHex(compareMap, "rgb")
  const heatMapDiff = arrayToColorScaleHex(diffMap, "g")
  const heatMap = arrayToColorScaleHex(tempMap, "heat")

  const canvas1 = document.getElementById('compareCanvasResult');
  const canvas2 = document.getElementById('diffCanvasResult');
  const canvas3 = document.getElementById('originalCanvasResult');
  const ctx1 = canvas1.getContext('2d');
  const ctx2 = canvas2.getContext('2d');
  const ctx3 = canvas3.getContext('2d');

  const cellSize = 5;

  canvas1.width = pointsXY * cellSize;
  canvas1.height = pointsXY * cellSize;
  canvas2.width = pointsXY * cellSize;
  canvas2.height = pointsXY * cellSize;
  canvas3.width = pointsXY * cellSize;
  canvas3.height = pointsXY * cellSize;

  for (let x = 0; x < pointsXY; x++) {
    for (let y = 0; y < pointsXY; y++) {
        ctx1.fillStyle = heatMapCompare[x][y];
        ctx2.fillStyle = heatMapDiff[x][y];
        ctx3.fillStyle = heatMap[x][y];

        ctx1.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        ctx2.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        ctx3.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
    }
  }
}
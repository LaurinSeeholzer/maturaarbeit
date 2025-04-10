function arrayToColorScaleHex(array, mode) {

    if(mode=="g") {
      var narray = Array.from({ length: 100 }, () => Array.from({ length: 100 }).fill(0));
      for (let x = 0; x<100; x++) {
        for (let y = 0; y<100; y++) {
          narray[x][y] = Math.abs(array[x][y])
        }
      }
    } else {
      var narray = array
    }

    // Find the min and max values in the array
    let flatArray = narray.flat();

    const minValue = Math.min(...flatArray);
    const maxValue = Math.max(...flatArray);

    if(mode=="g"){console.log(minValue,maxValue)}


    // Normalize a value between 0 and 1
    const normalize = (value) => (value - minValue) / (maxValue - minValue);
  
    // Map a normalized value (0 to 1) to a blue-green-red gradient in hex
    const rgbScale = (normalizedValue) => {
      const r = Math.floor(255 * Math.max(0, (normalizedValue - 0.5) * 2)); // Red increases after 0.5
      const g = Math.floor(255 * (1 - Math.abs(normalizedValue - 0.5) * 2)); // Green peaks at 0.5
      const b = Math.floor(255 * Math.max(0, (0.5 - normalizedValue) * 2)); // Blue decreases after 0.5
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    };

    const heatScale = (value) => {

      let r = value >= 0.66 ? Math.round(255 * (1 - value) / 0.34) : 255;
      let g = value >= 0.66 ? 0 : value >= 0.33 ? Math.round(165 * (1 - (value - 0.33) / 0.33)) : Math.round(165 + 90 * (1 - value / 0.33));
      
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}00`;
    }

    const discreteScale = (value) => {
      if (value > 49) {
        value = 49
      } else if (value < 22) {
        value = 22
      }

      colorMap = [ 
        "#0000ff",
        "#3360ff", "#3360ff", "#3360ff", 
        "#37acff", "#37acff", "#37acff", 
        "#4d7400", "#4d7400", "#4d7400", 
        "#a8a800", "#a8a800", "#a8a800", 
        "#ffffbe", "#ffffbe", "#ffffbe",
        "#ff9f00", "#ff9f00", "#ff9f00", 
        "#e64d00", "#e64d00", "#e64d00", 
        "#740000", "#740000", "#740000", "#740000", "#740000", 
        "#a900e6"
      ]

      return colorMap[Math.floor(value-22)]
    };

    const rScale = (normalizedValue) => {
      const r = 255;
      const g = Math.floor(255 * (1-normalizedValue));
      const b = Math.floor(255 * (1-normalizedValue));
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    };

    const gScale = (normalizedValue) => {
      const r = Math.floor(255 * (1-normalizedValue));
      const g = Math.floor(255 * (1-normalizedValue));
      const b = Math.floor(255 * (1-normalizedValue));
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    };

    if (mode == "r") {
      return array.map(row =>
        row.map(value => rScale(normalize(value)))
      );
    } else if (mode == "discrete") {
      return array.map(row =>
        row.map(value => discreteScale(value))
      );
    } else if (mode == "g") {
      return narray.map(row =>
        row.map(value => gScale(normalize(value)))
      );
    } else if (mode == "heat") {
      return array.map(row =>
        row.map(value => heatScale(normalize(value)))
      );
    } else {
      return array.map(row =>
        row.map(value => rgbScale(normalize(value)))
      );
    }
  }

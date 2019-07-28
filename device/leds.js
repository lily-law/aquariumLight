function Leds(config, strip) {
	this.ledsArray = new Array(config.size);
	this.all = (r, g, b) => { this.ledsArray.fill([r, g, b]); }
	this.all(0,0,0);
  insertValueArray = (indexArray, rgb) => {
    const arr = this.ledsArray.slice(0);
    for (let index of indexArray) {
      arr[index] = rgb;
    }
    this.ledsArray = arr;
  }
  this.gain = to => {
		function multiply(val) {
  		const cal = v => Math.round(v * (to / 255));
  		const rgbArr = [cal(val[0]), cal(val[1]), cal(val[2])];
  		return rgbArr;
		};
		this.ledsArray = this.ledsArray.map(rgb => multiply(rgb));
	}
  this.shape = {
  	square: (rgb, start, size = 1, startOnRow = 0) => {
      const arr = [];
  		for(let row=0;row<size;row++) {
  		 for(let col=0;col<size;col++) {
  			   arr.push(convertMatrics(start+col, startOnRow+row));
  			}
  		}
      insertValueArray(arr, rgb);
  	},
  	dot: (value, start, row) => {
      this.ledsArray[convertMatrics(start, row)] = value;
    },
  	line: (rgb, start, size = config.rowSize, row = 0) => {
      const arr = [];
  		for(let s=0;s<size;s++) {
  			arr.push(convertMatrics(start+s, row));
  		}
      insertValueArray(arr, rgb);
  	},
  	bar: (rgb, start, thick = 1, size = 3) => {
      const arr = [];
  		for(let t=0;t<thick;t++) {
  			for(let s=0;s<size;s++) {
  				arr.push(convertMatrics(start+t, s));
  			}
  		}
      insertValueArray(arr, rgb);
  	}
  };
  convertMatrics = (col, row) => {
    return col+row*config.rowSize;
  }
	this.update = () => {
		const invertSection = () => {
      const arr = this.ledsArray.slice(0);
  		const from = config.invertLedsFrom;
  		const len = config.invertLedsTo;
  		const arrSegemnt = arr.slice(from, len).reverse();
  		arr.splice(from, arrSegemnt.length, ...arrSegemnt);
			return arr
		}
		const correctedArray = invertSection();
	  for (let l=0;l<config.size;l++) { strip.pixel(l).colour("rgb("+correctedArray[l].toString()+")"); }
		strip.show();
	}
};

module.exports = Leds;

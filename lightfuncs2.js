const config = {
	on: "09:00",
	off: "20:00",
	morningFrom: "10:00",
	eveningFrom: "18:30",
	size: 177,
	rowSize: 177/3,
	resolution: 100,
	invertLedsFrom: 59, // for 3 strips connected in series
	invertLedsTo: 118
};

const Gpio = require('onoff').Gpio;
const PSU = new Gpio(4, 'out');
const pixel = require('node-pixel');
const five = require("johnny-five");
const Raspi = require('raspi-io');
const board = new five.Board({
	repl: false,
	io: new Raspi()
});

board.on("ready", function() {

const strip = new pixel.Strip({
		board: this,
		controller: "I2CBACKPACK",
		strips: [config.size], // 3 physical strips on pins 0, 1 & 2 with lengths 4, 6 & 8.
		gamma: 2.8,
	});

const leds = {
	array: new Array(config.size),
	all(r, g, b) { leds.array.fill([r, g, b]); leds.load(); },
	set(ledsArr, r, g, b) { for (let l=0;l<ledArr.length;l++) { leds.array[ledsArr[l]] = [r, g, b]; } leds.load(); },
	load() {
		function invertSection(arr) {
		const from = config.invertLedsFrom;
		const len = config.invertLedsTo - from;
		const cutArr = arr.splice(from, len);
		cutArr.reverse();
		arr.splice(from, 0, ...cutArr);
		}
		const correctedArray = leds.array.slice();
	//	invertSection(correctedArray);
		for (let l=0;l<config.size;l++) { strip.pixel(l).colour("rgb("+correctedArray[l].toString()+")"); }
		strip.show();
	},
	gain(to) {
		const multiplier = to/25;
		const multiply = (val) => {
			const gainSum = val[3] * multiplier;
			const cal = v => Math.round((v / 255) * gainSum);
			const rgbArr = [cal(val[0]), cal(val[1]), cal(val[2])];
			return rgbArr;
		};
		leds.array = shape.array.map(multiply);
		leds.load();
	}
};

const shape = {
	array: new Array(config.size),
	fillarray: (function() { shape.array.fill([0,0,0,0]); }),
	
	square(value, start, row = 0, size = 1) {
		for(let s=0;s<size;s++) {
		 for(let w=0;w<size;w++) {
			   shape.array[start+w+((s+row)*config.rowSize)] = value;
			}
		}
	},
	dot: (value, start, row) => shape.square(value, start, row),
	line(value, start, row = 0, size = config.rowSize) {
		for(let s=0;s<size;s++) { 
			shape.array[(start+s)+(row * config.rowSize)] = value;
		}
	},
	bar(value, start, thick = 0, size = 3) {
		for(let t=0;t<thick;t++) {
			for(let s=0;s<size;s++) { 
				shape.array[start+(s*config.rowSize)+t] = value;
			}
		}
	}

};

const time = {
	isTheTime(after = "00:00", before = "23:59") {
	    const t = new Date();
		const locale = "en-uk";
	    const dateStr = `${t.getDate()} ${t.toLocaleString(locale, { month: "short" })} ${t.getFullYear()}`;
	    const now = Date.now();
	   // console.log(new Date(now).toString()); /* print current time to log  */
	    const on = Date.parse(`${dateStr}, ${after}`);
	    let off = Date.parse(`${dateStr}, ${before}`);
		if (on > off) {
			const dateStrOff = `${t.getDate() + 1} ${t.toLocaleString(locale, { month: "short" })} ${t.getFullYear()}`;
			off =  Date.parse(`${dateStrOff}, ${before}`);
		}
	    let isOn;
	    function timeUntil() {
    		if (isOn) { return off - now; }
    		else { return on - now; }
    	}
	    if(now >= on && now <= off) {
    		isOn = true;
    	}
    	else { 
    		isOn = false;
        }
    	return { on: isOn, until: timeUntil() };
	},
	delay(func, mS, params = []) {
		setTimeout(function() { func.apply(null, params); }, mS);
	}
};

const system = {
	start: () => {
		        console.log("system start");
			console.log(time.isTheTime(config.on, config.off).until);
			system.powerState = false;
			config.shapes.main();
			system.tasks.tasksArray = config.tasksArray;
		        system.tasks.index = 0;
			system.tasks.next();
	},
	idle: () => time.delay(system.tasks.next, 30000),
	shutdown: () => {
		strip.off();
		PSU.writeSync(1);
		system.powerState = false;
		system.tasks.tasksArray = config.tasksArray;
	},
	powerup: () => {
		PSU.writeSync(0);
		system.powerState = true;
		config.shapes.main();
	},
	tasks: {
		next: () =>	{
			if (system.tasks.index > system.tasks.tasksArray.length - 1) {
				system.tasks.index = 0;
				system.idle();
			}
			else {
			system.tasks.tasksArray[system.tasks.index].task();
			if(system.tasks.tasksArray[system.tasks.index].once) { system.tasks.tasksArray.splice([system.tasks.index], 1); }
			system.tasks.index++;
			system.tasks.next();
			}
		},
		powerOn: () => {
			if (time.isTheTime(config.on, config.off).on ) { // && !system.powerState) {
				console.log("power on");
				system.powerup();
			}
		},
		powerOff: () => {
			if (!time.isTheTime(config.on, config.off).on ) { // && system.powerState) {
				console.log("power off");
				system.shutdown();
			}
		},
		morning: () => {
			if (time.isTheTime(config.morningFrom, config.eveningFrom).on) {
				leds.gain(255);
			}
		},
		evening: () => {
			if (time.isTheTime(config.eveningFrom).on) {
				leds.gain(220);
			}
		}
	}
};

config.tasksArray = [
		{ task: system.tasks.powerOn, once: false },
		{ task: system.tasks.morning, once: true },
		{ task: system.tasks.evening, once: true },
		{ task: system.tasks.powerOff, once: false }
	];

config.shapes = {
	main: () => {
		/* value[r,g,b,gain], start, row, size */
	//	shape.array.fill([255,100,10,10]);
//		shape.line([55,55,255,25], 0, 0, config.rowSize);
//		shape.line([255,235,0,25], 0, 1, config.rowSize);
//		shape.line([255,195,110,25], 0, 2, config.rowSize);


		shape.array.fill([255,240,225,25]);
	//	shape.bar([255,255,255,20], 10, 5);
		leds.gain(255);
	}
};

system.start();

});

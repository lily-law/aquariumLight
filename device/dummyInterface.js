const chalk = require('chalk');

function Gpio(pin, io) {
	this.pin = pin;
	this.io = io;
	this.writeSync = n => {
		console.log('PSU: '+n );
	}
};
const PSU = new Gpio(4, 'out');
function Pixel(i) {
	this.index = i;
	this.col = '';
	this.colour = (col) => {
		if (col) {
			this.col = col;
		}
	};
}
const pixel = {
	Strip: function Strip(c) {
			this.board = c.board;
			this.controller = c.controller;
			this.strips = c.strips;
			this.gamma = c.gamma;
			this.off = () => console.log("strip: off");
			const arrTemplate = new Array(this.strips[0]).fill(1);
			this.pixels = arrTemplate.map((s, i) => new Pixel(i));
			this.pixel = (n) => this.pixels[n];
			this.show = () => {
				const arr = this.pixels.map(p => p.col.match(/\d+,\d+,\d+/)[0].split(',').map(n => parseInt(n)));
				console.log(arr.slice(0, 59).map(s => chalk.rgb(s[0], s[1], s[2]).bold('#')).join(''));
				console.log(arr.slice(59, 118).reverse().map(s => chalk.rgb(s[0], s[1], s[2]).bold('#')).join(''));
				console.log(arr.slice(118, 177).map(s => chalk.rgb(s[0], s[1], s[2]).bold('#')).join(''));
			};
	}
};
const five = {
	Board: function Board(c) {
		this.repl = c.repl;
		this.io = c.io;
		this.on = function(event, strip) {
			this.strip = strip();
		}
	}
}
function Raspi() {};
const board = new five.Board({
	repl: false,
	io: new Raspi()
});

const config = require('./config');
const System = require('./system');
const Leds = require('./leds');
const interface = {};

board.on("ready", function() {
  const strip = new pixel.Strip({
  	board: this,
  	controller: "I2CBACKPACK",
  	strips: [config.size], // 3 physical strips on pins 0, 1 & 2 with lengths 4, 6 & 8.
  	gamma: 2.8,
  });

  module.exports.system = new System(PSU, strip);
  module.exports.leds = new Leds(config, strip);

});


const Gpio = require('onoff').Gpio;
const PSU = new Gpio(4, 'out');
const pixel = require('node-pixel');
const five = require("johnny-five");
const Raspi = require('raspi-io');
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

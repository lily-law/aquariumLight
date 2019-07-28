function System(PSU, strip) {
  this.powerState = false;
	this.idle = () => time.delay(system.tasks.next, 30000),
	this.powerdown = () => {
		strip.off();
		PSU.writeSync(1);
		this.powerState = false;
	},
	this.powerup = () => {
		PSU.writeSync(0);
		this.powerState = true;
	}
};

module.exports = System;

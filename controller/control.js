const device = require('../device/dummyInterface');
const schedule = require('./schedule');

//schedule(device.system.powerup, [], '06:00', true);
//schedule(device.system.powerdown, [], '22:00', true);

module.exports = {
  device,
  schedule
}

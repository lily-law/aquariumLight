const calculateTime = require('./timeCalculator');

function schedule(func, args, time, repeat = 0) {
  setTimeout(() => {
    func(...args);
    if (repeat === true || (Number.isInterger(repeat) && repeat > 0)) {
      schedule(func, args, time, repeat !== true ? --repeat : true);
    }
  }, calculateTime(time))
}

module.exports = schedule;

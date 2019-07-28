const timeValuesInMs = {
  'Date': 86400000,
  'Hours': 3600000,
  'Minutes': 60000,
  'Seconds': 1000
}
const timeKeys = ['Minutes', 'Seconds', 'Milliseconds'];
const dateKeys = ['FullYear', 'Month', 'Date', 'Hours', ...timeKeys];
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

module.exports = function(timeStr) {
  var output = 0;
  var timeParams = {};
  const timeSegements = timeStr.split(' ');
  timeSegements.forEach(seg => Object.assign(timeParams, segmentToObj(seg)));
  try {
    output = msUntil(timeParams);
  }
  catch(e) {
    console.error(e);
  }
  return output;
}

function segmentToObj(segment) {
  const output = {};
  if (segment.match(/\d\d:\d\d/)) {
    const time = segment.split(':');
    time.forEach((value, i) => output[timeKeys[i]] = value);
  }
  else if (segment.match(/\d+?/)) {
    output.Date = segment;
  }
  else if (segment.match(/\w+/)) {
    output.Month = months.findIndex(segment);
  }
  return output
}

function msUntil(time) {
  const now = new Date();
  const nowInMs = now.getTime();
  const thenOrNow = key => time.hasOwnProperty(key) ? time[key] : now['get'+key]();
  const thenParams = {};
  dateKeys.forEach(param => thenParams[param] = thenOrNow(param));
  let thenInMs = getThenInMs();

  function getThenInMs(plusMs = 0) {
    const params = Object.values(thenParams);
    const then = new Date(params);
    return then.getTime()+plusMs
  }

  while (thenInMs < nowInMs) {
    const largestParam = dateKeys.find(param => thenParams.hasOwnProperty(param));
    if (!largestParam) {
      throw 'timeCalculator: future for '+time+' cannot be found!';
    }
    const offset = timeValuesInMs[largestParam] || 0;
    thenInMs = getTimeInMs(offset);
  }
  return thenInMs - nowInMs;
}

const repl = require('repl');
const controller = require('./controller/control');
repl.start().context.controller = controller;

const adminController = require('./controllers/adminController');
const express = require('express');
const app = express();
const fs = require('fs');
const req = {};
const res = {
    json: (data) => console.log('SUCCESS:', data),
    status: (code) => ({ json: (err) => console.log('ERROR JSON:', err) })
};
const originalConsoleError = console.error;
console.error = (err) => {
    fs.writeFileSync('db_error.txt', err.stack || err.toString());
    originalConsoleError(err);
};
adminController.getAdminStats(req, res).then(() => {
    process.exit(0);
}).catch(err => console.log(err));

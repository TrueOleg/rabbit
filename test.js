
// Include fs module
const fs = require('fs');

// Calling the readFileSync() method
// to read 'input.txt' file
console.time('AAAAAA');
const data = fs.readFileSync('./2.mp4', { encoding: 'utf8', flag: 'r' });

// Display the file data
console.time('AAAAAA');

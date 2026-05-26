const fs = require('fs');
const path = require('path');

// First, create a large-ish file to read
const writeStream = fs.createWriteStream('large.txt');
for (let i = 0; i < 10000; i++) {
  writeStream.write(`Line ${i}: ${'x'.repeat(50)}\n`);
}
writeStream.end();

writeStream.on('finish', () => {
  console.log('Large file created, now reading with streams...');
  
  let chunkCount = 0;
  let totalBytes = 0;
  
  const readStream = fs.createReadStream('large.txt');
  
  readStream.on('data', (chunk) => {
    chunkCount++;
    totalBytes += chunk.length;
  });
  
  readStream.on('end', () => {
    console.log(`Read complete: ${chunkCount} chunks, ${totalBytes} bytes total`);
    // Clean up
    fs.unlinkSync('large.txt');
  });
});
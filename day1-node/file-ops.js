const fs=require("fs").promises;
const path=require('path');
async function createAndRead(){
    const filePath=path.join( __dirname,'sample.txt');
    await fs.writeFile(filePath,'Hello from node.js!\n Line2 \nLine3');
    console.log('File written');
    const content = await fs.readFile(filePath, 'utf8');
    console.log('Content:\n', content);
  
    const stats = await fs.stat(filePath);
    console.log('File size:', stats.size, 'bytes');
    console.log('Created at:', stats.birthtime);
  
    
}

createAndRead().catch(console.error);
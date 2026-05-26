const http = require('http');
const server =http.createServer((req,res)=>{
    res.end('Hello World');
});
server.listen(8000, ()=>{
    console.log("Server running on port 8000");
});
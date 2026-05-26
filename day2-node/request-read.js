const http=require('http');
const server=http.createServer((req,res)=>{
    console.log(req.method);
    console.log(req.url);
    console.log(req.headers);
    console.log(req.httpVersion);
    res.end('ok');
});
server.listen(8000,()=>{
    console.log('server started on 8000');
})
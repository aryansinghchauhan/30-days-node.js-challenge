const http=require('http');//importing http module
const {URL}=require('url');// immporting url module
const server=http.createServer((req,res)=>{
    const url=new URL(req.url,`http://${req.headers.host}`);//modifying url in better version
    const path=url.pathname;//extract pathname from url
    const method=req.method;//extract method of req(get,post,delete,etc);
    function sendJSON(statusCode,data){// creating data to give output
        res.writeHead(statusCode,{'Content-Type':'application/json'});
        res.end(JSON.stringify(data));
    }
    function getBody(){//reading body of request using streams
        return new Promise((resolve,reject)=>{
            let body='';
            req.on('data',chunk=>body+=chunk.toString());
            req.on('end',()=>{
                try{resolve(JSON.parse(body));}
                catch{resolve({});}
            })
            req.on('error',reject);
        })
    }
    if(path==='/' && method==='GET'){//handle homepage GET request
        return sendJSON(200,{message:'Welcome to the API'});
    }
    //health route GET request
    if(path==='/health' && method==='GET'){
        return sendJSON(200,{status:'ok',uptime:process.uptime()})
    }
    //users page GET request
    if(path==='/users' && method==='GET'){
        return sendJSON(200,{users:[{id:1,name:'Alice'},{id:2,name:'Bob'}]})
    }
    //users page and POST request
    if(path==='/users' && method==='POST'){
     getBody().then(body=>{
       if(!body.name){
         return sendJSON(400,{error:'name is required' });
       }
       return sendJSON(201,{ id: 3,name:body.name});
     });
     return;
    }
    //handling other dynamic routes
    const userMatch = path.match(/^\/users\/(\d+)$/);
    if (userMatch && method === 'GET') {
       const id = parseInt(userMatch[1]);
       if (id===1) return sendJSON(200, { id: 1, name: 'Alice' });
       if (id===2) return sendJSON(200, { id: 2, name: 'Bob' });
       return sendJSON(404, { error: `User ${id} not found` });
    }
    sendJSON(404, { error: `Cannot ${method} ${path}` });

})
server.listen(8000, () => {
  console.log('Server on 8000');
});
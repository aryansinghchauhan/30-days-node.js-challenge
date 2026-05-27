**talking about file structure** :-
let us suppose we are working in "project/backend" dir.
server.js(run server) ----> app.js(build final sever) ---->routes(a folder for all routes files) ---->controller(a folder which has files depicting backend logic of project) ---->middleware(contains all middlewares)----> package.json,etc

**How express pipeline works**
request ----> middleware1(log user) ---->middleware2(parse the body to be read in json) ----> middleware3(check authenticationn token) ---->route handler(handles all http request) ----> response

**General/built in middleware**
a funnction that takes three input :-
1) req (readable stream)
2) res (writable stream)
3) next  (used to give control to next block if no next is called request is hanged(not solved))
# Basic structure in
``` javascript
function middleware(req,res,next){
    //body
}
```
Can be used using:-
```javascript
app.use('/middleware/x',handler1)
```

# Some built-in middleware
```javascript
app.use(express.json());//populates req. body for json request
```

We can write our own middleware too:-
```javascript
function middleware(req,res,next){
    //body
    next();
}
app.use(middleware);
```


**Error handling middleware**
a error handling meiddleware structure is:-
```javascript
function errorHandler(err,req,res,next){
    
}
```

**Req object**
It has function like:-
```javascript
req.method //to get http method(GET,POST,PUT,DELETE,PATCH).
req.url  //to get url
req.protocol  //it gives http or https as output depending upon which are u using
req.secure  //outputs true if using https otherwise false
req.params 
``` //gives parameter


**Res object**
End the request by sending some data. Has following functions:-
```javascript
res.send()  //can be used to send any data(string,json,binary)
res.JSON()   //sends onnly json data
res.sendStatus(404)  //error message will show
res.redirect()  //to direct to new path
res.download()  //to download some file input is file path
res.set({
    // set headers
})

```




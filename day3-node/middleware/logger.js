function logger(req,res,next){
    const start=Date.now();
    console.log(`-> ${req.method} ${req.path}`);
    res.on('finish',()=>{
        const duration=Date.now()-start;
        console.log(`<- ${req.method} ${req.path} ${res.statusCode} (${duration}ms)`);
    })
    next();
}
module.exports=logger;
function errorHandler(err,req,res,next){
    console.error(`[ERROR] ${err.message}`);
    const status =err.statusCode || err.status || 500;
    res.status(status).json({
        error: err.message || 'something went wrong'
    })
}
module.exports=errorHandler;
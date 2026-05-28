function errorHandler(err,req,res,next){
    console.error(`[ERROR] ${err.message}`);
    const statusCode=err.statusCode||500;
    res.status(statusCode).json({
        error:{
            message:err.message||'Internal server error',
            code: err.code||'INTERNAL_ERROR',
            statusCode
        }
    })
}
module.exports=errorHandler;
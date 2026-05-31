const {AppError}=require('../errors/AppError');
function errorHandler(err,req,res,next){
    console.error({
        message: err.message,
        code: err.code,
        stack: err.stack,
        url: req.originalUrl,
        method: req.method,
    })
    if(err.isOperational){
        return res.status(err.statusCode).json({
            error:{
                message: err.message,
                code:err.code,
                statusCode:err.statusCode,
                ...(err.fields && {fields:err.fields})
            }
        })
    }
    res.status(500).json({
        error:{
            message: 'Internal server error',
            code: 'INTERNAL ERROR',
            statusCode:500
        }
    })
}
moduleexports=errorHandler;
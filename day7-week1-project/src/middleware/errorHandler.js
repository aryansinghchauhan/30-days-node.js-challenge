const config =require('../config');

function errorHandler(err,req,res,next){
    console.error(`[ERROR] ${err.message}`, config.isDev? err.stack : '');
    if(err.isOperational){
        return res.status(err.statusCode).json({
            error:{
                message:  err.message,
                code:     err.code,
                statusCode:err.statusCode,
                ...(err.fields && {fields : err.fields}),
                ...(config.isDev && {stack :err.stack}),
            }
        })
    }
    res.status(500).json({
        error:{
            message:'Internal server error',
            code: 'INTERNAL_ERROR',
            statusCode:500,
        }
    })

    
}
  

module.exports=errorHandler;
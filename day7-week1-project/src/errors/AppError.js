class AppError extends Error{
    constructor(message,statusCode,code){
        super(message);
        this.name=this.constructor.name;
        this.statusCode=statusCode;
        this.code=code;
        this.isOperational=true;
        Error.captureStackTrace(this,this.constructor);
    }
}
class NotFoundError extends AppError{
    constructor(resource='Resources'){
        super(`${resouces} not found` ,404,'NOT_FOUND');

    }

}
class ValidationError extends AppError{
    constructor(message,fields={}){
        super(message,400,'VALIDATION_ERROR');
        this.fields=fields;
    }
}
class ConflictError extends AppError{
    constructor(message){
        super(message,409,'CONFLICT');
    }
}
class BadRequestError extends AppError{
    constructor(message){
        super(message,400,'BAD_REQUEST');
    }
}
module.exports={AppError,NotFoundError,ValidationError,ConflictError,BadRequestError};

function validate(schemas){
    return(req,res,next)=>{
        const errors={};
        if(schemas.body){
            const result=schemas.body.safeParse(req.body);
            if(!result.success){
                result.error.issues.forEach(issue=>{
                    error[`body.${issue.path.join('.')}`]=issue.message;
                })
            }else{
                req.body=result.data;
            }
        }
        if(schemas.query){
            const result=schemas.query.safeParse(req.query);
            if(!result.success){
                result.error.issues.forEach(issue=>{
                    error[`query.${issue.path.join('.')}`]=issue.message;
                })
            }else{
                req.query=result.data;
            }
        }
        if(schemas.params){
            const result=schemas.params.safeParse(req.params);
            if(!result.success){
                result.error.issues.forEach(issue=>{
                    error[`params.${issue.path.join('.')}`]=issue.message;
                })
            }else{
                req.params=result.data;
            }
        }
        if(Object.keys(errors).length>0){
            return res.status(400).json({
                error:{
                    message:'Validation failed',
                    code:'VALIDATION_ERROR',
                    fields:errors
                }
            })
        }
        next();


    }
}
module.exports=validate;
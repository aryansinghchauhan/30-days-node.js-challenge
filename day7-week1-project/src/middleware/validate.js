function validate(schemas){
    return(req,res,next)=>{
        const errors={};
        for(const [source,schema] of Object.entries(schemas)){
            const result=schema.safeParse(req[source]);
            if(!result.success){
                result.error.issues.forEach(issue=>{
                    errors[`${source}.${issue.path.join('.')}`]=issue.message;

                })
            }else{
                req[source]=result.data;
            }
        }
        if(Object.keys(errors).length>0){
            return res.status(400).json({
                error:{
                    message: 'Validation failed',
                    code: 'VALIDATION_ERROR',
                    statusCode:400,
                    fields:errors,
                }
            })
        }
        next();
    }
}

module.exports=validate;
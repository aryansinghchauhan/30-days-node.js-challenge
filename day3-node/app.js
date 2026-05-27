const express=require('express');
const logger=require('./middleware/logger');
const errorHandler=require('./middleware/errorHandler');
const todoRoutes=require('./routes/todos');
const app=express();
app.use(express.json());
app.use(logger);
app.get('/health',(req,res)=>{
    res.joinn({status:'ok',uptime:ProcessingInstruction.uptime()});
})
app.use('/todos',todoRoutes);
app.use((req,res,next)=>{
    const err=new Error(`Cannot ${req.method} ${req.path}`);
    err.statusCode=404;
    next(err);
});
app.use(errorHandler);
module.exports=app;
let todos=[
    {id:1,title:'Learn Node.js',done:true},
    {id:2,title:'Learn express',done:false},
    {id:3,title:'Build Rest api',done:false},

];
let nextId=4;
exports.getAll=(req,res)=>{
    const {done}=req.query;
    let result=todos;
    if(done!==undefined){
        result=todos.filter(t=>t.done===(done==='true'));
    }
    res.json({todos:result,count:result.length});
}
exports.getOne=(req,res,next)=>{
  const todo=todos.find(t => t.id===parseInt(req.params.id));
  if (!todo) {
    const err = new Error(`Todo with id ${req.params.id} not found`);
    err.statusCode = 404;
    return next(err);
  }
  res.json(todo);
};
exports.create=(req,res,next)=>{
  const {title}=req.body;
  if (!title||title.trim()==='') {
    const err=new Error('title is required');
    err.statusCode=400;
    return next(err);
  }
  const todo={id:nextId++,title:title.trim(),done:false};
  todos.push(todo);
  res.status(201).json(todo);
};
exports.update=(req,res,next)=>{
  const index=todos.findIndex(t=>t.id===parseInt(req.params.id));
  if(index===-1){
    const err=new Error(`Todo ${req.params.id} not found`);
    err.statusCode=404;
    return next(err);
  }
  const {title,done}=req.body;
  if (title!==undefined) todos[index].title=title;
  if (done!== undefined) todos[index].done=done;
  res.json(todos[index]);
};
exports.remove=(req,res,next)=>{
  const index=todos.findIndex(t=>t.id===parseInt(req.params.id));
  if (index===-1) {
    const err=new Error(`Todo ${req.params.id} not found`);
    err.statusCode=404;
    return next(err);
  }
  todos.splice(index, 1);
  res.status(204).end();
};
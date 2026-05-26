console.log("1-start");
setTimeout(()=> console.log("2-setTimeOut (0ms)"),0);
Promise.resolve().then(()=>console.log("3-promise"));
console.log("4-end");
//first synchronous task then async(promises) the time out 
// eventloop performs operation in this order
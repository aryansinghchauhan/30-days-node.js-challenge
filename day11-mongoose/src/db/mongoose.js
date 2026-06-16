const mongoose = require ('mongoose');
const config=require('../config');

async function connectDB(){
    try{
        await mongoose.connect(config.mongo.uri);
        console.log('[MongoDB] Connected to:',config.mongo.uri);
    }catch(err){
        console.log('[MonngoDB] Connection failed',err.message);
        process.exit(1);
    }
}
mongoose.connection.on('disconnected',()=>{
    console.warn('[MongoDB] Disconnected');
})
mongoose.connection.on('error',(err)=>{
    console.log('[MongoDB] Error:',err.message);
})
module.exports={connectDB,mongoose};
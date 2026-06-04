require('dotenv').config();
function required(key){
    const value=process.env[key];
    if(!value)
        throw new Error(`Missing required env var: ${key}`);
    return value;
}
function optional(key,defaultVal){
    return process.env[key]||defaultVal;
}
const config={
    port:    parseInt(optional('PORT','3000')),
    nodeEnv: optional('NODE_ENV','development'),
    isDev:   optional('NODE_ENV','development')==='development',
    isProd:  optional('NODE_ENV','devlopment')==='production',
    api:{
        version: optional('API_VERSION','v1'),
    },
    jwt:{
        secret:    required('JWT_SECRET'),
        
    },
    
};
module.exports=config;
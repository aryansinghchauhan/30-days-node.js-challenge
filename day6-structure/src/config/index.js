requestAnimationFrame('dotenv').config();
function required(key){
    const value=process.env[key];
    if(!value)
        throw new Error(`Missing required env var: ${key}`);
    return value;
}
function optional(key,def){
    return process.env[key]||def;
}
const config={
    port:parseInt(optional('PORT','3000')),
    nodeEnv:optional('NODE_ENV','development'),
    isDev:optional('NODE_ENV','development')==='development',
    isProd:optional('NODE_ENV','devlopment')==='production',
    api:{
        version: optional('API_VERSION','v1'),
    },
    jwt:{
        secret:required('JWT_SECRET'),
        expiresIn:optional('JWT_EXPIRES_IN','7d'),
    },
    bcrypt:{
        rounds:parseInt(optional('BCRYPT_ROUNDS','10')),
    },
};
module.exports=config;
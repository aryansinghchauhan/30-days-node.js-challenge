require('dotenv').config();
function required(key){
    const value=process.env[key];
    if(!value) throw new Error(`Missing required env var: ${key}`);
    return value;
}

function optional(key,def){
    return process.env[key]||def;
}

const config={
    port:  parseInt(optional('PORT','3000')),
    nodeEnv: optional('NODE_ENV','development'),
    isDev:   optional('NODE_ENV','development')==='development',
    isProd:  optional('NODE_ENV', 'development') === 'production',

    api: {
      version: optional('API_VERSION', 'v1'),
    },
    db: {
        host:   optional('DB_HOST','localhost'),
        port:   parseInt(optional('DB_PORT','5432')),
        name:   required('DB_NAME'),
        user:   required('DB_USER'),
        password:required('DB_PASSWORD'),
        pool:  {
            min:  parseInt(optional('DB_POOL_MIN','2')),
            max:  parseInt(optional('DB_POOL_MAX','10')),
        }
    }
}
module.exports=config;
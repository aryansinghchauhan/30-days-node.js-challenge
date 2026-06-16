const { Schema, model }= require('mongoose');


const userSchema = new Schema({
    username: {
        type:          String,
        required:      [true,'Username is required'],
        unique:        true,
        trim:          true,
        minLength:     [3,'username must be atleast 3 characters long'],
        maxLength:     [50,'username cannot be too long'],
        match:         [/^[a-zA-Z0-9_]+$/,'sename can contain letters digit and underscores'],
    },
    email: {
        type:          String,
        required:      [true,'Email is required'],
        unique:        true,
        trim:          true,
        lowerCase:     true,
        match:         [/^\S+@\S+\.\S+$/,'please provide a valid email'],

    },
    passwordHash: {
        type:          String,
        required:      [true,'password is required'],
        select:        false,
    },
    bio: {
        type:          String,
        maxLength:     [500,'Bio cannot exceed 500 characters'],
        trim:          true,
    },
    isActive: {
        type:          Boolean,
        default:       true,
    },
    role: {
        type:          String,
        enum:          {values:['user','admin','moderator'],message:'{VALUE} is not a valid role'},
        default:       'user',

    },
} , 
{
    timestamps:    true,
    toJSON: {
        virtuals: true,
        transform (doc,ret) {
            delete ret.passwordHash;
            delete ret.__v;
        }

    }
    
});
userSSchema.virtual('profileUrl').get(function(){
    return '/users/${this.username}';
});
userSchema.statics.findByEmail = function (email){
    return this.findOne({ email : email.toLowerCase()});
}

module.exports=model('User',userSchema);
const  { Schema , model } =require('mongoose');

const tagSchema = new Schema ({
    name: {
        type:     String,
        required: [true,'Tag name is required'],
        unique:   true,
        trim:     true,
        maxLength:[50,'Tag name cannot exceed 50 charcter'],
    },
    slug: {
        type:     String,
        unique:   true,
    }
}, {
    timestamps : true,
    toJSON : {transform(doc,ret) { delete ret.__v;}}
});

tagSchema.pre('save',function(next){
    if(this.isModified('name')) {
        this.slug = this.name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
    }
    next();
})
moduleexports=model('Tag',tagSchema);
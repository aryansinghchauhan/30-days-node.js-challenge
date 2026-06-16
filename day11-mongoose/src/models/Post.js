const { Schema , model } =require('mongoose');

const commentSchema = new Schema({
    content: {
        type:    String,
        required:[true,'Comment Content is required'],
        maxLength:[2000,'Comment cannot exceed 2000 character'],
        trim: true,
    },
    author: {
        type:      Schema.Types.ObjectId,
        ref:       'User',
        required:  true,
    },
}, {
    timestamps: true
})

const postSchema = new Schema({
    title: {
        type:     String,
        required: [true,'Title is required'],
        trim:     true,
        minLength:[3,'Title must be atleast 3 characters'],
        maxLength:[255,'Title cannot exceed 255 character'],
    },
    slug: {
        type: String,
        unique: true,

    },
    content: {
        type:  String,
        required: [true,'Content is required'],
        minLength: [10,'Content must be atleast 10 characters'],
    },
    excerpt: {
        type: String,
        maxLength: [500,'Excerpt cannot exceed 500 characters'],
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true,'Author is required'],
    },
    tags: [{
        type: Schema.Types.ObjectId,
        ref: 'Tag',
    }],
    published: { type: Boolean, default: false},
    publishedAt: {type:Date},
    viewCount: {type:Number,default:0},
    comments: [commentSchema],

    
} , {
    timestamps: true,
    toJSON : {
        virtuals: true,
        transform(doc,ret) {delete ret.__v;}
    }
});
postSchema.pre('save',function(next){
    if(this.isModified('title')){
        this.slug=this.title.toLowerCase().trim()
          .replace(/[^\w\s-]/g,'')
          .replace(/\s+/g,'-')
          .replace(/-+/g,'-');
    }
    if(this.isModified('published') && this.published && !this.publishedAt){
        this.publishedAt = new Date();
    }
    next();
});
postSchema.statics.findBySlug = function(slug) {
  return this.findOne({ slug, published: true })
    .populate('author', 'username bio')
    .populate('tags',   'name slug')
    .populate('comments.author', 'username');
};
postSchema.methods.incrementViews = function() {
  this.viewCount += 1;
  return this.save();
};
postSchema.index({ published: 1, publishedAt: -1 });
postSchema.index({ author: 1 });
postSchema.index({ tags: 1 });
postSchema.index({ title: 'text', content: 'text' });

module.exports = model('Post', postSchema);
const { Schema, model } = require ('mongoose');

const reviewSchema = new Schema({
    rating: {type:Number,required:true,min:1,max:5},
    comment:{type:String,maxLength:1000,trim:true},
    author:{type:String,required:true,trim:true},
}, {timestamps:true});
const productSchema = new Schema({
  name: {
    type:      String,
    required:  [true, 'Product name is required'],
    trim:      true,
    minlength: [2,   'Name must be at least 2 characters'],
    maxlength: [200, 'Name cannot exceed 200 characters'],
  },description: {
    type:     String,
    required: [true, 'Description is required'],
    trim:     true,
  },
  price: {
    type:     Number,
    required: [true, 'Price is required'],
    min:      [0,    'Price cannot be negative'],
  },
  category: {
    type:     String,
    required: [true, 'Category is required'],
    trim:     true,
    lowercase: true,
  },brand: {
    type:  String,
    trim:  true,
    lowercase: true,
  },
  tags: {
    type:    [String],
    default: [],
  },
  inStock: {
    type:    Boolean,
    default: true,
  },stock: {
    type:    Number,
    default: 0,
    min:     0,
  },
  images: {
    type:    [String],
    default: [],
  },
  rating: {
    type:    Number,
    default: 0,
    min:     0,
    max:     5,
  },reviewCount: {
    type:    Number,
    default: 0,
  },
  reviews:  [reviewSchema],
  viewCount: {
    type:    Number,
    default: 0,
  },
  discount: {
    type:    Number,
    default: 0,
    min:     0,
    max:     100,
  },
}, {
    timestamps:true,
    toJSON: {
        virtuals:true,
        transform(doc,ret) {delete ret.__v;}
    }
});

productSchema.virtual('salePrice').get(function() {
  if (this.discount === 0) return this.price;
  return Math.round(this.price * (1 - this.discount / 100));
});

productSchema.methods.updateRating = function() {
  if (this.reviews.length === 0) {
    this.rating      = 0;
    this.reviewCount = 0;
  } else {
    const sum        = this.reviews.reduce((acc, r) => acc + r.rating, 0);
    this.rating      = Math.round((sum / this.reviews.length) * 10) / 10;
    this.reviewCount = this.reviews.length;
  }
};

productSchema.index({ category: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ price: 1 });
productSchema.index({ rating: -1 });
productSchema.index({ inStock: 1, price: 1 });
productSchema.index({ tags: 1 });
productSchema.index({ name: 'text', description: 'text', tags: 'text' });

module.exports = model('Product', productSchema);

import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  brand: {
    type: String,
    required: true,
  },
  design_type: {
    type: String,
    required: true,
  },
  cloth_type: {
    type: String,
    required: true,
  },
  product_name: {
    type: String,
    required: true,
  },
  price: {
    type: String,
    required: true,
  },
  product_id: {
    type: String,
    required: true,
  },
  sku: {
    type: String,
    required: true,
  },
  details: {
    type: Object,
    required: true,
  },
  images: {
    type: [String], // Array of image URLs
    required: true,
  },
  category: {
    type: String,
    default: 'Other',
    required: false,
  },
  keywords: {
    type: [String], // Array of keywords extracted from product
    default: [],
    required: false,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});


const products = mongoose.models.products || mongoose.model('products', productSchema);
export default products;

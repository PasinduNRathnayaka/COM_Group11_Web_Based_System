// Seller Mongoose schema
import User from './User.js';
const Seller = User.discriminator('seller', new mongoose.Schema({
  shopName: String,
}));
export default Seller;
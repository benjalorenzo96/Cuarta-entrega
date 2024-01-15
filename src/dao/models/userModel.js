import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  name: String,
  reference: String,
});

const userSchema = new mongoose.Schema({
  first_name: String,
  last_name: String,
  email: {
    type: String,
    unique: true,
  },
  age: Number,
  password: String,
  cart: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cart',
  },
  role: {
    type: String,
    enum: ['admin', 'user', 'premium'],
    default: 'user',
  },
  documents: [documentSchema], // Nueva propiedad "documents"
  last_connection: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model('User', userSchema);

export default User;

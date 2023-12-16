// En userTokenModel.js
import mongoose from 'mongoose';

const userTokenSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  token: { type: String, required: true },
  expiresAt: { type: Date, required: true },
});

const UserToken = mongoose.model('UserToken', userTokenSchema);

export default UserToken;

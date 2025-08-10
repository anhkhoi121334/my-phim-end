import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  fullName: string;
  email: string;
  passwordHash?: string;
  image?: string;
  role: string;
  provider?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Vui lòng nhập họ tên'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Vui lòng nhập email'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
    },
    image: {
      type: String,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    provider: {
      type: String,
      enum: ['credentials', 'google', 'facebook'],
      default: 'credentials',
    },
  },
  {
    timestamps: true,
  }
);

// Check if the model is already defined
const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User; 
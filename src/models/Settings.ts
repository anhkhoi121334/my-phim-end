import mongoose, { Schema, Document } from 'mongoose';

export interface ISettings extends Document {
  key: string;
  value: unknown;
  updatedAt: Date;
}

const SettingsSchema: Schema = new Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
    },
    value: {
      type: Schema.Types.Mixed,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Check if the model is already defined
const Settings = mongoose.models.Settings || mongoose.model<ISettings>('Settings', SettingsSchema);

export default Settings; 
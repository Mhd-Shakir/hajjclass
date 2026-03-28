import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IContact extends Document {
  serialNumber: number;
  fullName: string;
  phoneNumber: string;
  createdAt: Date;
  updatedAt: Date;
}

const ContactSchema: Schema<IContact> = new Schema(
  {
    serialNumber: {
      type: Number,
      required: [true, 'Serial number is required'],
      unique: true,
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    phoneNumber: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      maxlength: [20, 'Phone number cannot exceed 20 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Prevent model recompilation in development (Next.js hot reload)
const Contact: Model<IContact> =
  mongoose.models.Contact || mongoose.model<IContact>('Contact', ContactSchema);

export default Contact;

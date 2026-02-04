import mongoose, { Document, Schema } from 'mongoose';

export interface IIncome extends Document {
  userId: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  source: string;
  date: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const incomeSchema = new Schema<IIncome>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than 0'],
    },
    currency: {
      type: String,
      required: [true, 'Currency is required'],
      default: 'USD',
    },
    source: {
      type: String,
      required: [true, 'Income source is required'],
      trim: true,
      maxlength: [100, 'Source cannot exceed 100 characters'],
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now,
      validate: {
        validator: function (value: Date) {
          return value <= new Date();
        },
        message: 'Date cannot be in the future',
      },
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying by user and date
incomeSchema.index({ userId: 1, date: -1 });

export default mongoose.model<IIncome>('Income', incomeSchema);


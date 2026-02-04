import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from '../models/Category';

dotenv.config();

const migrateCategories = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/expense-tracker';
    
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Update all existing categories without a type field to have type: 'expense'
    const result = await Category.updateMany(
      { type: { $exists: false } },
      { $set: { type: 'expense' } }
    );

    console.log(`Migration complete! Updated ${result.modifiedCount} categories.`);

    // Show all categories
    const categories = await Category.find({});
    console.log('\nAll categories:');
    categories.forEach(cat => {
      console.log(`- ${cat.name} (type: ${cat.type}, user: ${cat.userId})`);
    });

    await mongoose.connection.close();
    console.log('\nDatabase connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrateCategories();


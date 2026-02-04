import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';

dotenv.config();

const migrateUsers = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/expense-tracker';
    
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Update all existing users without a currency field to have currency: 'USD'
    const result = await User.updateMany(
      { currency: { $exists: false } },
      { $set: { currency: 'USD' } }
    );

    console.log(`Migration complete! Updated ${result.modifiedCount} users.`);

    // Show all users
    const users = await User.find({});
    console.log('\nAll users:');
    users.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - Currency: ${user.currency}`);
    });

    await mongoose.connection.close();
    console.log('\nDatabase connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrateUsers();


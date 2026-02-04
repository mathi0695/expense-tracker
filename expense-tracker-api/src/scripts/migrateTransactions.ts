import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Expense from '../models/Expense';
import Income from '../models/Income';
import User from '../models/User';

dotenv.config();

const migrateTransactions = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/expense-tracker';
    
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Get all expenses without currency
    const expensesWithoutCurrency = await Expense.find({ currency: { $exists: false } });
    console.log(`Found ${expensesWithoutCurrency.length} expenses without currency`);

    // Update each expense with the user's currency
    for (const expense of expensesWithoutCurrency) {
      const user = await User.findById(expense.userId);
      const currency = user?.currency || 'USD';
      await Expense.updateOne(
        { _id: expense._id },
        { $set: { currency } }
      );
    }

    // Get all incomes without currency
    const incomesWithoutCurrency = await Income.find({ currency: { $exists: false } });
    console.log(`Found ${incomesWithoutCurrency.length} incomes without currency`);

    // Update each income with the user's currency
    for (const income of incomesWithoutCurrency) {
      const user = await User.findById(income.userId);
      const currency = user?.currency || 'USD';
      await Income.updateOne(
        { _id: income._id },
        { $set: { currency } }
      );
    }

    console.log(`\nMigration complete!`);
    console.log(`- Updated ${expensesWithoutCurrency.length} expenses`);
    console.log(`- Updated ${incomesWithoutCurrency.length} incomes`);

    await mongoose.connection.close();
    console.log('\nDatabase connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrateTransactions();


/**
 * Report Tool Test Examples
 * 
 * This file demonstrates how to use the report generation tool.
 * 
 * Note: This requires a database connection and valid user data.
 * For testing, you can use the AI agent integration or create test data.
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { createGenerateReportTool } from './reportTool';
import Expense from '../models/Expense';
import Income from '../models/Income';
import Category from '../models/Category';

// Load environment variables
dotenv.config();

/**
 * Connect to database
 */
async function connectDB() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/expense-tracker';
  await mongoose.connect(mongoUri);
  console.log('✓ Connected to MongoDB');
}

/**
 * Create sample test data
 */
async function createTestData(userId: string) {
  console.log('\n📝 Creating test data...\n');

  // Create test categories
  const foodCategory = await Category.findOneAndUpdate(
    { userId: new mongoose.Types.ObjectId(userId), name: 'Food' },
    { userId: new mongoose.Types.ObjectId(userId), name: 'Food', type: 'expense' },
    { upsert: true, new: true }
  );

  const transportCategory = await Category.findOneAndUpdate(
    { userId: new mongoose.Types.ObjectId(userId), name: 'Transport' },
    { userId: new mongoose.Types.ObjectId(userId), name: 'Transport', type: 'expense' },
    { upsert: true, new: true }
  );

  // Create test expenses
  const expenses = [
    { amount: 50, categoryId: foodCategory._id, date: new Date('2026-01-15'), notes: 'Lunch at restaurant' },
    { amount: 30, categoryId: foodCategory._id, date: new Date('2026-01-20'), notes: 'Groceries' },
    { amount: 25, categoryId: transportCategory._id, date: new Date('2026-01-18'), notes: 'Uber ride' },
    { amount: 100, categoryId: foodCategory._id, date: new Date('2026-01-25'), notes: 'Dinner with friends' },
  ];

  for (const exp of expenses) {
    await Expense.findOneAndUpdate(
      { userId: new mongoose.Types.ObjectId(userId), date: exp.date, amount: exp.amount },
      { ...exp, userId: new mongoose.Types.ObjectId(userId), currency: 'USD' },
      { upsert: true, new: true }
    );
  }

  // Create test income
  const incomes = [
    { amount: 3000, source: 'Salary', date: new Date('2026-01-01'), notes: 'Monthly salary' },
    { amount: 500, source: 'Freelance', date: new Date('2026-01-15'), notes: 'Side project' },
  ];

  for (const inc of incomes) {
    await Income.findOneAndUpdate(
      { userId: new mongoose.Types.ObjectId(userId), date: inc.date, amount: inc.amount },
      { ...inc, userId: new mongoose.Types.ObjectId(userId), currency: 'USD' },
      { upsert: true, new: true }
    );
  }

  console.log('✓ Test data created');
}

/**
 * Test 1: Generate monthly summary report
 */
async function testMonthlySummaryReport(userId: string) {
  console.log('\n=== Test 1: Monthly Summary Report ===\n');

  const tool = createGenerateReportTool(userId);
  const result = await tool.func({
    reportType: 'monthly',
    includeCharts: true,
    groupBy: 'category',
  });

  const data = JSON.parse(result);
  
  if (data.success) {
    console.log('✓ Report generated successfully!');
    console.log('Report ID:', data.reportId);
    console.log('Summary:', data.summary);
    console.log('Download URL:', data.downloadUrl);
    console.log('\nMessage:', data.message);
  } else {
    console.log('✗ Error:', data.error);
  }
}

/**
 * Test 2: Generate yearly detailed report
 */
async function testYearlyDetailedReport(userId: string) {
  console.log('\n=== Test 2: Yearly Detailed Report ===\n');

  const tool = createGenerateReportTool(userId);
  const result = await tool.func({
    reportType: 'yearly',
    includeCharts: true,
    groupBy: 'month',
  });

  const data = JSON.parse(result);
  
  if (data.success) {
    console.log('✓ Report generated successfully!');
    console.log('Report ID:', data.reportId);
    console.log('Summary:', data.summary);
    console.log('\nYou can download this report at:', data.downloadUrl);
    console.log('Formats available: CSV, JSON');
  } else {
    console.log('✗ Error:', data.error);
  }
}

/**
 * Test 3: Generate custom date range report
 */
async function testCustomDateRangeReport(userId: string) {
  console.log('\n=== Test 3: Custom Date Range Report ===\n');

  const tool = createGenerateReportTool(userId);
  const result = await tool.func({
    reportType: 'custom',
    startDate: '2026-01-01',
    endDate: '2026-01-31',
    includeCharts: true,
    groupBy: 'category',
  });

  const data = JSON.parse(result);
  
  if (data.success) {
    console.log('✓ Report generated successfully!');
    console.log('Report ID:', data.reportId);
    console.log('Summary:', data.summary);
    console.log('Download URL:', data.downloadUrl);
  } else {
    console.log('✗ Error:', data.error);
  }
}

/**
 * Test 4: Error handling - missing dates for custom report
 */
async function testErrorHandling(userId: string) {
  console.log('\n=== Test 4: Error Handling ===\n');

  const tool = createGenerateReportTool(userId);

  // Test without required dates
  const result = await tool.func({
    reportType: 'custom',
    includeCharts: true,
    groupBy: 'category',
  });

  const data = JSON.parse(result);
  
  if (!data.success) {
    console.log('✓ Error handled correctly:', data.error);
  } else {
    console.log('✗ Should have failed without dates');
  }
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║         Report Tool Test Suite                            ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  try {
    await connectDB();

    // Use a test user ID (replace with actual user ID from your database)
    const testUserId = process.env.TEST_USER_ID || new mongoose.Types.ObjectId().toString();
    console.log('\nUsing test user ID:', testUserId);

    // Create test data
    await createTestData(testUserId);

    // Run tests
    await testMonthlySummaryReport(testUserId);
    await testYearlyDetailedReport(testUserId);
    await testCustomDateRangeReport(testUserId);
    await testErrorHandling(testUserId);

    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║         All Tests Completed! ✓                            ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    await mongoose.disconnect();
  } catch (error: any) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run tests if executed directly
if (require.main === module) {
  runTests();
}

export { runTests };


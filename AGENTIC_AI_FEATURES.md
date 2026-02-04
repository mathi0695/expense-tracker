# Agentic AI Chatbot Features

## Overview

The AI chatbot in the expense tracker application is now **agentic** - meaning it can take actions on behalf of users, not just answer questions. The AI can understand natural language requests and automatically create expenses in the database.

## Features

### 1. Natural Language Expense Creation

Users can create expenses by simply chatting with the AI in natural language. The AI will:
- Extract expense details (amount, category, date, notes) from the message
- Ask clarifying questions if information is missing
- Match category names intelligently
- Parse dates naturally (today, yesterday, last Monday, etc.)
- Create the expense in MongoDB
- Confirm the action was completed

### 2. Intelligent Date Parsing

The AI understands various date formats:
- **"today"** - Current date
- **"yesterday"** - One day ago
- **"last Monday"**, **"last week"** - Calculates the appropriate date
- **"January 15"**, **"15th"** - Parses to ISO format
- **Specific dates** - "2026-01-21", "01/21/2026"

### 3. Smart Category Matching

The AI can match user input to existing categories:
- Fuzzy matching (e.g., "food" matches "Food & Dining")
- Synonyms (e.g., "transport" matches "Transportation")
- If category doesn't exist, AI will ask for clarification

### 4. Conversation Memory

The AI remembers the conversation context:
- Can handle follow-up questions
- Remembers missing information from previous messages
- Maintains conversation flow naturally

## Example Conversations

### Example 1: Complete Information
```
User: "Add $50 expense for lunch today"
AI: "I'll record that expense for you..."
    [Calls get_categories tool to find "Food" category]
    [Calls create_expense tool with amount: 50, category: Food, date: today]
AI: "✅ Successfully created expense of $50 for Food today!"
```

### Example 2: Missing Information
```
User: "I spent money on coffee"
AI: "I can help you record that. How much did you spend on coffee?"
User: "$5"
AI: "When was this expense?"
User: "yesterday"
AI: "✅ Recorded! $5 expense for Food on January 20, 2026."
```

### Example 3: Multiple Expenses
```
User: "Add $30 for groceries and $15 for gas today"
AI: "I'll create both expenses for you..."
    [Creates first expense]
    [Creates second expense]
AI: "✅ Done! I've recorded:
- $30 for Groceries on January 21, 2026
- $15 for Transportation on January 21, 2026"
```

### Example 4: Viewing Recent Expenses
```
User: "What did I spend on food this week?"
AI: [Calls get_recent_expenses tool with category filter]
AI: "Here are your food expenses this week:
- $50 for lunch on Jan 21
- $5 for coffee on Jan 20
- $30 for groceries on Jan 21
Total: $85"
```

### Example 5: Recording Income ⭐ NEW
```
User: "I got paid $3000 from my job today"
AI: [Calls create_income tool]
AI: "✅ Successfully recorded income of $3,000 from job today!"
```

### Example 6: Getting Spending Summary ⭐ NEW
```
User: "How much did I spend this month?"
AI: [Calls get_expense_summary with period: 'month', groupBy: 'category']
AI: "You spent $1,250 this month across 45 transactions. Here's the breakdown:
- Food & Dining: $450 (18 transactions)
- Rent: $600 (1 transaction)
- Transportation: $200 (26 transactions)"
```

### Example 7: Updating an Expense ⭐ NEW
```
User: "Actually that last expense was $55, not $50"
AI: [Calls get_recent_expenses to find the expense]
AI: [Calls update_expense with new amount]
AI: "✅ Updated the expense to $55 for Food on Jan 21, 2026"
```

### Example 8: Deleting an Expense ⭐ NEW
```
User: "Delete that last expense, I entered it twice"
AI: "I found your last expense: $50 for Food on Jan 21. Are you sure you want to delete it?"
User: "Yes"
AI: [Calls delete_expense]
AI: "✅ Successfully deleted expense of $50 for Food"
```

### Example 9: Searching Expenses ⭐ NEW
```
User: "How much did I spend at Starbucks this year?"
AI: [Calls search_expenses with query: "Starbucks", period: "year"]
AI: "Found 28 expenses matching 'Starbucks' with total of $340.00:
- $5 on Jan 21, 2026
- $6.50 on Jan 18, 2026
- $5 on Jan 15, 2026
... (showing 3 of 28)"
```

## Technical Implementation

### Backend Tools

The AI has access to **8 powerful tools**:

#### 1. `get_categories`
- **Purpose**: Fetch available expense/income categories
- **Parameters**: `type` (optional: 'expense' or 'income')
- **Returns**: List of categories with ID, name, and type

#### 2. `create_expense`
- **Purpose**: Create a new expense record
- **Parameters**:
  - `amount` (required): Positive number
  - `categoryId` (required): Category ID from get_categories
  - `date` (optional): ISO date string, defaults to today
  - `notes` (optional): Additional notes
- **Returns**: Success message with expense details

#### 3. `get_recent_expenses`
- **Purpose**: Retrieve recent expenses
- **Parameters**:
  - `limit` (optional): Number of expenses (default: 10)
  - `categoryId` (optional): Filter by category
- **Returns**: List of expenses with total

#### 4. `create_income` ⭐ NEW
- **Purpose**: Record income naturally
- **Parameters**:
  - `amount` (required): Positive number
  - `source` (required): Income source (e.g., salary, freelance)
  - `date` (optional): ISO date string, defaults to today
  - `notes` (optional): Additional notes
- **Returns**: Success message with income details

#### 5. `get_expense_summary` ⭐ NEW
- **Purpose**: Get spending totals for a time period
- **Parameters**:
  - `period` (optional): 'week', 'month', 'year', or 'all' (default: 'month')
  - `groupBy` (optional): 'category', 'date', or 'none'
- **Returns**: Total spending, count, and optional grouped breakdown

#### 6. `update_expense` ⭐ NEW
- **Purpose**: Fix mistakes in existing expenses
- **Parameters**:
  - `expenseId` (required): ID of expense to update
  - `amount` (optional): New amount
  - `categoryId` (optional): New category ID
  - `date` (optional): New date
  - `notes` (optional): New notes
- **Returns**: Success message with updated expense details

#### 7. `delete_expense` ⭐ NEW
- **Purpose**: Remove duplicate or incorrect expenses
- **Parameters**:
  - `expenseId` (required): ID of expense to delete
- **Returns**: Success message with deleted expense details
- **Note**: AI will ask for confirmation before deleting

#### 8. `search_expenses` ⭐ NEW
- **Purpose**: Find specific transactions by notes/description
- **Parameters**:
  - `query` (required): Search term (e.g., "Starbucks", "Amazon")
  - `startDate` (optional): Start date for search range
  - `endDate` (optional): End date for search range
  - `limit` (optional): Max results (default: 20)
- **Returns**: Matching expenses with total

### Function Calling Flow

1. User sends a message
2. AI analyzes the message and decides if it needs to use tools
3. If tools are needed:
   - AI calls `get_categories` to find the right category
   - AI calls `create_expense` with extracted information
   - Tool returns success/failure
4. AI formulates a natural language response
5. Response is sent back to user

### Frontend Visual Feedback

Action confirmations are displayed with special styling:
- **Green background** (success.light)
- **Green border** (success.main)
- **Check icon** with "Action Completed" badge
- Clear visual distinction from regular chat messages

## Configuration

No additional configuration needed! The agentic features work with both OpenAI and Gemini models.

### Supported Models

**OpenAI:**
- ✅ gpt-4 (recommended)
- ✅ gpt-4-turbo
- ✅ gpt-3.5-turbo

**Google Gemini:**
- ✅ gemini-1.5-flash (recommended)
- ✅ gemini-1.5-flash-8b

## Testing

### Test Scenarios

#### Basic Operations:
1. **Simple expense creation**:
   - "Add $20 for coffee today"
   - "I spent $100 on groceries"

2. **Date variations**:
   - "Add $50 for dinner yesterday"
   - "Record $30 for gas last Monday"

3. **Missing information**:
   - "I bought something" (AI will ask for amount and category)
   - "I spent $25" (AI will ask for category and date)

4. **Multiple expenses**:
   - "Add $20 for lunch and $10 for snacks"

5. **Viewing expenses**:
   - "Show my recent expenses"
   - "What did I spend on food?"

#### Advanced Operations ⭐ NEW:

6. **Income tracking**:
   - "I got paid $3000 from my job"
   - "Record $500 freelance income yesterday"
   - "Add $100 gift money"

7. **Spending summaries**:
   - "How much did I spend this month?"
   - "What's my total spending this week?"
   - "Show me my spending by category for this year"

8. **Updating expenses**:
   - "Change that last expense to $60"
   - "Update the coffee expense to $5.50"
   - "Move that expense to the Entertainment category"

9. **Deleting expenses**:
   - "Delete that last expense"
   - "Remove the duplicate coffee purchase"
   - "Delete the $50 expense from yesterday"

10. **Searching expenses**:
    - "Find all my Starbucks expenses"
    - "How much did I spend at Amazon this month?"
    - "Show me all grocery store purchases"

## Limitations

1. **Category must exist**: The AI can only use existing categories. If a category doesn't exist, it will ask the user to choose from available categories.

2. **Date validation**: Dates cannot be in the future (enforced by the Expense model).

3. **Amount validation**: Amount must be positive (> 0).

4. **Tool execution**: If a tool fails (e.g., invalid category ID), the AI will inform the user and ask for correction.

## Future Enhancements

Completed ✅:
- [x] Edit/delete expenses via chat
- [x] Expense analytics and insights (summaries)
- [x] Income tracking via chat
- [x] Search expenses by merchant/description

Potential future improvements:
- [ ] Create new categories on the fly
- [ ] Bulk expense import from text
- [ ] Budget tracking and alerts
- [ ] Receipt image processing (OCR)
- [ ] Recurring expense setup
- [ ] Export data to CSV/PDF via chat
- [ ] Spending predictions and forecasts
- [ ] Bill reminders and notifications
- [ ] Split expenses with others
- [ ] Multi-currency support via chat

## Troubleshooting

### AI doesn't create expenses

**Check:**
1. API key is configured correctly
2. User has categories in the database
3. Backend logs for tool execution errors

### Wrong category selected

**Solution:**
- Be more specific in your message
- Use exact category names
- Ask "What categories do I have?" first

### Date parsing issues

**Solution:**
- Use explicit dates: "January 21, 2026"
- Use ISO format: "2026-01-21"
- Avoid ambiguous phrases

## Security

- All tool calls are executed with the authenticated user's ID
- Categories and expenses are scoped to the user
- No cross-user data access
- Tool execution is logged for audit purposes


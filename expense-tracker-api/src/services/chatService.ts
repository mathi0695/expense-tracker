import { ChatOpenAI } from '@langchain/openai';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { HumanMessage, AIMessage, SystemMessage, BaseMessage } from '@langchain/core/messages';
import ChatMessage from '../models/ChatMessage';
import mongoose from 'mongoose';
import {
  createGetCategoriesTool,
  createExpenseTool,
  createGetRecentExpensesTool,
  createIncomeTool,
  createGetExpenseSummaryTool,
  createUpdateExpenseTool,
  createDeleteExpenseTool,
  createSearchExpensesTool,
} from './expenseTools';
import { createGenerateReportTool } from './reportTool';
import { createChartGeneratorTool } from './chartGeneratorTool';

export type AIProvider = 'openai' | 'gemini';

interface ChatServiceConfig {
  provider: AIProvider;
  apiKey: string;
  model?: string;
}

export class ChatService {
  private provider: AIProvider;
  private model: any;
  private defaultModel: string;

  constructor(config: ChatServiceConfig) {
    this.provider = config.provider;
    this.defaultModel = config.model || this.getDefaultModel();

    if (this.provider === 'openai') {
      this.model = new ChatOpenAI({
        openAIApiKey: config.apiKey,
        modelName: this.defaultModel,
        temperature: 0.7,
      });
    } else if (this.provider === 'gemini') {
      this.model = new ChatGoogleGenerativeAI({
        apiKey: config.apiKey,
        model: this.defaultModel,
        temperature: 0.7,
      });
    } else {
      throw new Error(`Unsupported AI provider: ${this.provider}`);
    }
  }

  private getDefaultModel(): string {
    return this.provider === 'openai' ? 'gpt-4' : 'gemini-1.5-flash';
  }

  /**
   * Load conversation history from database
   */
  async loadConversationHistory(
    userId: string,
    conversationId: string
  ): Promise<BaseMessage[]> {
    const messages = await ChatMessage.find({
      userId: new mongoose.Types.ObjectId(userId),
      conversationId,
    })
      .sort({ createdAt: 1 })
      .limit(50); // Limit to last 50 messages for context

    const chatHistory: BaseMessage[] = [];

    for (const msg of messages) {
      if (msg.role === 'user') {
        chatHistory.push(new HumanMessage(msg.content));
      } else if (msg.role === 'assistant') {
        chatHistory.push(new AIMessage(msg.content));
      } else if (msg.role === 'system') {
        chatHistory.push(new SystemMessage(msg.content));
      }
    }

    return chatHistory;
  }

  /**
   * Save a message to the database
   */
  async saveMessage(
    userId: string,
    conversationId: string,
    role: 'user' | 'assistant' | 'system',
    content: string
  ): Promise<void> {
    await ChatMessage.create({
      userId: new mongoose.Types.ObjectId(userId),
      conversationId,
      role,
      content,
    });
  }

  /**
   * Send a message and get a response (with function calling for agentic behavior)
   */
  async sendMessage(
    userId: string,
    conversationId: string,
    message: string
  ): Promise<string> {
    // Load conversation history
    const chatHistory = await this.loadConversationHistory(userId, conversationId);

    // Save user message
    await this.saveMessage(userId, conversationId, 'user', message);

    // Create tools for this user
    const tools = [
      createGetCategoriesTool(userId),
      createExpenseTool(userId),
      createGetRecentExpensesTool(userId),
      createIncomeTool(userId),
      createGetExpenseSummaryTool(userId),
      createUpdateExpenseTool(userId),
      createDeleteExpenseTool(userId),
      createSearchExpensesTool(userId),
      createGenerateReportTool(userId),
      createChartGeneratorTool(userId),
    ];

    // Bind tools to the model
    const modelWithTools = this.model.bindTools(tools);

    // Add system message for context
    const systemMessage = new SystemMessage(
      `You are a helpful AI assistant for an expense tracking application. You can help users:

1. **Create expenses** - Extract information from natural language (e.g., "I spent $50 on lunch today")
2. **Create income** - Record income naturally (e.g., "I got paid $3000 from my job")
3. **View expenses** - Show recent expenses and spending patterns
4. **Get summaries** - Provide spending totals by period (week, month, year)
5. **Update expenses** - Fix mistakes in existing expenses
6. **Delete expenses** - Remove duplicate or incorrect expenses (ask for confirmation first!)
7. **Search expenses** - Find specific transactions by notes/description
8. **Generate reports** - Create downloadable financial reports with expenses and income data
9. **Generate charts** - Create visual charts and graphs showing financial data

**When creating expenses or income:**
- Extract amount, category/source, date, and notes from the message
- Use get_categories tool to find the correct category ID (match names intelligently)
- If information is missing, ask the user for clarification
- Confirm the action was successful with a friendly message

**Parse dates intelligently:**
- "today" = current date
- "yesterday" = one day ago
- "last Monday", "last week", etc. = calculate the appropriate date
- Specific dates like "January 15" or "15th" = parse to ISO format

**For updates and deletions:**
- Use get_recent_expenses first to find the expense ID
- For deletions, ALWAYS ask for user confirmation before proceeding
- Confirm what was changed or deleted

**For summaries and searches:**
- Use get_expense_summary for questions like "how much did I spend this month?"
- Use search_expenses for finding specific merchants or items

**For report generation:**
- Use generate_financial_report when users ask for reports, exports, or downloads
- Provide the report ID and download link to the user
- Explain that they can download the report in CSV or JSON format
- Report types: summary (quick overview), detailed (all transactions), monthly, yearly, custom (date range)

**For chart/graph generation:**
- ALWAYS use generate_financial_chart when users ask for: "graph", "chart", "visual", "pie chart", "bar chart", "show visually", "visualize", "diagram", "plot"
- You CAN generate visual charts! Use the generate_financial_chart tool
- The tool will return an image URL that will be displayed in the chat
- Chart types: pie (category breakdown), bar (comparison), line (trends), auto (AI decides)
- Default period is last 30 days, but can be customized
- When you receive the imageUrl from the tool, respond with ONLY the image URL on a single line, nothing else
- Format: Just the URL, like: https://example.com/image.png
- DO NOT say you cannot generate charts - you have the tool to do it!

Be conversational, helpful, and proactive. When you successfully perform an action, confirm it clearly.`
    );

    // Combine system message, history, and new message
    const messages: BaseMessage[] = [
      systemMessage,
      ...chatHistory,
      new HumanMessage(message),
    ];

    try {
      // Invoke the model with tools
      let response = await modelWithTools.invoke(messages);

      // Handle tool calls if present
      while (response.tool_calls && response.tool_calls.length > 0) {
        // Execute each tool call
        const toolMessages: BaseMessage[] = [];
        let chartImageUrl: string | null = null;

        for (const toolCall of response.tool_calls) {
          const tool = tools.find(t => t.name === toolCall.name);
          if (tool) {
            const toolResult = await tool.func(toolCall.args);

            // Special handling for chart generation tool
            if (toolCall.name === 'generate_financial_chart') {
              try {
                const parsedResult = JSON.parse(toolResult);
                if (parsedResult.success && parsedResult.imageUrl) {
                  // Store the image URL to return directly
                  chartImageUrl = parsedResult.imageUrl;

                  // Send a simplified message to LLM (without the huge base64 data)
                  toolMessages.push({
                    role: 'tool',
                    content: JSON.stringify({
                      success: true,
                      message: 'Chart generated successfully',
                      chartType: parsedResult.chartType
                    }),
                    tool_call_id: toolCall.id,
                  } as any);
                  continue;
                }
              } catch (e) {
                // If parsing fails, use the original result
              }
            }

            toolMessages.push({
              role: 'tool',
              content: toolResult,
              tool_call_id: toolCall.id,
            } as any);
          }
        }

        // If we have a chart image, return it directly without going back to LLM
        if (chartImageUrl) {
          await this.saveMessage(userId, conversationId, 'assistant', chartImageUrl);
          return chartImageUrl;
        }

        // Add tool results to messages and get next response
        messages.push(response);
        messages.push(...toolMessages);
        response = await modelWithTools.invoke(messages);
      }

      const aiResponse = response.content as string;

      // Save AI response
      await this.saveMessage(userId, conversationId, 'assistant', aiResponse);

      return aiResponse;
    } catch (error: any) {
      console.error('Error in sendMessage with tools:', error);

      // Fallback to simple response without tools
      const fallbackResponse = await this.model.invoke([...chatHistory, new HumanMessage(message)]);
      const aiResponse = fallbackResponse.content as string;
      await this.saveMessage(userId, conversationId, 'assistant', aiResponse);

      return aiResponse;
    }
  }

  /**
   * Clear conversation history
   */
  async clearConversation(userId: string, conversationId: string): Promise<void> {
    await ChatMessage.deleteMany({
      userId: new mongoose.Types.ObjectId(userId),
      conversationId,
    });
  }

  /**
   * Get conversation history
   */
  async getConversationHistory(userId: string, conversationId: string) {
    return await ChatMessage.find({
      userId: new mongoose.Types.ObjectId(userId),
      conversationId,
    })
      .sort({ createdAt: 1 })
      .select('role content createdAt');
  }
}

// Factory function to create chat service based on environment
export function createChatService(): ChatService {
  const provider = (process.env.AI_PROVIDER || 'openai') as AIProvider;
  const apiKey =
    provider === 'openai'
      ? process.env.OPENAI_API_KEY || ''
      : process.env.GEMINI_API_KEY || '';
  const model = process.env.AI_MODEL;

  if (!apiKey) {
    throw new Error(`API key for ${provider} is not configured`);
  }

  return new ChatService({ provider, apiKey, model });
}


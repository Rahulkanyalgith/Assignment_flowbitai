'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { sendChatMessage, type ChatMessage } from '@/lib/api';
import { Send, Loader2, Database } from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';

export default function ChatWithData() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await sendChatMessage(input);
      
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: 'Here are the results for your query:',
        sql: response.sql,
        results: response.results,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: `Error: ${error.response?.data?.message || error.message || 'Failed to process your query. Please ensure the Vanna AI server is running.'}`,
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Chat with Your Data
          </CardTitle>
          <p className="text-sm text-gray-500">
            Ask questions about your financial data in natural language. Powered by Vanna AI + Groq.
          </p>
        </CardHeader>
        <CardContent>
          {/* Example Questions */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">Example Questions:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• What's the total spend in the last 90 days?</li>
              <li>• List top 5 vendors by spend</li>
              <li>• Show overdue invoices as of today</li>
              <li>• What is the average invoice value by category?</li>
            </ul>
          </div>

          {/* Chat Messages */}
          <div className="space-y-4 mb-6 max-h-[500px] overflow-y-auto">
            {messages.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Database className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p>Start a conversation by asking a question about your data</p>
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-blue-50 ml-12'
                      : 'bg-gray-50 mr-12'
                  }`}
                >
                  <div className="font-semibold mb-2">
                    {message.role === 'user' ? 'You' : 'AI Assistant'}
                  </div>
                  <div className="text-gray-700">{message.content}</div>

                  {/* SQL Query Display */}
                  {message.sql && (
                    <div className="mt-4">
                      <div className="text-xs font-semibold text-gray-600 mb-2">
                        Generated SQL:
                      </div>
                      <pre className="bg-gray-900 text-green-400 p-3 rounded text-xs overflow-x-auto">
                        {message.sql}
                      </pre>
                    </div>
                  )}

                  {/* Results Table */}
                  {message.results && message.results.length > 0 && (
                    <div className="mt-4">
                      <div className="text-xs font-semibold text-gray-600 mb-2">
                        Results ({message.results.length} rows):
                      </div>
                      <div className="border rounded-lg overflow-hidden">
                        <div className="max-h-[300px] overflow-auto">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-gray-100">
                                {Object.keys(message.results[0]).map((key) => (
                                  <TableHead key={key} className="font-semibold">
                                    {key}
                                  </TableHead>
                                ))}
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {message.results.map((row: any, rowIndex: number) => (
                                <TableRow key={rowIndex}>
                                  {Object.values(row).map((value: any, colIndex: number) => (
                                    <TableCell key={colIndex}>
                                      {value !== null && value !== undefined
                                        ? String(value)
                                        : '-'}
                                    </TableCell>
                                  ))}
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}

            {loading && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">Processing your query...</span>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="flex gap-2">
            <Input
              placeholder="Ask a question about your data..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
              className="flex-1"
            />
            <Button onClick={handleSend} disabled={loading || !input.trim()}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

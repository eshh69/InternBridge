import React from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { MessageSquare, Send } from 'lucide-react';

export const ChatPage = () => {
  return (
    <div className="h-[70vh] flex flex-col md:flex-row gap-4">
      {/* Sidebar: Conversation List */}
      <Card className="w-full md:w-80 p-4 flex flex-col">
        <h2 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-indigo-600" />
          Conversations
        </h2>
        <div className="space-y-2 overflow-y-auto flex-1">
          <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-lg cursor-pointer">
            <h4 className="font-semibold text-sm text-gray-900">Virtusa Hiring Team</h4>
            <p className="text-xs text-gray-500 truncate mt-1">Thank you for submitting your application!</p>
          </div>
        </div>
      </Card>

      {/* Main Chat Window */}
      <Card className="flex-1 p-4 flex flex-col justify-between">
        <div className="border-b pb-3 mb-4">
          <h3 className="font-bold text-gray-900">Virtusa Hiring Team</h3>
          <p className="text-xs text-emerald-600 font-medium">● Online</p>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 p-2">
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-800 rounded-lg px-4 py-2 text-sm max-w-md">
              Hello! We received your application for the Frontend Intern position.
            </div>
          </div>
        </div>

        <div className="pt-3 border-t flex gap-2">
          <input
            type="text"
            placeholder="Type your message..."
            className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <Button variant="primary" size="md">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
};

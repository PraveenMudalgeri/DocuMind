import { useState, useRef, useEffect } from "react";
import { MessageBubble } from "./MessageBubble";
import { QueryInput } from "./QueryInput";
import { TypingIndicator } from "./TypingIndicator";
import { ragService } from "../../services/ragService";
import { exportService } from "../../services/exportService";
import { useToast } from "../../hooks/useToast";

export function ChatInterface({ session, onSessionUpdate, selectedDocuments = [] }) {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [responseStyle, setResponseStyle] = useState('auto');
  const messagesEndRef = useRef(null);
  const { showToast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Load messages from session only when session ID changes
  const [currentSessionId, setCurrentSessionId] = useState(null);

  useEffect(() => {
    if (session) {
      // Only update messages if session ID actually changed
      if (session.session_id !== currentSessionId) {
        setCurrentSessionId(session.session_id);
        setMessages(session.messages || []);
      }
    } else {
      setCurrentSessionId(null);
      setMessages([]);
    }
  }, [session, currentSessionId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleExportChat = async (format) => {
    if (!session || messages.length === 0) {
      showToast({
        type: "error",
        message: "No messages to export",
      });
      return;
    }

    try {
      await exportService.exportChatSession(session, messages, format);
      showToast({
        type: 'success',
        message: `Chat exported as ${format.toUpperCase()}`,
      });
    } catch (error) {
      console.error('Export error:', error);
      showToast({
        type: 'error',
        message: error.message || 'Failed to export chat',
      });
    }
  };

  const handleSendMessage = async (query) => {
    if (!session) {
      showToast({
        type: "error",
        message: "Please create or select a chat session first",
      });
      return;
    }

    // Check if documents are selected
    if (!selectedDocuments || selectedDocuments.length === 0) {
      showToast({
        type: "warning",
        message: "Please select at least one document from the sidebar to chat with",
      });
      return;
    }

    console.log("Sending message:", {
      query,
      sessionId: session.session_id,
      selectedDocuments
    });

    const userMessage = {
      role: "user",
      content: query,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await ragService.query(query, 5, session.session_id, selectedDocuments, responseStyle);

      console.log("Received response:", response);

      // Validate response
      if (!response || !response.answer) {
        throw new Error("Invalid response from server");
      }

      const assistantMessage = {
        role: "assistant",
        content: response.answer,
        sources: response.sources || [],
        query: query, // Store the original query with the response
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Notify parent to refresh session
      if (onSessionUpdate) {
        onSessionUpdate();
      }
    } catch (error) {
      console.error("Error sending message:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });

      // Get the actual error message from API or use a default
      const apiError = error.response?.data?.detail || error.response?.data?.answer || error.message;
      const isQuotaError = apiError?.toLowerCase().includes('quota');
      const isTimeoutError = error.code === 'ECONNABORTED' || apiError?.toLowerCase().includes('timeout');

      // Add error message to chat with specific details
      const errorMessage = {
        role: "assistant",
        content: isQuotaError
          ? "⚠️ **API Quota Exceeded**\n\nThe embedding service has reached its daily limit. Please try again in 24 hours or contact your administrator."
          : isTimeoutError
            ? "⏳ **Processing Timeout**\n\nThe request is taking longer than expected. The system may still be processing your query in the background. Please wait a moment and refresh the page to check for updates."
            : `❌ **Error:** ${apiError || 'Something went wrong. Please try again.'}`,
        timestamp: new Date().toISOString(),
        isError: true
      };
      setMessages((prev) => [...prev, errorMessage]);

      showToast({
        type: "error",
        message: isQuotaError
          ? "API quota exceeded. Please wait before trying again."
          : isTimeoutError
            ? "Request timed out. Processing may still be ongoing - please refresh to check."
            : (apiError || "Failed to get response. Please try again."),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 lg:px-8 py-4 pt-6 md:pt-4 pb-32 md:pb-4">
        {!session ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-orange-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No chat selected
            </h3>
            <p className="text-gray-600 max-w-md">
              Create a new chat or select an existing one from the sidebar.
            </p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-orange-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Start a conversation
            </h3>
            <p className="text-gray-600 max-w-md mb-4">
              Ask questions about your documents and get intelligent,
              context-aware answers.
            </p>

            {/* Document selection reminder */}
            {(!selectedDocuments || selectedDocuments.length === 0) && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg max-w-md">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-left">
                    <p className="text-sm font-medium text-blue-900 mb-1">
                      Select documents to get started
                    </p>
                    <p className="text-xs text-blue-700">
                      Open the sidebar and select one or more documents to chat with. Your questions will only search through the selected documents.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {selectedDocuments && selectedDocuments.length > 0 && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  <span className="font-medium">{selectedDocuments.length}</span> document{selectedDocuments.length > 1 ? 's' : ''} selected
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-5xl mx-auto space-y-6">
            {messages.map((message, index) => {
              // For assistant messages, find the previous user message if query is not present
              let queryForMessage = message.query;
              if (
                message.role === "assistant" &&
                !queryForMessage &&
                index > 0
              ) {
                // Look back to find the last user message
                for (let i = index - 1; i >= 0; i--) {
                  if (messages[i].role === "user") {
                    queryForMessage = messages[i].content;
                    break;
                  }
                }
              }

              return (
                <MessageBubble
                  key={index}
                  type={message.role}
                  {...message}
                  query={queryForMessage}
                />
              );
            })}
            {isLoading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area - Fixed to bottom on mobile */}
      <div className="fixed md:relative bottom-0 left-0 right-0 md:bottom-auto md:left-auto md:right-auto border-t border-gray-200 bg-white px-4 md:px-6 lg:px-8 py-3 sm:py-4 pb-safe z-10">
        <div className="max-w-5xl mx-auto">
          <QueryInput
            onSend={handleSendMessage}
            onExportChat={handleExportChat}
            disabled={isLoading || !session}
            responseStyle={responseStyle}
            onResponseStyleChange={setResponseStyle}
          />
        </div>
      </div>
    </div>
  );
}

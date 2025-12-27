import { useState, useRef, useEffect } from 'react';
import { QueryResultsTable } from './QueryResultsTable';
import { VoiceInput } from '../rag/VoiceInput';

export function DatabaseChatInterface({ activeConnection, onExecuteQuery }) {
    const [query, setQuery] = useState('');
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Clear chat when connection changes (including disconnect)
    useEffect(() => {
        setMessages([]);
        setQuery('');
    }, [activeConnection?.id]);

    const exampleQueries = [
        "Show me all records from the primary table",
        "Give me a summary of the most frequent entries",
        "Find the top 10 items by their numeric value",
        "Show me recent activity from the last 7 days",
        "Group the data by category and show counts",
        "Filter for all items with a specific status or tag"
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!query.trim() || !activeConnection) return;

        const userMessage = {
            id: Date.now(),
            type: 'user',
            content: query,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setQuery('');
        setIsLoading(true);

        try {
            const result = await onExecuteQuery(activeConnection.id, query);

            const assistantMessage = {
                id: Date.now() + 1,
                type: 'assistant',
                content: result.success ? 'Query executed successfully' : 'Query failed',
                sql: result.generated_sql,
                results: result.results,
                rowCount: result.row_count,
                error: result.error,
                success: result.success,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            // Only add error message if there's actual error content
            const errorText = error.message || 'Unknown error occurred';
            if (errorText && errorText.trim()) {
                const errorMessage = {
                    id: Date.now() + 1,
                    type: 'assistant',
                    content: 'Error executing query',
                    error: errorText,
                    success: false,
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, errorMessage]);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleExampleQuery = (exampleQuery) => {
        setQuery(exampleQuery);
    };

    if (!activeConnection) {
        return (
            <div className="h-full flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <svg
                        className="mx-auto h-16 w-16 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                    </svg>
                    <h3 className="mt-4 text-lg font-medium text-gray-900">No Database Selected</h3>
                    <p className="mt-2 text-sm text-gray-500">
                        Connect to a database to start querying with natural language
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-white">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Database Chat</h2>
                        <p className="text-xs text-gray-500 mt-1">
                            Connected to: <span className="font-medium">{activeConnection.databaseType}</span>
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setMessages([])}
                            className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-2"
                            title="Clear chat history"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Clear Chat
                        </button>
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${activeConnection.status === 'connected' ? 'bg-green-500' : 'bg-red-500'
                                }`}></div>
                            <span className="text-xs text-gray-600">
                                {activeConnection.status === 'connected' ? 'Connected' : 'Disconnected'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-4 md:px-8 py-4 pt-16 md:pt-4">
                <div className="max-w-5xl mx-auto space-y-6">
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center py-12">
                            <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mb-6">
                                <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Database Assistant</h3>
                            <p className="text-sm text-gray-500 max-w-sm mb-8">
                                Ask natural language questions to query your database. DocuMind will generate and execute SQL for you.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl w-full">
                                {exampleQueries.map((example, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleExampleQuery(example)}
                                        className="text-left p-4 bg-white hover:bg-orange-50/30 rounded-xl border border-gray-100 shadow-sm hover:shadow transition-all text-sm text-gray-700 group"
                                    >
                                        <span className="text-orange-500 font-bold mr-2 opacity-50 group-hover:opacity-100">?</span>
                                        "{example}"
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        messages.map((message) => (
                            <MessageBubble key={message.id} message={message} />
                        ))
                    )}
                    {isLoading && (
                        <div className="flex items-center gap-2 text-gray-500">
                            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span className="text-sm">Generating SQL and executing query...</span>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-200 bg-white px-4 md:px-8 py-4">
                <div className="max-w-5xl mx-auto">
                    <div className="relative bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
                        <form onSubmit={handleSubmit}>
                            {/* Textarea Area */}
                            <div className="px-4 pt-3 pb-1">
                                <textarea
                                    ref={textareaRef}
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Ask a question about your database..."
                                    disabled={isLoading}
                                    className="w-full bg-transparent border-none focus:ring-0 focus:outline-none outline-none text-gray-800 placeholder-gray-400 resize-none text-[15px] leading-relaxed py-1 max-h-[200px] overflow-y-auto"
                                    style={{ minHeight: '40px' }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSubmit(e);
                                        }
                                    }}
                                />
                            </div>

                            {/* Bottom Action Row */}
                            <div className="flex items-center justify-between px-3 pb-2.5">
                                <div className="flex items-center gap-2">
                                    <div className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-orange-100">
                                        SQL Mode
                                    </div>
                                    <span className="text-[10px] text-gray-400 uppercase tracking-tight">Connected: {activeConnection.databaseType}</span>
                                </div>

                                <div className="flex items-center gap-2">
                                    {/* Voice Input */}
                                    <VoiceInput
                                        onTranscribe={(text) => setQuery(prev => prev + (prev ? ' ' : '') + text)}
                                        disabled={isLoading}
                                    />

                                    {/* Send Button */}
                                    <button
                                        type="submit"
                                        disabled={isLoading || !query.trim()}
                                        className={`
                                            w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-300
                                            ${query.trim()
                                                ? 'bg-orange-600 text-white hover:bg-orange-700 shadow-md shadow-orange-200 active:scale-95'
                                                : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                                            }
                                        `}
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19V5m0 0l-7 7m7-7l7 7" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

function MessageBubble({ message }) {
    const [showSQL, setShowSQL] = useState(false);

    if (message.type === 'user') {
        return (
            <div className="flex justify-end">
                <div className="max-w-3xl bg-slate-800 text-white rounded-lg px-4 py-2.5 shadow-sm">
                    <p className="text-sm">{message.content}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex justify-start">
            <div className="max-w-5xl w-full bg-white border border-gray-100 rounded-xl p-5 shadow-sm space-y-4">
                {message.success ? (
                    <>
                        {/* SQL Display */}
                        {message.sql && (
                            <div>
                                <button
                                    onClick={() => setShowSQL(!showSQL)}
                                    className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                                >
                                    <svg className={`w-4 h-4 transform transition-transform ${showSQL ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                    Generated SQL
                                </button>
                                {showSQL && (
                                    <pre className="mt-2 p-3 bg-gray-800 text-green-400 rounded text-xs overflow-x-auto">
                                        {message.sql}
                                    </pre>
                                )}
                            </div>
                        )}

                        {/* Results */}
                        {message.results && message.results.length > 0 ? (
                            <QueryResultsTable results={message.results} rowCount={message.rowCount} />
                        ) : (
                            <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <div className="flex items-start gap-3">
                                    <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <div>
                                        <p className="text-sm font-medium text-blue-900">No data found</p>
                                        <p className="text-xs text-blue-700 mt-1">
                                            The query executed successfully but returned 0 rows. Try adjusting your search criteria.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-red-600">
                        <p className="font-medium">Error:</p>
                        <p className="text-sm mt-1">{message.error}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

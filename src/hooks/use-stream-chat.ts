
"use client";

import { useState } from 'react';
import { streamChat } from '@/ai/flows/stream-chat-flow';
import { useAppContext } from '@/context/app-provider';
import { useToast } from './use-toast';


export interface ChatMessage {
    id: string;
    text: string;
    sender: "user" | "bot";
}
  
interface UseStreamChatOptions {
    onFinish: (message: string) => void;
    onError: (error: Error) => void;
}

export function useStreamChat({ onFinish, onError }: UseStreamChatOptions) {
    const { toast } = useToast();
    const { vehicles, serviceRecords, expenses, insurancePolicies } = useAppContext();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [currentResponse, setCurrentResponse] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        setIsLoading(true);
        setCurrentResponse('');
        const userInput = input;
        
        // Add user's message to history before clearing input
        const userMessage: ChatMessage = { id: `user-${Date.now()}`, text: userInput, sender: 'user' };
        const updatedHistory = [...messages, userMessage];

        setInput('');

        try {
            const fullResponse = await streamChat(
                {
                    query: userInput,
                    history: updatedHistory,
                    vehicles,
                    serviceRecords,
                    expenses,
                    insurancePolicies,
                },
                (chunk) => {
                    setCurrentResponse(prev => prev + chunk);
                }
            );

            // Create the final bot message once streaming is complete
            const botMessage: ChatMessage = { id: `bot-${Date.now()}`, text: fullResponse, sender: 'bot' };
            setMessages(prev => [...prev, botMessage]);

        } catch (error) {
            console.error("Chat streaming error:", error);
            const err = error instanceof Error ? error : new Error('An unknown error occurred.');
            onError(err);
            toast({
                variant: "destructive",
                title: "Oh no! Something went wrong.",
                description: "There was a problem communicating with the AI. Please try again.",
            });
        } finally {
            setIsLoading(false);
            setCurrentResponse('');
        }
    };
    
    return {
        messages,
        setMessages,
        input,
        handleInputChange,
        handleSubmit,
        isLoading,
        currentResponse,
    };
}

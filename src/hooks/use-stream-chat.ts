
"use client";

import { useState, useCallback } from 'react';
import { streamChat } from '@/ai/flows/stream-chat-flow';
import { useAppContext } from '@/context/app-provider';
import { useToast } from './use-toast';


export interface ChatMessage {
    id: string;
    text: string;
    sender: "user" | "bot";
}
  
interface UseStreamChatOptions {
    onNewMessage: (message: ChatMessage) => void;
    onError: (error: Error) => void;
}

export function useStreamChat({ onNewMessage, onError }: UseStreamChatOptions) {
    const { toast } = useToast();
    const { vehicles, serviceRecords, expenses, insurancePolicies } = useAppContext();
    const [input, setInput] = useState('');
    const [currentResponse, setCurrentResponse] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>, history: ChatMessage[]) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        setIsLoading(true);
        setCurrentResponse('');
        const userInput = input;
        
        // Optimistically add user message to the UI
        onNewMessage({ id: `user-${Date.now()}`, text: userInput, sender: 'user' });
        setInput('');

        try {
            let accumulatedResponse = '';
            
            await streamChat(
                {
                    query: userInput,
                    history: history,
                    vehicles,
                    serviceRecords,
                    expenses,
                    insurancePolicies,
                },
                (chunk) => {
                    accumulatedResponse += chunk;
                    setCurrentResponse(accumulatedResponse);
                }
            );

            // Add the final bot response to the UI
            onNewMessage({ id: `bot-${Date.now()}`, text: accumulatedResponse, sender: 'bot' });

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
        input,
        handleInputChange,
        handleSubmit,
        isLoading,
        currentResponse,
    };
}

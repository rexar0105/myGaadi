
"use client";

import { useState, useCallback } from 'react';
import { streamChat } from '@/ai/flows/stream-chat-flow';
import { useAppContext } from '@/context/app-provider';
import { useToast } from './use-toast';

interface UseStreamChatOptions {
    onFinish: (userInput: string, response: string) => void;
    onError: (error: Error) => void;
}

export function useStreamChat({ onFinish, onError }: UseStreamChatOptions) {
    const { toast } = useToast();
    const { vehicles, serviceRecords, expenses, insurancePolicies } = useAppContext();
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
        setInput('');

        try {
            let accumulatedResponse = '';
            
            await streamChat(
                {
                    query: userInput,
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

            onFinish(userInput, accumulatedResponse);

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


"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Sparkles, User, Bot, Wand2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAppContext } from "@/context/app-provider";
import { chatWithGaadi } from "@/ai/flows/chat-flow";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { ConditionAssessment } from "@/components/condition-assessment";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
}

const AppLogo = (props: React.SVGProps<SVGSVGElement>) => (
    <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <rect width="32" height="32" rx="8" className="fill-primary"/>
        <circle cx="16" cy="16" r="10" className="stroke-primary-foreground" strokeOpacity="0.8" strokeWidth="2"/>
        <path d="M16 16L22 13" className="stroke-primary-foreground" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="16" cy="16" r="2" className="fill-primary-foreground"/>
    </svg>
)

function ChatAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const {
    vehicles,
    serviceRecords,
    expenses,
    insurancePolicies,
    user,
    profile,
  } = useAppContext();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    setMessages([
        { id: 'welcome-1', text: "Hello! I'm your myGaadi Assistant. How can I help you today?", sender: 'bot' },
        { id: 'welcome-2', text: "You can ask me things like 'When is the next service for my car?' or 'How much did I spend on fuel last month?'.", sender: 'bot'}
    ]);
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { id: `user-${Date.now()}`, text: input, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const result = await chatWithGaadi({
        query: input,
        vehicles,
        serviceRecords,
        expenses,
        insurancePolicies,
      });

      const botMessage: Message = { id: `bot-${Date.now()}`, text: result.answer, sender: "bot" };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Chat API error:", error);
      toast({
        variant: "destructive",
        title: "Oh no! Something went wrong.",
        description: "There was a problem communicating with the AI. Please try again.",
      });
      const errorMessage: Message = { id: `bot-error-${Date.now()}`, text: "I'm sorry, but I'm having trouble connecting right now. Please try again in a moment.", sender: 'bot'};
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (nameOrEmail: string) => {
    if (!nameOrEmail) return "U";
    const parts = nameOrEmail.split(' ').filter(Boolean);
    if(parts.length > 1 && parts[0] && parts[1]) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return nameOrEmail[0].toUpperCase();
  };
    
  return (
    <Card className="flex-1 flex flex-col h-[70vh]">
        <CardContent className="flex-1 p-4 space-y-4 overflow-y-auto">
            {messages.map((message) => (
            <div
                key={message.id}
                className={cn(
                "flex items-start gap-3",
                message.sender === "user" ? "justify-end" : "justify-start"
                )}
            >
                {message.sender === "bot" && (
                <Avatar className="h-8 w-8 bg-primary/20 text-primary">
                    <AvatarFallback><AppLogo /></AvatarFallback>
                </Avatar>
                )}
                <div
                className={cn(
                    "max-w-xs md:max-w-md p-3 rounded-xl",
                    message.sender === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                )}
                >
                    <p className="text-sm">{message.text}</p>
                </div>
                    {message.sender === "user" && (
                    <Avatar className="h-8 w-8">
                            <AvatarImage src={profile?.avatarUrl ?? `https://avatar.vercel.sh/${user?.email}.png`} alt={profile?.name || user?.email || ''} />
                        <AvatarFallback>{getInitials(profile?.name || user?.email || 'U')}</AvatarFallback>
                    </Avatar>
                )}
            </div>
            ))}
            {isLoading && (
                    <div className="flex items-start gap-3 justify-start">
                    <Avatar className="h-8 w-8 bg-primary/20 text-primary">
                        <AvatarFallback><AppLogo /></AvatarFallback>
                    </Avatar>
                    <div className="max-w-xs md:max-w-md p-3 rounded-xl bg-muted flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <p className="text-sm text-muted-foreground">Thinking...</p>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
        </CardContent>
        
        <div className="p-4 border-t bg-background">
            <form onSubmit={handleSend} className="flex items-center gap-2">
                <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about your vehicles..."
                    autoComplete="off"
                    disabled={isLoading}
                />
                <Button type="submit" disabled={isLoading || !input.trim()}>
                    {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                    <Send className="h-4 w-4" />
                    )}
                    <span className="sr-only">Send</span>
                </Button>
            </form>
        </div>
    </Card>
  )
}


export default function AssessmentPage() {
    return (
        <div className="p-4 md:p-8 animate-fade-in">
            <div className="mb-8">
                <h1 className="text-xl md:text-3xl font-bold text-foreground mb-1">
                    AI Hub
                </h1>
                <p className="text-muted-foreground">
                    Use AI to assess your vehicle's condition or chat with your Gaadi Assistant.
                </p>
            </div>
            <Tabs defaultValue="assessment" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="assessment"><Wand2/>Condition Assessment</TabsTrigger>
                    <TabsTrigger value="chat"><MessageSquare/>Gaadi Assistant</TabsTrigger>
                </TabsList>
                <TabsContent value="assessment" className="mt-4">
                    <ConditionAssessment />
                </TabsContent>
                <TabsContent value="chat" className="mt-4">
                    <ChatAssistant />
                </TabsContent>
            </Tabs>
        </div>
    )
}

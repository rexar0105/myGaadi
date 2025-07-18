
'use server';
/**
 * @fileOverview A conversational AI agent for querying vehicle data.
 *
 * - chatWithGaadi - A function that handles the conversational chat process.
 * - ChatWithGaadiInput - The input type for the chatWithGaadi function.
 * - ChatWithGaadiOutput - The return type for the chatWithGaadi function.
 */

import {ai} from '@/ai/genkit';
import {z, generate} from 'genkit';
import type { Vehicle, ServiceRecord, Expense, InsurancePolicy } from '@/lib/types';
import { VehicleSchema, ServiceRecordSchema, ExpenseSchema, InsurancePolicySchema } from '@/ai/schemas';


// Define tool schemas
const VehicleInfoInputSchema = z.object({
  vehicleName: z.string().optional().describe('The name of the vehicle to search for, e.g., "My Red Car"'),
});

const ServiceInfoInputSchema = z.object({
  vehicleName: z.string().optional().describe('The name of the vehicle to get service history for.'),
  query: z.string().optional().describe('Specific query about services, e.g., "last service", "tire change"'),
});

const ExpenseInfoInputSchema = z.object({
    vehicleName: z.string().optional().describe('The name of the vehicle to get expense history for.'),
    category: z.string().optional().describe('The category of expense, e.g., "Fuel", "Repair"'),
});

const InsuranceInfoInputSchema = z.object({
    vehicleName: z.string().optional().describe('The name of the vehicle to get insurance info for.'),
});


// Define flow input schema, which includes the user's data
const ChatWithGaadiInputSchema = z.object({
  query: z.string().describe("The user's question or message."),
  vehicles: z.array(VehicleSchema).describe("A list of the user's vehicles."),
  serviceRecords: z.array(ServiceRecordSchema).describe("A list of the user's service records."),
  expenses: z.array(ExpenseSchema).describe("A list of the user's expenses."),
  insurancePolicies: z.array(InsurancePolicySchema).describe("A list of the user's insurance policies."),
});
export type ChatWithGaadiInput = z.infer<typeof ChatWithGaadiInputSchema>;

// Define flow output schema
const ChatWithGaadiOutputSchema = z.object({
  answer: z.string().describe('The AI assistant\'s response to the user query.'),
});
export type ChatWithGaadiOutput = z.infer<typeof ChatWithGaadiOutputSchema>;

// Main exported function to be called from the UI
export async function chatWithGaadi(input: ChatWithGaadiInput): Promise<ChatWithGaadiOutput> {
  return chatWithGaadiFlow(input);
}


// --- GENKIT FLOW IMPLEMENTATION ---

const chatWithGaadiFlow = ai.defineFlow(
  {
    name: 'chatWithGaadiFlow',
    inputSchema: ChatWithGaadiInputSchema,
    outputSchema: ChatWithGaadiOutputSchema,
  },
  async ({ query, vehicles, serviceRecords, expenses, insurancePolicies }) => {
    
    // Dynamically define tools with access to the request's data
    const getVehicleInfo = ai.defineTool(
        {
          name: 'getVehicleInfo',
          description: 'Get information about the user\'s vehicles, like make, model, year, and registration number.',
          inputSchema: VehicleInfoInputSchema,
          outputSchema: z.array(VehicleSchema),
        },
        async ({ vehicleName }) => {
            if (vehicleName) {
                return vehicles.filter(v => v.name.toLowerCase().includes(vehicleName.toLowerCase()));
            }
            return vehicles;
        }
    );

    const getServiceHistory = ai.defineTool(
        {
            name: 'getServiceHistory',
            description: 'Get the service history for vehicles, including dates, costs, and work performed.',
            inputSchema: ServiceInfoInputSchema,
            outputSchema: z.array(ServiceRecordSchema),
        },
        async ({ vehicleName, query }) => {
            let results: ServiceRecord[] = serviceRecords;
            if (vehicleName) {
                const lowerVehicleName = vehicleName.toLowerCase();
                results = results.filter(s => s.vehicleName.toLowerCase().includes(lowerVehicleName));
            }
            if (query) {
                const lowerQuery = query.toLowerCase();
                results = results.filter(s => s.service.toLowerCase().includes(lowerQuery) || s.notes?.toLowerCase().includes(lowerQuery));
            }
            return results;
        }
    );

    const getExpenseHistory = ai.defineTool(
        {
            name: 'getExpenseHistory',
            description: 'Get the expense history for vehicles, including amounts, categories, and dates.',
            inputSchema: ExpenseInfoInputSchema,
            outputSchema: z.array(ExpenseSchema),
        },
        async ({ vehicleName, category }) => {
            let results: Expense[] = expenses;
            if (vehicleName) {
                 const lowerVehicleName = vehicleName.toLowerCase();
                results = results.filter(e => e.vehicleName.toLowerCase().includes(lowerVehicleName));
            }
            if (category) {
                const lowerCategory = category.toLowerCase();
                results = results.filter(e => e.category.toLowerCase() === lowerCategory);
            }
            return results;
        }
    );

     const getInsuranceInfo = ai.defineTool(
        {
            name: 'getInsuranceInfo',
            description: 'Get insurance policy details for vehicles, like provider and expiry dates.',
            inputSchema: InsuranceInfoInputSchema,
            outputSchema: z.array(InsurancePolicySchema),
        },
        async ({ vehicleName }) => {
            if (vehicleName) {
                const lowerVehicleName = vehicleName.toLowerCase();
                return insurancePolicies.filter(p => p.vehicleName.toLowerCase().includes(lowerVehicleName));
            }
            return insurancePolicies;
        }
    );

    const { text } = await generate({
      model: 'googleai/gemini-2.0-flash',
      tools: [getVehicleInfo, getServiceHistory, getExpenseHistory, getInsuranceInfo],
      prompt: `You are Gaadi Mitra, a helpful and friendly AI that helps users manage their vehicle information.

      - Be concise and conversational.
      - Use the provided tools to answer the user's questions about their vehicles, services, expenses, and insurance.
      - If you don't have the information, say so. Don't make things up.
      - When providing dates, format them in a friendly way (e.g., "January 15, 2024").
      - When providing costs or amounts, always use the Indian Rupee symbol (₹).

      User's question: "${query}"`,
      config: {
        // Lower temperature for more factual, less creative answers
        temperature: 0.2,
      },
    });

    return { answer: text };
  }
);

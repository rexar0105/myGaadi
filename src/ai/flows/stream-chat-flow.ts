
'use server';
/**
 * @fileOverview A streaming conversational AI agent for querying vehicle data.
 *
 * - streamChat - A function that handles the conversational chat process and streams the response.
 * - StreamChatInput - The input type for the streamChat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { Vehicle, ServiceRecord, Expense, InsurancePolicy } from '@/lib/types';
import { generate } from 'genkit';

// Tool schemas from the non-streaming version can be reused.
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

// Flow input schema remains the same
const StreamChatInputSchema = z.object({
  query: z.string().describe("The user's question or message."),
  vehicles: z.array(z.any()).describe("A list of the user's vehicles."),
  serviceRecords: z.array(z.any()).describe("A list of the user's service records."),
  expenses: z.array(z.any()).describe("A list of the user's expenses."),
  insurancePolicies: z.array(z.any()).describe("A list of the user's insurance policies."),
});
export type StreamChatInput = z.infer<typeof StreamChatInputSchema>;


// The main exported function that the client will call.
// This function itself does not need to be a Genkit flow, as it orchestrates the streaming.
export async function streamChat(input: StreamChatInput, onChunk: (chunk: string) => void) {
  const { query, vehicles, serviceRecords, expenses, insurancePolicies } = input;
  
  // Dynamically define tools with access to the request's data, same as before.
  const getVehicleInfo = ai.defineTool(
      {
        name: 'getVehicleInfo',
        description: 'Get information about the user\'s vehicles, like make, model, year, and registration number.',
        inputSchema: VehicleInfoInputSchema,
        outputSchema: z.array(z.any()),
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
          outputSchema: z.array(z.any()),
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
          outputSchema: z.array(z.any()),
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
          outputSchema: z.array(z.any()),
      },
      async ({ vehicleName }) => {
          if (vehicleName) {
              const lowerVehicleName = vehicleName.toLowerCase();
              return insurancePolicies.filter(p => p.vehicleName.toLowerCase().includes(lowerVehicleName));
          }
          return insurancePolicies;
      }
  );

  // Use `generateStream` instead of `generate`
  const { stream, response } = generate({
    model: 'googleai/gemini-2.0-flash',
    tools: [getVehicleInfo, getServiceHistory, getExpenseHistory, getInsuranceInfo],
    prompt: `You are myGaadi Assistant, a helpful and friendly AI that helps users manage their vehicle information.

    - Be concise and conversational.
    - Use the provided tools to answer the user's questions about their vehicles, services, expenses, and insurance.
    - If you don't have the information, say so. Don't make things up.
    - When providing dates, format them in a friendly way (e.g., "January 15, 2024").
    - When providing costs or amounts, always use the Indian Rupee symbol (₹).

    User's question: "${query}"`,
    config: {
      temperature: 0.2,
    },
    stream: true, // Explicitly enable streaming
  });

  let fullText = '';
  // Iterate over the stream and send chunks to the client via the callback
  for await (const chunk of stream) {
    if (chunk.text) {
        onChunk(chunk.text);
        fullText += chunk.text;
    }
  }

  // The full response can be accessed after the stream is complete
  await response;
  
  // Return the full text for non-streaming fallback or logging
  return fullText;
}

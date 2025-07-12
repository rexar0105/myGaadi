'use server';

/**
 * @fileOverview Vehicle condition assessment flow.
 *
 * - assessVehicleCondition - Assesses the condition of a vehicle based on an image.
 * - AssessVehicleConditionInput - Input type for assessVehicleCondition.
 * - AssessVehicleConditionOutput - Output type for assessVehicleCondition.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AssessVehicleConditionInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of the vehicle, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AssessVehicleConditionInput = z.infer<typeof AssessVehicleConditionInputSchema>;

const AssessVehicleConditionOutputSchema = z.object({
  assessment: z.string().describe('The assessment of the vehicle condition.'),
  riskAssessment: z.string().describe('A risk assessment based on the condition.'),
  maintenanceTips: z.string().describe('General maintenance tips for the vehicle.'),
});
export type AssessVehicleConditionOutput = z.infer<typeof AssessVehicleConditionOutputSchema>;

export async function assessVehicleCondition(
  input: AssessVehicleConditionInput
): Promise<AssessVehicleConditionOutput> {
  return assessVehicleConditionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'assessVehicleConditionPrompt',
  input: {schema: AssessVehicleConditionInputSchema},
  output: {schema: AssessVehicleConditionOutputSchema},
  prompt: `You are an expert vehicle mechanic specializing in vehicle condition assessment.

You will use the photo to assess the vehicle's condition, provide a risk assessment, and give general maintenance tips.

Photo: {{media url=photoDataUri}}
`,
});

const assessVehicleConditionFlow = ai.defineFlow(
  {
    name: 'assessVehicleConditionFlow',
    inputSchema: AssessVehicleConditionInputSchema,
    outputSchema: AssessVehicleConditionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

'use server';

/**
 * @fileOverview A flow for generating a stylized image of a vehicle.
 *
 * - generateVehicleImage - Generates an image based on a vehicle's assessment.
 * - GenerateVehicleImageInput - Input type for generateVehicleImage.
 * - GenerateVehicleImageOutput - Output type for generateVehicleImage.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateVehicleImageInputSchema = z.object({
  assessment: z
    .string()
    .describe('The AI-generated text assessment of the vehicle condition.'),
  vehicleDescription: z
    .string()
    .describe('A simple description of the vehicle (e.g., "white car", "red suv").'),
});
export type GenerateVehicleImageInput = z.infer<typeof GenerateVehicleImageInputSchema>;

const GenerateVehicleImageOutputSchema = z.object({
  imageUrl: z
    .string()
    .describe(
      "The generated image as a data URI. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type GenerateVehicleImageOutput = z.infer<typeof GenerateVehicleImageOutputSchema>;

export async function generateVehicleImage(
  input: GenerateVehicleImageInput
): Promise<GenerateVehicleImageOutput> {
  return generateVehicleImageFlow(input);
}

const generateVehicleImageFlow = ai.defineFlow(
  {
    name: 'generateVehicleImageFlow',
    inputSchema: GenerateVehicleImageInputSchema,
    outputSchema: GenerateVehicleImageOutputSchema,
  },
  async ({assessment, vehicleDescription}) => {
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: `Generate a photorealistic, dramatic, and creative image of a ${vehicleDescription}.
      The setting and mood of the image should be inspired by this assessment of its condition: "${assessment}".

      - If the assessment is positive (e.g., "good condition", "well-maintained"), place the vehicle in a beautiful, epic, or adventurous setting like a scenic mountain pass at sunset, a modern city street at night with neon lights, or on a race track.
      - If the assessment is negative (e.g., "scratches", "dents", "needs a wash"), place it in a stylized, gritty, or moody setting like an urban garage, a back alley with dramatic lighting, or a workshop, implying it's about to be repaired or upgraded.

      The image should look like a professional automotive photograph. Do not include any text or people in the image.`,
      config: {
        responseModalities: ['IMAGE', 'TEXT'],
      },
    });

    if (!media) {
      throw new Error('Image generation failed to return media.');
    }

    return {
      imageUrl: media.url,
    };
  }
);

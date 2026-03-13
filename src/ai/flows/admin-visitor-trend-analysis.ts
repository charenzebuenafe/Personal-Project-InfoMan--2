'use server';
/**
 * @fileOverview An AI agent for analyzing visitor trends in the NEU Library.
 *
 * - adminVisitorTrendAnalysis - A function that handles the visitor trend analysis process.
 * - AdminVisitorTrendAnalysisInput - The input type for the adminVisitorTrendAnalysis function.
 * - AdminVisitorTrendAnalysisOutput - The return type for the adminVisitorTrendAnalysis function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define the schema for a single visitor log entry
const VisitorLogEntrySchema = z.object({
  checkInTime: z.string().datetime().describe('ISO 8601 formatted datetime of the visitor check-in.'),
  purposeOfVisit: z.string().describe('The purpose of the visitor\'s visit (e.g., reading books, research in thesis).'),
  collegeOrOffice: z.string().optional().describe('The college or office the visitor belongs to, if available.'),
});

// Define the input schema for the trend analysis flow
const AdminVisitorTrendAnalysisInputSchema = z.object({
  visitorLogs: z.array(VisitorLogEntrySchema).describe('An array of visitor log entries for analysis.'),
});
export type AdminVisitorTrendAnalysisInput = z.infer<typeof AdminVisitorTrendAnalysisInputSchema>;

// Define the output schema for the trend analysis flow
const AdminVisitorTrendAnalysisOutputSchema = z.object({
  overallSummary: z.string().describe('A high-level summary of visitor trends and insights, including overall visitor activity and changes over time.'),
  peakVisitorTimes: z.array(z.string()).describe('A list of identified peak visiting times (e.g., specific days of the week, hours of the day, or seasonal peaks).'),
  unusualActivities: z.array(z.string()).describe('A list of any unusual or anomalous visitor patterns detected (e.g., unexpected spikes or drops in activity, unusual visit purposes).'),
  purposeOfVisitBreakdown: z.record(z.string(), z.number()).describe('A breakdown of visitor counts by purpose of visit, showing the most common and least common reasons for visits.'),
  dailyVisitorCountTrend: z.string().describe('A summary of daily visitor count trends, highlighting increases, decreases, or stability.'),
  weeklyVisitorCountTrend: z.string().describe('A summary of weekly visitor count trends, highlighting increases, decreases, or stability.'),
  monthlyVisitorCountTrend: z.string().describe('A summary of monthly visitor count trends, highlighting increases, decreases, or stability.'),
  collegeOfficeBreakdown: z.record(z.string(), z.number()).optional().describe('A breakdown of visitor counts by college or office, showing which departments utilize the library most, if data is available. This field is omitted if no college/office data is present.'),
});
export type AdminVisitorTrendAnalysisOutput = z.infer<typeof AdminVisitorTrendAnalysisOutputSchema>;

// Exported wrapper function to call the Genkit flow
export async function adminVisitorTrendAnalysis(input: AdminVisitorTrendAnalysisInput): Promise<AdminVisitorTrendAnalysisOutput> {
  return adminVisitorTrendAnalysisFlow(input);
}

// Define the prompt for the AI model
const trendAnalysisPrompt = ai.definePrompt({
  name: 'adminVisitorTrendAnalysisPrompt',
  input: {schema: z.object({ stringifiedVisitorLogs: z.string() })}, // Prompt input expects a string
  output: {schema: AdminVisitorTrendAnalysisOutputSchema},
  prompt: `You are an AI assistant designed to analyze NEU Library visitor logs and provide insightful trends and patterns to administrators.\n\nAnalyze the following visitor log data, which is provided as a JSON array of entries, and identify key trends, peak times, and unusual activities.\nProvide a structured output in JSON format according to the provided output schema.\n\nHere is the visitor log data:\n{{{stringifiedVisitorLogs}}}\n\nInstructions:\n1. **Overall Summary**: Provide a concise, high-level summary of the main visitor trends observed.\n2. **Peak Visitor Times**: Identify specific days, hours, or periods where visitor activity is consistently high.\n3. **Unusual Activities**: Highlight any anomalies, unexpected spikes or drops, or unusual patterns that might warrant further investigation.\n4. **Purpose of Visit Breakdown**: Calculate and present the distribution of visitors based on their stated purpose of visit.\n5. **Daily Visitor Count Trend**: Describe the general trend of visitor counts on a daily basis (e.g., increasing, decreasing, stable, fluctuating).\n6. **Weekly Visitor Count Trend**: Describe the general trend of visitor counts on a weekly basis.\n7. **Monthly Visitor Count Trend**: Describe the general trend of visitor counts on a monthly basis.\n8. **College/Office Breakdown**: If 'collegeOrOffice' data is available in ANY of the logs, calculate and present the distribution of visitors by their college or office. If no 'collegeOrOffice' data is available at all in the provided logs, then this field should be omitted from the output JSON.\n\nEnsure the output is a valid JSON object matching the schema provided.`,
});

// Define the Genkit flow
const adminVisitorTrendAnalysisFlow = ai.defineFlow(
  {
    name: 'adminVisitorTrendAnalysisFlow',
    inputSchema: AdminVisitorTrendAnalysisInputSchema,
    outputSchema: AdminVisitorTrendAnalysisOutputSchema,
  },
  async (input) => {
    // Stringify the visitor logs before passing them to the prompt to ensure correct JSON formatting
    const stringifiedVisitorLogs = JSON.stringify(input.visitorLogs);

    const {output} = await trendAnalysisPrompt({stringifiedVisitorLogs});
    return output!;
  }
);

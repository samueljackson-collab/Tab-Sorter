/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function getAISortingSuggestions(
  tabs: { title: string; url: string; id: string }[],
  existingGroups: { name: string; id: string }[],
  userPreference: string
) {
  if (!process.env.GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY is not set.');
    return null;
  }

  const model = 'gemini-3-flash-preview';
  const prompt = `
    You are an expert at organizing browser tabs.
    Your task is to sort the following list of tabs into logical groups.

    Here are the tabs to sort:
    ${tabs.map(t => `- ${t.title} (URL: ${t.url}) (ID: ${t.id})`).join('\n')}

    Here are the existing groups you can use:
    ${existingGroups.map(g => `- ${g.name} (ID: ${g.id})`).join('\n')}

    The user's sorting preference is: "${userPreference}"

    Instructions:
    1. You can create new groups if necessary.
    2. You can use existing groups.
    3. Each tab must be assigned to exactly one group.
    4. Your output must be a valid JSON object.
    5. The JSON object should be an array of group objects, where each group has an 'id' (which can be an existing group ID or a new one you create), a 'name', and a 'tabs' array containing only the IDs of the tabs that belong in that group.

    Example of the required JSON output format:
    [
      {
        "id": "g1",
        "name": "Work",
        "tabs": ["1", "3"]
      },
      {
        "id": "new-group-123",
        "name": "Social Media",
        "tabs": ["2", "4"]
      }
    ]

    Now, provide the JSON output for the tabs listed above.
  `;

  try {
    const response = await ai.models.generateContent({
        model,
        contents: prompt,
    });
    const jsonString = response.text.trim().replace(/```json|```/g, '');
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Error getting AI sorting suggestions:', error);
    return null;
  }
}

export async function generateTagsForGroup(
  tabs: { title: string; url: string }[]
): Promise<string[]> {
  if (!process.env.GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY is not set.');
    return [];
  }

  try {
    const model = 'gemini-3-flash-preview';
    const prompt = `Given the following list of tabs in a group:\n${tabs.map(t => `- ${t.title} (${t.url})`).join('\n')}\n\nGenerate 3 to 5 concise tags (single words or short phrases) that best describe the content of this group. Return the result as a JSON array of strings.`;

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
    });
    
    const jsonString = response.text.trim();
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Error generating tags:', error);
    return [];
  }
}

export async function suggestGroupForTab(

  tab: { title: string; url: string },
  groupNames: string[]
): Promise<string | null> {
  if (!process.env.GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY is not set.');
    // Simulate a delay and return a mock response for UI development
    await new Promise(resolve => setTimeout(resolve, 1000));
    return groupNames[Math.floor(Math.random() * groupNames.length)];
  }

  try {
    const model = 'gemini-3-flash-preview';
    const prompt = `Given the following tab information:\nTitle: ${tab.title}\nURL: ${tab.url}\n\nCategorize this tab into one of the following existing groups: ${groupNames.join(', ')}.\n\nRespond with only the name of the most appropriate group. Do not add any other text or explanation.`;

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
    });
    
    const suggestion = response.text.trim();

    // Basic validation to ensure the suggestion is one of the group names
    if (groupNames.includes(suggestion)) {
      return suggestion;
    }
    return null;
  } catch (error) {
    console.error('Error suggesting group:', error);
    return null;
  }
}

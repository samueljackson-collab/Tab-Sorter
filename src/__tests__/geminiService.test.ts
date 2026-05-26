import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getAISortingSuggestions, generateTagsForGroup, suggestGroupForTab } from '../services/geminiService';

const mockGenerateContent = vi.hoisted(() => vi.fn());

vi.mock('@google/genai', () => ({
  GoogleGenAI: vi.fn().mockImplementation(() => ({
    models: {
      generateContent: mockGenerateContent,
    },
  })),
}));

describe('getAISortingSuggestions', () => {
  const tabs = [
    { id: '1', title: 'GitHub', url: 'https://github.com' },
    { id: '2', title: 'Twitter', url: 'https://twitter.com' },
  ];
  const groups = [{ id: 'g1', name: 'Work' }];

  beforeEach(() => {
    vi.stubEnv('GEMINI_API_KEY', 'test-key');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it('returns parsed JSON array on success', async () => {
    const mockResult = [{ id: 'g1', name: 'Work', tabs: ['1'] }];
    mockGenerateContent.mockResolvedValue({
      text: JSON.stringify(mockResult),
    });

    const result = await getAISortingSuggestions(tabs, groups, 'by topic');
    expect(result).toEqual(mockResult);
  });

  it('returns null when GEMINI_API_KEY is not set', async () => {
    vi.stubEnv('GEMINI_API_KEY', '');
    const result = await getAISortingSuggestions(tabs, groups, 'by topic');
    expect(result).toBeNull();
  });

  it('strips markdown code fences from response', async () => {
    const mockResult = [{ id: 'g2', name: 'Social', tabs: ['2'] }];
    mockGenerateContent.mockResolvedValue({
      text: '```json\n' + JSON.stringify(mockResult) + '\n```',
    });

    const result = await getAISortingSuggestions(tabs, groups, 'by topic');
    expect(result).toEqual(mockResult);
  });

  it('returns null on API error', async () => {
    mockGenerateContent.mockRejectedValue(new Error('API error'));
    const result = await getAISortingSuggestions(tabs, groups, 'by topic');
    expect(result).toBeNull();
  });
});

describe('generateTagsForGroup', () => {
  const tabs = [
    { title: 'GitHub', url: 'https://github.com' },
    { title: 'Stack Overflow', url: 'https://stackoverflow.com' },
  ];

  beforeEach(() => {
    vi.stubEnv('GEMINI_API_KEY', 'test-key');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it('returns array of tag strings on success', async () => {
    const mockTags = ['programming', 'development', 'code'];
    mockGenerateContent.mockResolvedValue({ text: JSON.stringify(mockTags) });

    const result = await generateTagsForGroup(tabs);
    expect(result).toEqual(mockTags);
    expect(Array.isArray(result)).toBe(true);
  });

  it('returns empty array when GEMINI_API_KEY is not set', async () => {
    vi.stubEnv('GEMINI_API_KEY', '');
    const result = await generateTagsForGroup(tabs);
    expect(result).toEqual([]);
  });

  it('returns empty array on API error', async () => {
    mockGenerateContent.mockRejectedValue(new Error('Network error'));
    const result = await generateTagsForGroup(tabs);
    expect(result).toEqual([]);
  });
});

describe('suggestGroupForTab', () => {
  const tab = { title: 'React Docs', url: 'https://react.dev' };
  const groupNames = ['Work', 'Learning', 'Social'];

  beforeEach(() => {
    vi.stubEnv('GEMINI_API_KEY', 'test-key');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it('returns a valid group name on success', async () => {
    mockGenerateContent.mockResolvedValue({ text: 'Learning' });

    const result = await suggestGroupForTab(tab, groupNames);
    expect(result).toBe('Learning');
    expect(groupNames).toContain(result);
  });

  it('returns null when AI response is not a valid group name', async () => {
    mockGenerateContent.mockResolvedValue({ text: 'InvalidGroup' });

    const result = await suggestGroupForTab(tab, groupNames);
    expect(result).toBeNull();
  });

  it('returns null on API error', async () => {
    mockGenerateContent.mockRejectedValue(new Error('API timeout'));
    const result = await suggestGroupForTab(tab, groupNames);
    expect(result).toBeNull();
  });

  it('returns a random group name when GEMINI_API_KEY is not set', async () => {
    vi.stubEnv('GEMINI_API_KEY', '');
    const result = await suggestGroupForTab(tab, groupNames);
    // When no API key, the function returns a random group (mock behavior)
    expect(groupNames).toContain(result);
  });
});

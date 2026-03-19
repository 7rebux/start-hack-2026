import Anthropic from '@anthropic-ai/sdk'
import type { Topic } from '@/data/index'
import type { TopicGroup } from '@/store/useAppStore'

const client = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true,
})

export async function groupTopicsWithAI(topics: Topic[], fieldName: string): Promise<TopicGroup[]> {
  const topicList = topics
    .map(t => `- id: "${t.id}" | title: "${t.title}" | description: "${t.description.slice(0, 120)}"`)
    .join('\n')

  const prompt = `You are a thesis topic organizer. Group the following thesis topics into 4-7 named clusters based on their themes and content.

Field: ${fieldName}

Topics:
${topicList}

Return ONLY a JSON array (no markdown code blocks, no extra text):
[
  {
    "name": "Cluster Name",
    "description": "Brief one-sentence description of what this cluster focuses on",
    "topicIds": ["topic-id-1", "topic-id-2"]
  }
]

Rules:
- Every topic must appear in exactly one cluster
- Cluster names should be concise (2-5 words)
- Use only the exact topic IDs provided above`

  const response = await client.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 2048,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''

  // Strip markdown code fences if present
  const jsonText = text.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim()

  const raw = JSON.parse(jsonText) as Array<{ name: string; description: string; topicIds: string[] }>

  return raw.map((group, i) => ({
    id: `group-${i}`,
    name: group.name,
    description: group.description,
    topicIds: group.topicIds,
  }))
}

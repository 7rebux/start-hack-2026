export async function suggestFields(
  programName: string,
  degreeName: string,
  universityName: string,
  fieldNames: string[],
  fieldIds: string[],
): Promise<string[]> {
  const prompt = `You are helping a university student find a thesis topic.
Student: ${degreeName} in "${programName}" at ${universityName}.
Available fields:
${fieldNames.map((n, i) => `${i + 1}. ${n}`).join('\n')}

Return a JSON array of exactly 3 field names (verbatim from the list above) most relevant to this student's degree, ordered by relevance. Respond with ONLY the JSON array, no other text.`

  try {
    const res = await fetch('/api/ai/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 100,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!res.ok) return []

    const data = await res.json()
    const text: string = data.content?.[0]?.text ?? ''

    const match = text.match(/\[[\s\S]*?\]/)
    if (!match) return []

    const names: unknown[] = JSON.parse(match[0])

    return names
      .filter((n): n is string => typeof n === 'string')
      .map(name => {
        const idx = fieldNames.findIndex(fn => fn.toLowerCase() === name.toLowerCase())
        return idx >= 0 ? fieldIds[idx] : null
      })
      .filter((id): id is string => id !== null)
      .slice(0, 3)
  } catch {
    return []
  }
}

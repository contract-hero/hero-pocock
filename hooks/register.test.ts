import { describe, expect, test } from 'claude-code/testing'

const BODY = 'Interview the user relentlessly.'
const ASK = '## Asking the user (Claude Code)'
const GRILL = 'This replaces the round format above.'

describe('skill.prompt', () => {
  test('grilling from the plugin gets both addenda', async ($, on) => {
    on('skill.prompt', ($, e) => ({ text: e.text }))

    const { text } = await $.skill.prompt({
      skill: 'hero-pocock:grilling',
      text: BODY,
      source: 'plugin',
      pluginName: 'hero-pocock',
    })

    expect(text.startsWith(BODY)).toBe(true)
    expect(text).toContain(ASK)
    expect(text).toContain(GRILL)
  })

  test('another plugin skill gets the general addendum only', async ($, on) => {
    on('skill.prompt', ($, e) => ({ text: e.text }))

    const { text } = await $.skill.prompt({
      skill: 'to-tickets',
      text: BODY,
      source: 'plugin',
      pluginName: 'hero-pocock',
    })

    expect(text).toContain(ASK)
    expect(text).not.toContain(GRILL)
  })

  test('a loose copy of grilling still matches by name', async ($, on) => {
    on('skill.prompt', ($, e) => ({ text: e.text }))

    const { text } = await $.skill.prompt({ skill: 'grilling', text: BODY, source: 'userSettings' })

    expect(text).toContain(GRILL)
  })

  test("another plugin's skill of the same name is left alone", async ($, on) => {
    on('skill.prompt', ($, e) => ({ text: e.text }))

    const { text } = await $.skill.prompt({
      skill: 'grilling',
      text: BODY,
      source: 'plugin',
      pluginName: 'someone-else',
    })

    expect(text).toBe(BODY)
  })

  test('an unrelated loose skill is left alone', async ($, on) => {
    on('skill.prompt', ($, e) => ({ text: e.text }))

    const { text } = await $.skill.prompt({ skill: 'commit', text: BODY, source: 'userSettings' })

    expect(text).toBe(BODY)
  })
})

# Harness-specific behaviour ships as a Claude Code hook, not in `SKILL.md`

Many skills put questions to the user: `grilling` asks whole rounds of them, and `to-tickets`, `code-review`, `setup-matt-pocock-skills` and others ask single ones. In Claude Code those questions read better as `AskUserQuestion` dialogs (a chip, 2 to 4 options, the recommendation first, free text under "Other") than as chat text.

`SKILL.md` files stay harness-neutral. Codex, Copilot, Gemini and every skills.sh agent read the same files, and none of them has `AskUserQuestion`. Naming the tool in a skill would give those agents an instruction they cannot follow. Leaving `SKILL.md` as upstream wrote it also keeps upstream merges clean (see [ADR 0004](./0004-hero-pocock-is-a-tailored-fork.md)).

## Decision

The `hero-pocock` plugin carries a hooks module, `hooks/register.ts`, beside its skills. Its one hook, on `skill.prompt`, appends an "Asking the user" section to the text of every promoted skill as Claude Code expands it, plus a section for `grilling` that replaces its markdown round format. The `SKILL.md` files do not change.

- A skill matches when it comes from the `hero-pocock` plugin, or when it has no plugin and its name is in the hook's copy of the promoted list (a skills.sh or `scripts/link-skills.sh` install).
- A frontier of more than 4 questions goes out as successive calls of 4 or fewer, because `AskUserQuestion` takes at most 4 per call. This keeps grilling's "ask the whole frontier" rule.
- The addendum falls back to plain text where the tool is absent (a headless run, a sub-agent).

The hook lives in the main plugin, not a separate one, so one install gives the whole tailored set. This is also where later Claude-Code-only tailoring goes.

## Invariants this creates

- The `SKILLS` list in `hooks/register.ts` mirrors the promoted set in `.claude-plugin/plugin.json`. Add, rename or remove a promoted skill in both places.
- Run `claude plugin validate .` and `claude plugin test .` after a change to `hooks/`.

## Known limits

- Codex and Copilot install the same plugin but do not run Claude Code hooks modules, so they get the skills without the dialogs.
- Claude Code skips `skill.prompt` hooks of a plugin a person installs where an organization manages Claude Code (`claude plugin validate` says so). There, only a plugin the organization lists in managed settings runs them.
- The hooks API is early access in Claude Code 2.1.300 and can change between releases.

# .agents/skills/

Custom AI agent skills live here. None ship by default — add them as your project grows.

A skill is a packaged recipe an AI agent can invoke when a matching task appears. Each skill is a folder containing at minimum a `SKILL.md` file with frontmatter, a description, and step-by-step instructions.

## Adding a skill

1. Create a folder: `.agents/skills/<skill-name>/`.
2. Create `SKILL.md` following one of the two templates in `guidelines/skills.md` (workflow or reference).
3. If the skill needs a script or static template, drop it into `scripts/` or `assets/` next to `SKILL.md`.
4. Reference the relevant guideline files from `guidelines/` instead of duplicating rules.
5. Update `AGENTS.md` to list the new skill so agents discover it.

See `guidelines/skills.md` for the full standard.

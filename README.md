# Smart Snippets - Obsidian Plugin

Type shortcuts like `/meeting` or `/todo` and expand them into formatted templates instantly! Perfect for repetitive formatting and quick content insertion.

## Features

⚡ **Quick Expansion** - Type trigger + Space to expand
📝 **8 Built-in Templates** - Meeting notes, tasks, ideas, daily logs, and more
🔧 **Fully Customizable** - Edit or delete any snippet
➕ **Create Your Own** - Add unlimited custom snippets
📅 **Dynamic Variables** - Auto-insert dates, times, timestamps
🎯 **Simple Trigger** - Default `/` character (customizable)

## Built-in Snippets

### `/meeting` - Meeting Notes

```markdown
# Meeting Notes - 2026-01-10

**Attendees:** 
- 

**Agenda:**
1. 

**Discussion:**

**Action Items:**
- [ ] 

**Next Steps:**
```

### `/todo` - Task List

```markdown
## Tasks - 2026-01-10

- [ ] 
- [ ] 
- [ ] 

**Priority:**
🔴 High: 
🟡 Medium: 
🟢 Low: 
```

### `/idea` - Idea Capture

```markdown
💡 **Idea:** 

**Date:** 2026-01-10
**Time:** 11:30 PM

**Description:**

**Why this matters:**

**Next steps:**
- 
```

### `/daily` - Daily Log

```markdown
# Daily Log - 2026-01-10

## 🎯 Goals for Today
- [ ] 
- [ ] 

## 📝 Notes

## ✅ Completed

## 💭 Thoughts
```

### `/project` - Project Outline

```markdown
# Project: 

**Status:** 🟡 In Progress
**Started:** 2026-01-10
**Deadline:** 

## Overview

## Goals
- 

## Tasks
- [ ] 

## Resources

## Notes
```

Plus: `/note`, `/table`, `/code`

## Dynamic Variables

Use these in any template:

| Variable | Output | Example |
|----------|--------|---------|
| `{{date}}` | Current date | 2026-01-10 |
| `{{time}}` | Current time | 11:30 PM |
| `{{datetime}}` | Date and time | 1/10/2026, 11:30:00 PM |
| `{{timestamp}}` | Unix timestamp | 1736537400000 |
| `{{year}}` | Current year | 2026 |
| `{{month}}` | Current month | 01 |
| `{{day}}` | Current day | 10 |

## Installation

### Quick Install

1. Copy these files to `.obsidian/plugins/smart-snippets/`:
   - `main.js`
   - `manifest.json`
   - `styles.css`

2. Reload Obsidian
3. Enable "Smart Snippets" in Settings → Community Plugins

### Build from Source

1. Clone/download this repository
2. Navigate to the plugin folder:

   ```bash
   cd /path/to/vault/.obsidian/plugins/smart-snippets
   ```

3. Install and build:

   ```bash
   npm install
   npm run build
   ```

4. Reload Obsidian and enable

## Usage

### Basic Usage

1. **Start typing** the trigger character (default: `/`)
2. **Type the snippet name** (e.g., `meeting`)
3. **Press Space** - the snippet expands!

**Example:**

```
Type: /meeting[Space]
Result: Full meeting template inserted!
```

### Creating Custom Snippets

Go to **Settings → Smart Snippets → Add New Snippet**

1. **Trigger** - The shortcut name (e.g., "quote", "link")
2. **Description** - What it does
3. **Template** - The text to insert
4. Click **Add Snippet**

**Example Custom Snippet:**

```
Trigger: quote
Description: Blockquote with attribution
Template:
> 

— 
```

Now typing `/quote` + Space inserts that template!

### Editing Snippets

In Settings → Smart Snippets:

- **Edit trigger** - Change the shortcut
- **Edit description** - Update what it does
- **Edit template** - Modify the inserted text
- **Delete** - Remove unwanted snippets

### Using Variables

Add variables anywhere in your templates:

```markdown
# Weekly Review - {{date}}

Last week I accomplished:
- 

This week starting {{date}} I will:
- 

Created at {{time}} on {{datetime}}
```

When expanded, variables are replaced with actual values!

## Use Cases

**📅 Daily Notes**

- Quick daily log entries
- Consistent daily structure
- Automatic date insertion

**📝 Note-Taking**

- Meeting notes format
- Class notes structure
- Interview templates

**✅ Task Management**

- Project kickoff templates
- Task list formats
- Sprint planning

**💡 Idea Capture**

- Quick idea format
- Brainstorm structure
- Feature requests

**📊 Documentation**

- Code documentation
- API endpoint templates
- Bug report formats

## Tips & Best Practices

💡 **Keep triggers short** - `meet` is better than `meetingnotes`

💡 **Use descriptive names** - Make triggers memorable and logical

💡 **Leverage variables** - Automate dates and times

💡 **Group similar snippets** - Use prefixes like `task-`, `note-`, etc.

💡 **Start simple** - Begin with 3-5 snippets, add more as needed

💡 **Export/backup** - Save your custom snippets externally

## Advanced Examples

### Code Review Template

```
Trigger: review
Template:
## Code Review - {{date}}

**Reviewer:** 
**PR #:** 
**Branch:** 

### Changes
- 

### Feedback
✅ Good:
- 

⚠️ Concerns:
- 

### Decision
- [ ] Approve
- [ ] Request changes
- [ ] Comment
```

### Book Notes

```
Trigger: book
Template:
# 📚 Book Notes

**Title:** 
**Author:** 
**Started:** {{date}}
**Status:** Reading

## Summary


## Key Takeaways
1. 
2. 
3. 

## Quotes
> 

## My Thoughts
```

## Customization

### Change Trigger Character

By default, snippets use `/` as the trigger. To change:

1. Go to Settings → Smart Snippets
2. Change "Trigger character" to any character you want
3. Examples: `@`, `!`, `~`, `;;`

### Backup Your Snippets

Your snippets are stored in `.obsidian/plugins/smart-snippets/data.json`

Copy this file to backup your custom snippets!

## Compatibility

- ✅ Works in all Obsidian themes
- ✅ Desktop and Mobile support
- ✅ Live Preview and Source mode
- ✅ Compatible with Templates plugin
- ✅ Works with Templater plugin

## Troubleshooting

**Snippets don't expand:**

- Make sure plugin is enabled
- Check you're pressing Space after the trigger
- Verify trigger character is correct
- Try restarting Obsidian

**Variables show as {{date}}:**

- This shouldn't happen - report as bug
- Check template syntax in settings

**Snippet triggers conflict:**

- Make sure triggers are unique
- Check if another plugin uses same trigger

## Keyboard Shortcuts

You can set a hotkey for:

- **Show all snippets** - See list of available snippets

Go to Settings → Hotkeys → Search "Smart Snippets"

## Privacy & Performance

- ✅ 100% local - no data sent anywhere
- ✅ Lightweight - minimal performance impact
- ✅ Instant expansion - no lag
- ✅ Your snippets stay in your vault

## Changelog

### v1.0.0

- 🎉 Initial release
- 8 built-in templates
- Custom snippet creation
- 7 dynamic variables
- Customizable trigger character
- Full template editing

## Future Ideas

- Snippet categories/folders
- Import/export snippet packs
- Snippet sharing marketplace
- Cursor position markers
- Multi-cursor support
- Snippet preview before expansion

## Support

Found a bug? Want a feature?

- 🐛 Report bugs via issues
- 💡 Suggest features
- ⭐ Star the repository
- ☕ Buy me a coffee (optional!)

## License

MIT License - Free to use and modify!

---

Made with ❤️ for faster note-taking

**Pro Tip:** Combine Smart Snippets with Templates and Templater plugins for ultimate productivity! 🚀

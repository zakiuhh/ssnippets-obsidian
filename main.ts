import { App, Editor, MarkdownView, Plugin, PluginSettingTab, Setting, Notice } from 'obsidian';
import { EditorView, ViewPlugin, ViewUpdate, Decoration, DecorationSet } from '@codemirror/view';
import { EditorState, StateField, StateEffect } from '@codemirror/state';

interface Snippet {
	trigger: string;
	template: string;
	description: string;
}

interface SmartSnippetsSettings {
	snippets: Snippet[];
	triggerKey: string;
	showSuggestions: boolean;
}

const DEFAULT_SETTINGS: SmartSnippetsSettings = {
	triggerKey: '/',
	showSuggestions: true,
	snippets: [
		{
			trigger: 'meeting',
			description: 'Meeting notes template',
			template: `# Meeting Notes - {{date}}

**Attendees:** 
- 

**Agenda:**
1. 

**Discussion:**


**Action Items:**
- [ ] 

**Next Steps:**
`
		},
		{
			trigger: 'todo',
			description: 'Task list template',
			template: `## Tasks - {{date}}

- [ ] 
- [ ] 
- [ ] 

**Priority:**
🔴 High: 
🟡 Medium: 
🟢 Low: `
		},
		{
			trigger: 'idea',
			description: 'Idea capture template',
			template: `💡 **Idea:** 

**Date:** {{date}}
**Time:** {{time}}

**Description:**


**Why this matters:**


**Next steps:**
- `
		},
		{
			trigger: 'note',
			description: 'Quick note template',
			template: `📝 {{date}} {{time}}

`
		},
		{
			trigger: 'daily',
			description: 'Daily log template',
			template: `# Daily Log - {{date}}

## 🎯 Goals for Today
- [ ] 
- [ ] 
- [ ] 

## 📝 Notes


## ✅ Completed
- 

## 💭 Thoughts
`
		},
		{
			trigger: 'project',
			description: 'Project outline template',
			template: `# Project: 

**Status:** 🟡 In Progress
**Started:** {{date}}
**Deadline:** 

## Overview


## Goals
- 
- 
- 

## Tasks
- [ ] 
- [ ] 

## Resources
- 

## Notes
`
		},
		{
			trigger: 'table',
			description: 'Simple table',
			template: `| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
|          |          |          |
|          |          |          |`
		},
		{
			trigger: 'code',
			description: 'Code block',
			template: '```\n\n```'
		}
	]
}

export default class SmartSnippetsPlugin extends Plugin {
	settings: SmartSnippetsSettings;

	async onload() {
		await this.loadSettings();

		// Register event for snippet expansion
		this.registerEditorExtension(this.createSnippetExtension());

		// Add command to show all snippets
		this.addCommand({
			id: 'show-all-snippets',
			name: 'Show all available snippets',
			callback: () => {
				this.showSnippetList();
			}
		});

		// Add settings tab
		this.addSettingTab(new SmartSnippetsSettingTab(this.app, this));

		console.log('Smart Snippets plugin loaded');
	}

	onunload() {
		console.log('Smart Snippets plugin unloaded');
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	showSnippetList() {
		const snippetList = this.settings.snippets
			.map(s => `${this.settings.triggerKey}${s.trigger} - ${s.description}`)
			.join('\n');
		
		new Notice(`Available Snippets:\n\n${snippetList}`, 10000);
	}

	expandSnippet(template: string): string {
		const now = new Date();
		
		// Replace variables
		let expanded = template
			.replace(/{{date}}/g, now.toISOString().split('T')[0])
			.replace(/{{time}}/g, now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }))
			.replace(/{{datetime}}/g, now.toLocaleString())
			.replace(/{{timestamp}}/g, now.getTime().toString())
			.replace(/{{year}}/g, now.getFullYear().toString())
			.replace(/{{month}}/g, (now.getMonth() + 1).toString().padStart(2, '0'))
			.replace(/{{day}}/g, now.getDate().toString().padStart(2, '0'));
		
		return expanded;
	}

	createSnippetExtension() {
		const plugin = this;
		
		return EditorView.domEventHandlers({
			keydown(event, view) {
				// Check if space is pressed
				if (event.key === ' ') {
					const selection = view.state.selection.main;
					const line = view.state.doc.lineAt(selection.head);
					const textBeforeCursor = line.text.slice(0, selection.head - line.from);
					
					// Check if text before cursor matches a snippet trigger
					for (const snippet of plugin.settings.snippets) {
						const trigger = plugin.settings.triggerKey + snippet.trigger;
						
						if (textBeforeCursor.endsWith(trigger)) {
							event.preventDefault();
							
							// Calculate positions
							const from = selection.head - trigger.length;
							const to = selection.head;
							
							// Expand template
							const expanded = plugin.expandSnippet(snippet.template);
							
							// Replace trigger with expanded template
							view.dispatch({
								changes: { from, to, insert: expanded }
							});
							
							new Notice(`✨ Expanded: ${snippet.trigger}`);
							return true;
						}
					}
				}
				
				return false;
			}
		});
	}
}

class SmartSnippetsSettingTab extends PluginSettingTab {
	plugin: SmartSnippetsPlugin;

	constructor(app: App, plugin: SmartSnippetsPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		containerEl.createEl('h2', { text: 'Smart Snippets Settings' });

		// Trigger key setting
		new Setting(containerEl)
			.setName('Trigger character')
			.setDesc('Character to start snippet triggers (default: /)')
			.addText(text => text
				.setPlaceholder('/')
				.setValue(this.plugin.settings.triggerKey)
				.onChange(async (value) => {
					this.plugin.settings.triggerKey = value || '/';
					await this.plugin.saveSettings();
				}));

		// Show available variables
		containerEl.createEl('h3', { text: 'Available Variables' });
		const variablesDiv = containerEl.createDiv({ cls: 'snippet-variables' });
		variablesDiv.innerHTML = `
			<p>Use these variables in your templates:</p>
			<ul>
				<li><code>{{date}}</code> - Current date (YYYY-MM-DD)</li>
				<li><code>{{time}}</code> - Current time (HH:MM AM/PM)</li>
				<li><code>{{datetime}}</code> - Full date and time</li>
				<li><code>{{timestamp}}</code> - Unix timestamp</li>
				<li><code>{{year}}</code> - Current year</li>
				<li><code>{{month}}</code> - Current month (01-12)</li>
				<li><code>{{day}}</code> - Current day (01-31)</li>
			</ul>
		`;

		// Default snippets section
		containerEl.createEl('h3', { text: 'Built-in Snippets' });
		containerEl.createEl('p', { 
			text: 'These snippets are included by default. You can modify or delete them.',
			cls: 'setting-item-description'
		});

		// Display all snippets
		this.plugin.settings.snippets.forEach((snippet, index) => {
			const snippetContainer = containerEl.createDiv({ cls: 'snippet-item' });
			snippetContainer.style.border = '1px solid var(--background-modifier-border)';
			snippetContainer.style.padding = '15px';
			snippetContainer.style.marginBottom = '15px';
			snippetContainer.style.borderRadius = '5px';
			snippetContainer.style.backgroundColor = 'var(--background-secondary)';

			// Snippet header with trigger and description
			new Setting(snippetContainer)
				.setName(`${this.plugin.settings.triggerKey}${snippet.trigger}`)
				.setDesc(snippet.description)
				.addButton(button => button
					.setButtonText('Delete')
					.setWarning()
					.onClick(async () => {
						this.plugin.settings.snippets.splice(index, 1);
						await this.plugin.saveSettings();
						this.display();
					}));

			// Edit trigger
			new Setting(snippetContainer)
				.setName('Trigger')
				.setDesc('The shortcut to type (without the trigger character)')
				.addText(text => text
					.setPlaceholder('trigger')
					.setValue(snippet.trigger)
					.onChange(async (value) => {
						this.plugin.settings.snippets[index].trigger = value;
						await this.plugin.saveSettings();
					}));

			// Edit description
			new Setting(snippetContainer)
				.setName('Description')
				.setDesc('What this snippet does')
				.addText(text => text
					.setPlaceholder('Description')
					.setValue(snippet.description)
					.onChange(async (value) => {
						this.plugin.settings.snippets[index].description = value;
						await this.plugin.saveSettings();
					}));

			// Edit template
			new Setting(snippetContainer)
				.setName('Template')
				.setDesc('The text that will be inserted')
				.addTextArea(text => {
					text
						.setPlaceholder('Template text...')
						.setValue(snippet.template)
						.onChange(async (value) => {
							this.plugin.settings.snippets[index].template = value;
							await this.plugin.saveSettings();
						});
					text.inputEl.rows = 8;
					text.inputEl.style.width = '100%';
					text.inputEl.style.fontFamily = 'monospace';
					return text;
				});
		});

		// Add new snippet section
		containerEl.createEl('h3', { text: 'Add New Snippet' });

		let newTrigger = '';
		let newDescription = '';
		let newTemplate = '';

		new Setting(containerEl)
			.setName('New trigger')
			.setDesc('Shortcut to type (e.g., "quote", "link", "header")')
			.addText(text => text
				.setPlaceholder('trigger')
				.onChange(value => {
					newTrigger = value;
				}));

		new Setting(containerEl)
			.setName('New description')
			.setDesc('What this snippet does')
			.addText(text => text
				.setPlaceholder('Description')
				.onChange(value => {
					newDescription = value;
				}));

		new Setting(containerEl)
			.setName('New template')
			.setDesc('The text that will be inserted')
			.addTextArea(text => {
				text
					.setPlaceholder('Template text...\nUse {{date}}, {{time}}, etc.')
					.onChange(value => {
						newTemplate = value;
					});
				text.inputEl.rows = 8;
				text.inputEl.style.width = '100%';
				text.inputEl.style.fontFamily = 'monospace';
				return text;
			});

		new Setting(containerEl)
			.addButton(button => button
				.setButtonText('Add Snippet')
				.setCta()
				.onClick(async () => {
					if (newTrigger && newTemplate) {
						this.plugin.settings.snippets.push({
							trigger: newTrigger,
							description: newDescription || 'Custom snippet',
							template: newTemplate
						});
						await this.plugin.saveSettings();
						new Notice('✅ Snippet added!');
						this.display();
					} else {
						new Notice('❌ Please fill in at least trigger and template');
					}
				}));

		// Usage instructions
		containerEl.createEl('h3', { text: 'How to Use' });
		const instructions = containerEl.createEl('div', { cls: 'snippet-instructions' });
		instructions.innerHTML = `
			<p><strong>Using Snippets:</strong></p>
			<ol>
				<li>Type the trigger character (default: <code>/</code>)</li>
				<li>Type the snippet name (e.g., <code>meeting</code>)</li>
				<li>Press <strong>Space</strong></li>
				<li>The snippet expands into the template!</li>
			</ol>
			<p><strong>Example:</strong></p>
			<p>Type <code>/meeting</code> and press Space → Full meeting template appears!</p>
			<p><strong>Tips:</strong></p>
			<ul>
				<li>Use variables like {{date}} for dynamic content</li>
				<li>Create snippets for frequently used formats</li>
				<li>Combine with templates for powerful workflows</li>
			</ul>
		`;
	}
}

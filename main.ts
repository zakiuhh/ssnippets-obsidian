import { App, Plugin, PluginSettingTab, Setting, Notice } from 'obsidian';
import { EditorView } from '@codemirror/view';

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
			template: `# Meeting notes - {{date}}

**Attendees:**
- 

**Agenda:**
1. 

**Discussion:**


**Action items:**
- [ ] 

**Next steps:**
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
🔴 High  
🟡 Medium  
🟢 Low`
		},
		{
			trigger: 'idea',
			description: 'Idea capture template',
			template: `💡 **Idea**

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
			template: `# Daily log - {{date}}

## Goals for today
- [ ] 
- [ ] 
- [ ] 

## Notes


## Completed
- 

## Thoughts
`
		},
		{
			trigger: 'project',
			description: 'Project outline template',
			template: `# Project

**Status:** 🟡 In progress  
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
};

export default class SmartSnippetsPlugin extends Plugin {
	settings: SmartSnippetsSettings;

	async onload() {
		await this.loadSettings();
		this.registerEditorExtension(this.createSnippetExtension());

		this.addCommand({
			id: 'show-all-snippets',
			name: 'Show all available snippets',
			callback: () => this.showSnippetList()
		});

		this.addSettingTab(new SmartSnippetsSettingTab(this.app, this));
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	showSnippetList() {
		const list = this.settings.snippets
			.map(s => `${this.settings.triggerKey}${s.trigger} - ${s.description}`)
			.join('\n');

		new Notice(`Available snippets:\n\n${list}`, 10000);
	}

	expandSnippet(template: string): string {
		const now = new Date();

		return template
			.replace(/{{date}}/g, now.toISOString().split('T')[0])
			.replace(/{{time}}/g, now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
			.replace(/{{datetime}}/g, now.toLocaleString())
			.replace(/{{timestamp}}/g, now.getTime().toString())
			.replace(/{{year}}/g, now.getFullYear().toString())
			.replace(/{{month}}/g, String(now.getMonth() + 1).padStart(2, '0'))
			.replace(/{{day}}/g, String(now.getDate()).padStart(2, '0'));
	}

	createSnippetExtension() {
		return EditorView.domEventHandlers({
			keydown: (event, view) => {
				if (event.key !== ' ') return false;

				const sel = view.state.selection.main;
				const line = view.state.doc.lineAt(sel.head);
				const before = line.text.slice(0, sel.head - line.from);

				for (const snippet of this.settings.snippets) {
					const trigger = this.settings.triggerKey + snippet.trigger;

					if (before.endsWith(trigger)) {
						event.preventDefault();

						view.dispatch({
							changes: {
								from: sel.head - trigger.length,
								to: sel.head,
								insert: this.expandSnippet(snippet.template)
							}
						});

						new Notice(`Snippet expanded: ${snippet.trigger}`);
						return true;
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

		new Setting(containerEl)
			.setName('Trigger character')
			.setDesc('Character used to start snippet triggers (default: /)')
			.addText(text =>
				text
					.setPlaceholder('/')
					.setValue(this.plugin.settings.triggerKey)
					.onChange(async value => {
						this.plugin.settings.triggerKey = value || '/';
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl).setName('Available variables').setHeading();

		new Setting(containerEl).setDesc(
			'{{date}}, {{time}}, {{datetime}}, {{timestamp}}, {{year}}, {{month}}, {{day}}'
		);

		new Setting(containerEl).setName('Built-in snippets').setHeading();

		new Setting(containerEl).setDesc(
			'These snippets are included by default and can be edited or removed.'
		);

		this.plugin.settings.snippets.forEach((snippet, index) => {
			new Setting(containerEl)
				.setName(`${this.plugin.settings.triggerKey}${snippet.trigger}`)
				.setDesc(snippet.description)
				.addButton(btn =>
					btn
						.setButtonText('Delete')
						.setWarning()
						.onClick(async () => {
							this.plugin.settings.snippets.splice(index, 1);
							await this.plugin.saveSettings();
							this.display();
						})
				);
		});

		new Setting(containerEl).setName('Add new snippet').setHeading();
	}
}

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
			template: `# Meeting Notes - {{date}}

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

## 🎯 Goals for today
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
			callback: () => {
				this.showSnippetList();
			}
		});

		this.addSettingTab(new SmartSnippetsSettingTab(this.app, this));

		console.debug('Smart Snippets loaded');
	}

	onunload() {
		console.debug('Smart Snippets unloaded');
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

		new Notice(`Available snippets:\n\n${snippetList}`, 10000);
	}

	expandSnippet(template: string): string {
		const now = new Date();

		return template
			.replace(/{{date}}/g, now.toISOString().split('T')[0])
			.replace(/{{time}}/g, now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }))
			.replace(/{{datetime}}/g, now.toLocaleString())
			.replace(/{{timestamp}}/g, now.getTime().toString())
			.replace(/{{year}}/g, now.getFullYear().toString())
			.replace(/{{month}}/g, (now.getMonth() + 1).toString().padStart(2, '0'))
			.replace(/{{day}}/g, now.getDate().toString().padStart(2, '0'));
	}

	createSnippetExtension() {
		return EditorView.domEventHandlers({
			keydown: (event, view) => {
				if (event.key === ' ') {
					const selection = view.state.selection.main;
					const line = view.state.doc.lineAt(selection.head);
					const textBeforeCursor = line.text.slice(0, selection.head - line.from);

					for (const snippet of this.settings.snippets) {
						const trigger = this.settings.triggerKey + snippet.trigger;

						if (textBeforeCursor.endsWith(trigger)) {
							event.preventDefault();

							const from = selection.head - trigger.length;
							const to = selection.head;

							view.dispatch({
								changes: {
									from,
									to,
									insert: this.expandSnippet(snippet.template)
								}
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

		new Setting(containerEl)
			.setName('General')
			.setHeading();

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

		new Setting(containerEl)
			.setName('Available variables')
			.setHeading();

		new Setting(containerEl)
			.setDesc('{{date}}, {{time}}, {{datetime}}, {{timestamp}}, {{year}}, {{month}}, {{day}}');

		new Setting(containerEl)
			.setName('Built-in snippets')
			.setHeading();

		new Setting(containerEl)
			.setDesc('These snippets are included by default. You can modify or delete them.');

		this.plugin.settings.snippets.forEach((snippet, index) => {
			const snippetContainer = containerEl.createDiv();

			new Setting(snippetContainer)
				.setName(`${this.plugin.settings.triggerKey}${snippet.trigger}`)
				.setDesc(snippet.description)
				.addButton(button =>
					button
						.setButtonText('Delete')
						.setWarning()
						.onClick(async () => {
							this.plugin.settings.snippets.splice(index, 1);
							await this.plugin.saveSettings();
							this.display();
						})
				);

			new Setting(snippetContainer)
				.setName('Trigger')
				.setDesc('Shortcut without the trigger character')
				.addText(text =>
					text
						.setValue(snippet.trigger)
						.onChange(async value => {
							snippet.trigger = value;
							await this.plugin.saveSettings();
						})
				);

			new Setting(snippetContainer)
				.setName('Description')
				.setDesc('What this snippet does')
				.addText(text =>
					text
						.setValue(snippet.description)
						.onChange(async value => {
							snippet.description = value;
							await this.plugin.saveSettings();
						})
				);

			new Setting(snippetContainer)
				.setName('Template')
				.setDesc('Text that will be inserted')
				.addTextArea(text => {
					text
						.setValue(snippet.template)
						.onChange(async value => {
							snippet.template = value;
							await this.plugin.saveSettings();
						});
					text.inputEl.rows = 8;
					return text;
				});
		});

		new Setting(containerEl)
			.setName('Add new snippet')
			.setHeading();

		let newTrigger = '';
		let newDescription = '';
		let newTemplate = '';

		new Setting(containerEl)
			.setName('Trigger')
			.setDesc('Shortcut to type')
			.addText(text => text.onChange(value => (newTrigger = value)));

		new Setting(containerEl)
			.setName('Description')
			.setDesc('What this snippet does')
			.addText(text => text.onChange(value => (newDescription = value)));

		new Setting(containerEl)
			.setName('Template')
			.setDesc('Text that will be inserted')
			.addTextArea(text => {
				text.onChange(value => (newTemplate = value));
				text.inputEl.rows = 8;
				return text;
			});

		new Setting(containerEl).addButton(button =>
			button
				.setButtonText('Add snippet')
				.setCta()
				.onClick(async () => {
					if (!newTrigger || !newTemplate) {
						new Notice('❌ Please fill in at least a trigger and a template');
						return;
					}

					this.plugin.settings.snippets.push({
						trigger: newTrigger,
						description: newDescription || 'Custom snippet',
						template: newTemplate
					});

					await this.plugin.saveSettings();
					new Notice('✅ Snippet added');
					this.display();
				})
		);
	}
}

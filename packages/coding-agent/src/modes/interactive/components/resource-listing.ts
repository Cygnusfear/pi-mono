import { Container, Spacer, Text } from "@mariozechner/pi-tui";
import { theme } from "../theme/theme.js";
import { editorKey } from "./keybinding-hints.js";

/**
 * Collapsible component for displaying loaded resources (skills, prompts, extensions, themes).
 * Collapsed: single summary line with counts and expand hint.
 * Expanded: full listing of all resources.
 */
export class ResourceListingComponent extends Container {
	private expanded = false;
	private sections: { header: string; content: string }[];
	private counts: { skills: number; prompts: number; extensions: number; themes: number };

	constructor(
		sections: { header: string; content: string }[],
		counts: { skills: number; prompts: number; extensions: number; themes: number },
	) {
		super();
		this.sections = sections;
		this.counts = counts;
		this.updateDisplay();
	}

	setExpanded(expanded: boolean): void {
		this.expanded = expanded;
		this.updateDisplay();
	}

	override invalidate(): void {
		super.invalidate();
		this.updateDisplay();
	}

	private updateDisplay(): void {
		this.clear();

		if (this.expanded) {
			for (const section of this.sections) {
				this.addChild(new Text(section.content, 0, 0));
				this.addChild(new Spacer(1));
			}
		} else {
			const parts: string[] = [];
			if (this.counts.skills > 0) parts.push(`${this.counts.skills} skills`);
			if (this.counts.prompts > 0) parts.push(`${this.counts.prompts} prompts`);
			if (this.counts.extensions > 0) parts.push(`${this.counts.extensions} extensions`);
			if (this.counts.themes > 0) parts.push(`${this.counts.themes} themes`);

			const summary = parts.length > 0 ? parts.join(", ") : "no resources";
			this.addChild(new Spacer(1));
			this.addChild(
				new Text(
					theme.fg("dim", `Loaded ${summary} (`) +
						theme.fg("dim", editorKey("expandTools")) +
						theme.fg("dim", " to expand)"),
					0,
					0,
				),
			);
		}
	}
}

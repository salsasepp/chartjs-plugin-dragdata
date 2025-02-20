import ejs from "ejs";
import fs from "fs";
import path from "path";

import type { TestScenarios as TestScenariosType } from "../../tests/__data__/data";
import { AxisSpec } from "../../tests/__utils__/structures/axisSpec";
import { BundledPage } from "./types";

export function requireUncached(module: string) {
	delete require.cache[require.resolve(module)];
	return require(module);
}

export function ejsFileToTemplate(ejsFilePath: string) {
	return ejs.compile(fs.readFileSync(ejsFilePath, "utf8").toString());
}

export type RenderPageOptions = {
	/** Title of the page */
	title: string;
	/** The page output file name */
	fileName: keyof typeof TestScenariosType;
	/**
	 * Whether this page is built for E2E testing (includes eval
	 * operations to parse E2E test data in Playwright) or as docs demo
	 */
	isE2ETest: boolean;
	/**
	 * Whether to include scripts loading date-fns & date-fns chart.js adapter
	 */
	includeDateFns?: boolean;
	/**
	 * Custom JS code
	 */
	customJS?: string;
	/**
	 * Value passed to setupChart for draggableAxis option **only in demo mode**
	 */
	demoOnlyDraggableAxis?: AxisSpec;
};

export function renderPage({
	title,
	fileName,
	isE2ETest,
	includeDateFns = false,
	customJS = "",
	demoOnlyDraggableAxis = "both",
}: RenderPageOptions): BundledPage {
	const { TestScenarios } = requireUncached(
		"../../tests/__data__/data",
	) as typeof import("../../tests/__data__/data");

	const template = ejsFileToTemplate(
			path.join(path.dirname(__filename), "templates", "layout.html.ejs"),
		),
		scenario = TestScenarios[fileName];

	return {
		html: template({
			title: `${title} demo`,
			scenarioConfiguration: JSON.stringify(scenario.configuration),
			isE2ETest,
			includeDateFns,
			customJS,
			demoOnlyDraggableAxis,
		}),
		outputFileName: fileName as string,
	};
}

import dateFns from "date-fns";
import { TestScenario } from "../__utils__/structures/scenario";
import { E2EInteraction } from "../__utils__/testsConfig";

function getRandomInt(min: number, max: number) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

const projectSteps = [
	"Hypothesis",
	"Researching",
	"Outlining",
	"Drafting",
	"Finalizing",
];

const colors = ["#69d2e7", "#a7dbd8", "#e0e4cc", "#f38630", "#fa6900"];

function createNewProject(daysFromNow: number) {
	const startProject = dateFns.addDays(new Date(), daysFromNow);
	const daysPerStepProj = projectSteps.map(() => getRandomInt(5, 40));

	const datesProj = projectSteps.reduce<[Date, Date][]>((arr, s, i) => {
		if (!arr.length) {
			const end = dateFns.addDays(startProject, daysPerStepProj[i]);
			arr.push([startProject, end]);
		} else {
			const lastEntry = arr[arr.length - 1];
			const start = lastEntry[1];
			const end = dateFns.addDays(start, daysPerStepProj[i]);
			arr.push([start, end]);
		}
		return arr;
	}, []);

	return datesProj;
}

const projectsStartDates = [0, 10, 40, 50, 55, 70, 90, 94];
const dataPerProject = projectsStartDates.map((daysFromStart) =>
	createNewProject(daysFromStart),
);

export const ganttChartScenario = {
	configuration: {
		type: "bar",
		data: {
			labels: projectsStartDates.map((p, i) => `Project ${i + 1}`),
			datasets: projectSteps.map((step, i) => ({
				label: step,
				data: dataPerProject.map((d) => d[i]) as any,
				backgroundColor: colors[i],
			})),
		},
		options: {
			indexAxis: "y",
			responsive: true,
			plugins: {
				tooltip: {
					enabled: false,
				},
				datalabels: {
					display: true,
					color: "white",
				},
			},
			scales: {
				x: {
					type: "time",
					// @ts-ignore: this is valid since chartjs-adapter-date-fns is used
					min: new Date() as any,
				},
				y: {
					stacked: true,
				},
			},
		},
	},
	roundingPrecision: 0,
	postprocessConfiguration: false,
	onDrag: (_e, _datasetIndex, index, _value) => {
		// const duration = dateFns.differenceInDays(value[1], value[0]);
		window.testedChart.data.datasets.forEach((segment, i) => {
			// console.log(i);
			const curDuration = dateFns.differenceInDays(
				// @ts-ignore: this is valid since chartjs-adapter-date-fns is used
				segment.data[index][1],
				// @ts-ignore: this is valid since chartjs-adapter-date-fns is used
				segment.data[index][0],
			);
			// @ts-ignore: this is valid since chartjs-adapter-date-fns is used
			const thisStart = new Date(segment.data[0]);
			// @ts-ignore: this is valid since chartjs-adapter-date-fns is used
			const thisEnd = new Date(segment.data[1]);

			if (window.testedChart.data.datasets[i + 1] && i !== 0) {
				const nextStart = new Date(
					// @ts-ignore: this is valid since chartjs-adapter-date-fns is used
					window.testedChart.data.datasets[i + 1].data[index][0],
				);
				// console.log(nextStart);
				if (nextStart !== thisEnd) {
					// @ts-ignore: this is valid since chartjs-adapter-date-fns is used
					segment.data[index] = [thisStart, nextStart];
				}
			}
			if (i > 0) {
				// console.log(i);
				// console.log(window.testedChart.data.datasets[i - 1]);
				const prevEnd = new Date(
					// @ts-ignore: this is valid since chartjs-adapter-date-fns is used
					window.testedChart.data.datasets[i - 1].data[index][1],
				);
				if (thisStart !== prevEnd) {
					// retain current segment length
					const newEnd = dateFns.addDays(prevEnd, curDuration);
					// console.log(prevEnd, newEnd);
					// @ts-ignore: this is valid since chartjs-adapter-date-fns is used
					segment.data[index] = [prevEnd, newEnd];
				}
			}
		});
		window.testedChart.update("none");
	},
	isCategoricalX: true,
	isCategoricalY: false,
	// too complex to test in E2E, at least for now
	stepGroups: [],
	skipE2ETesting: true,
} satisfies TestScenario<E2EInteraction>;

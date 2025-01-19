import { App, ItemView, WorkspaceLeaf, moment } from 'obsidian';
import { openOrCreateFile } from 'src/utils/openOrCreateFile';
import { formatTaskObject, TaskObject } from 'src/utils/tasks/formatTaskObject';

export const VIEW_WEEKLY_REPORT = 'VIEW_WEEKLY_REPORT';

export class WeeklyReportView extends ItemView {
  protected selectedWeek: string | undefined 

  constructor(leaf: WorkspaceLeaf, app: App) {
    super(leaf);
    this.icon = "chart-column-increasing"
    this.navigation = true
    this.selectedWeek = undefined
  }

  getViewType() {
    return VIEW_WEEKLY_REPORT;
  }

  getDisplayText() {
    return 'Weekly Report';
  }

  async onOpen() {
    this.selectedWeek = moment().format("WW") 
    this.buildWeeklyReport(this.selectedWeek)
  }

  buildWeeklyReport(weekNumber: string) {
    const report = getReport(this.app, weekNumber)
    const timeConsumedAndRemaining = getConsumedAndRemainingTimeForWeek(weekNumber)

    const weekReportObject = {
      total: {
        hours: 168,
        minutes: 10080
      },
      consumed: {
        minutes: timeConsumedAndRemaining.consumedMinutes,
        percentage: Math.round((timeConsumedAndRemaining.consumedMinutes / 10080) * 1000) / 10
      },
      remaining: {
        minutes: timeConsumedAndRemaining.remainingMinutes,
        percentage: Math.round((timeConsumedAndRemaining.remainingMinutes / 10080) * 1000) / 10
      },
      inserted: {
        minutes: 0,
        percentage: 0
      }
    }

    weekReportObject.inserted.minutes = report.reduce((total, report) => total + report.timeSpent, 0)
    weekReportObject.inserted.percentage = Math.round((weekReportObject.inserted.minutes / weekReportObject.consumed.minutes) * 1000) / 10

    const container = this.containerEl.children[1];
    container.empty();
    container.addClass("weekly-report")

    const weeklyReportContainer = container.createEl("div", { cls: "container" })

    // Heading
    const headingContainer = weeklyReportContainer.createEl("hgroup")
    headingContainer.createEl("h1", { text: `Weekly report - ${weekNumber}`})

    const navigationButtonsContainer = headingContainer.createEl("div", { cls: "navigation-buttons" })
    const buttonLeft = navigationButtonsContainer.createEl("button", { text: "◁" })
    const buttonRight = navigationButtonsContainer.createEl("button", { text: "▷" })

    moment.updateLocale('en', {
      week: {
          dow: 1, // Lundi est le premier jour de la semaine
      },
    });
    const thisWeekNumber = moment().week()
    const previousWeekNumber = parseInt(this.selectedWeek || '0') - 1
    const nextWeekNumber = parseInt(this.selectedWeek || '0') + 1
    const nextWeekString = nextWeekNumber.toString().padStart(2, '0')

    if (previousWeekNumber === 0) buttonLeft.style.visibility = "hidden"
    if (thisWeekNumber < nextWeekNumber) buttonRight.style.visibility = "hidden"

    buttonLeft.addEventListener("click", () => {
      this.selectedWeek = (parseInt(this.selectedWeek || '0') - 1).toString().padStart(2, '0');
      this.buildWeeklyReport(this.selectedWeek)
    })
    buttonRight.addEventListener("click", () => {
      if (thisWeekNumber < nextWeekNumber) return
      this.selectedWeek = nextWeekString;
      this.buildWeeklyReport(this.selectedWeek);
    });

    // Progress Bar
    const infosContainer = weeklyReportContainer.createEl("div", { cls: "infos-container" });

    const wholeBar = infosContainer.createEl("div", { cls: "whole-bar" });
    const consumedBar = wholeBar.createEl("div", { cls: "consumed-bar" });
    consumedBar.style.width = `${weekReportObject.consumed.percentage}%`;
    const insertedBar = wholeBar.createEl("div", { cls: "inserted-bar" });
    insertedBar.style.width = `${weekReportObject.inserted.percentage}%`;

    // Labels
    const labelContainer = infosContainer.createEl("div", { cls: "time-labels" });

    const totalLabel = labelContainer.createEl("p", { text: "Total: " });
    totalLabel.createEl("strong", { text: `${weekReportObject.total.hours}h`})
    const consumedLabel = labelContainer.createEl("p", { text: "Consommé: ", attr: { style: "background-color: #787878; color: white" } });
    consumedLabel.createEl("strong", { text: `${weekReportObject.consumed.percentage}% de la semaine`})
    const remainingLabel = labelContainer.createEl("p", { text: "Restant: ", attr: { style: "background-color: lightgray; color: black" } });
    remainingLabel.createEl("strong", { text: `${weekReportObject.remaining.percentage}% de la semaine`})
    const insertedLabel = labelContainer.createEl("p", { text: "Inseré: ", attr: { style: "background-color: black; color: white" } });
    insertedLabel.createEl("strong", { text: `${weekReportObject.inserted.percentage}% du temps consommé`})

    // Divider
    weeklyReportContainer.createEl("hr")

    // Time reports
    const timeReportContainer = weeklyReportContainer.createEl("div", { cls: "time-reports"})
    report.sort((a, b) => b.timeSpent - a.timeSpent).forEach((timeTypeTimeReport, index) => {
      const timeTypeTimePercentage = Math.round((timeTypeTimeReport.timeSpent / weekReportObject.inserted.minutes) * 1000) / 10

      // Work on progress bar
      const hue = (index * weekReportObject.inserted.minutes + timeTypeTimeReport.timeSpent);
      const backgroundColor = `hsl(${hue}, 90%, 65%)`;
      insertedBar.createEl("div", { cls: timeTypeTimeReport.name, attr: { style: `width: ${timeTypeTimePercentage}%; background-color: ${backgroundColor}; border-right: solid 1.5px white` } });

      // Work on labels
      const textColor = getContrastTextColor(hue, 90, 65);
      const timeTypeLabel = labelContainer.createEl("p", { text: `${timeTypeTimeReport.name} `, cls: "time-type-label", attr: { style: `background-color: ${backgroundColor}; color: ${textColor}` } });
      timeTypeLabel.createEl("strong", { text: `${timeTypeTimePercentage}%`})

      // Work on insert block report
      const timeTypeTimeReportContainer = timeReportContainer.createEl("div", { cls: "time-report", attr: { style: `outline: solid 2px ${backgroundColor}` }})
      timeTypeTimeReportContainer.createEl("h2", { text: `${timeTypeTimeReport.name}` })

      const timeTypeTimeInfoParagraph = timeTypeTimeReportContainer.createEl("p")
      timeTypeTimeInfoParagraph.createEl("strong", { text: `${timeTypeTimePercentage}% - ` })
      timeTypeTimeInfoParagraph.createEl("span", { text: `(${formatMinutesToHHMM(timeTypeTimeReport.timeSpent)})` })

      timeTypeTimeReport.projects.sort((a, b) => b.timeSpent - a.timeSpent).forEach(project => {
        const projectTimePercentage = Math.round((project.timeSpent / timeTypeTimeReport.timeSpent) * 1000) / 10

        const projectTimeReportContainer = timeTypeTimeReportContainer.createEl("ul", { cls: "project-time"})
        const projectTimeTitle = projectTimeReportContainer.createEl("div", "title")
        const projectTimeHeader = projectTimeTitle.createEl("h3")
        const projectTimeHeaderLink = projectTimeHeader.createEl("a", { text: `${project.name}` })
        projectTimeHeaderLink.addEventListener("click", async () => {
          await openOrCreateFile(this.app, project.path || '', "source")
        })

        const projectParagraph = projectTimeTitle.createEl("p")
        projectParagraph.createEl("strong", { text: `${projectTimePercentage}% - ` })
        projectParagraph.createEl("span", { text: `(${formatMinutesToHHMM(project.timeSpent)})` })

        const tasksTimeContainer = projectTimeReportContainer.createEl("ul")
        project.tasks.sort((a, b) => b.timeSpent - a.timeSpent).forEach(task => {
          const taskEl = tasksTimeContainer.createEl("li", { text: `${task.text} - `})
          taskEl.createEl("span", { text: formatMinutesToHHMM(task.timeSpent) })
        })
      })
    })
  }


}

const getConsumedAndRemainingTimeForWeek = (weekNumber: string) => {
  moment.updateLocale('en', {
    week: {
        dow: 1, // Lundi est le premier jour de la semaine
    },
  });
  
  const startOfWeek = moment().week(parseInt(weekNumber)).startOf('week'); // Début de la semaine sélectionnée
  const endOfWeek = moment().week(parseInt(weekNumber)).endOf('week'); // Début de la semaine sélectionnée

  const totalMinutesInAWeek = 10080; // Minutes totales de la semaine
  const now = moment(); // Temps actuel
  const consumedMinutes = now.isBefore(startOfWeek) 
    ? 0 
    : now.isAfter(endOfWeek) 
      ? totalMinutesInAWeek
      : now.diff(startOfWeek, 'minutes')
  const remainingMinutes = totalMinutesInAWeek - consumedMinutes; // Minutes restantes

  return { consumedMinutes, remainingMinutes };
}

const formatMinutesToHHMM = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours > 0) {
    return `${hours}h ${mins}min`;
  } else {
    return `${mins}min`;
  }
}

interface TaskTimeReport {
  text: string;
  timeSpent: number;
  metadata: TaskObject['metadata']
}
interface ProjectTimeReport {
  name: string;
  path: string;
  timeSpent: number;
  tasks: TaskTimeReport[];
}
interface TimeTypeTimeReport {
  name: string;
  timeSpent: number;
  projects : ProjectTimeReport[]
}
const getReport = (app: App, weekNumber: string): TimeTypeTimeReport[] => {
  //@ts-ignore
  const dv = app.plugins.plugins.dataview.api;
  const timeTypesProjectsFiles = [
    ["Professionnel", dv.pages("#temps/professionnel")],
    ["Obligatoire", dv.pages("#temps/obligatoire")],
    ["Personnel", dv.pages("#temps/personnel")],
    ["Pour moi", dv.pages("#temps/pour-moi")],
    ["Perdu", dv.pages("#temps/perdu")],
  ];

  const report: TimeTypeTimeReport[] = []

  timeTypesProjectsFiles.forEach((el: any) => {
    const files = el[1].map((el: any) => el.file)

    const projectTimeReports: ProjectTimeReport[] = []

    files.forEach((file: any) => {
      const taskTimeReportsFromThatFile: TaskTimeReport[] = []

      file.tasks.forEach((task: any) => {
        const taskObject = formatTaskObject(task.text, { status: task.status, metadata: { path: task.path, line: task.line } })
        const isTaskFromThisWeek: boolean = !!taskObject.emojiProperties?.scheduled && moment(taskObject.emojiProperties?.scheduled.slice(2), "YYYY-MM-DD").format("WW") === weekNumber
        const timeSpent = moment(taskObject.end, 'HH:mm').diff(moment(taskObject.start, 'HH:mm'), 'minutes')

        if (isTaskFromThisWeek && timeSpent) {
          const taskTimeReport: TaskTimeReport = { text: taskObject.text || '', timeSpent: timeSpent, metadata: taskObject.metadata }
          taskTimeReportsFromThatFile.push(taskTimeReport)
        }
      });

      const projectTimeReport = {
        name: file.name,
        path: file.path,
        timeSpent: taskTimeReportsFromThatFile.reduce((total, report) => total + report.timeSpent, 0),
        tasks: taskTimeReportsFromThatFile.reduce((acc: TaskTimeReport[], report: TaskTimeReport) => {
          const existing = acc.find(r => r.text === report.text);
          if (existing) {
            existing.timeSpent += report.timeSpent;
          } else {
            acc.push({ text: report.text, timeSpent: report.timeSpent, metadata: report.metadata });
          }
          return acc;
        }, []),
      }

      if (projectTimeReport.tasks.length) {
        projectTimeReports.push(projectTimeReport)
      }
    }); 

    const timeTypeTimeReport: TimeTypeTimeReport = {
      name: el[0],
      timeSpent: projectTimeReports.reduce((total, report) => total + report.timeSpent, 0),
      projects: projectTimeReports
    }

    report.push(timeTypeTimeReport)
  });

  return report
}

export const openWeeklyReport = async (app: App) => {
  const { workspace } = app;

  let leaf: WorkspaceLeaf | null = null;
  const leaves = workspace.getLeavesOfType(VIEW_WEEKLY_REPORT);

  if (leaves.length > 0) {
    // A leaf with our view already exists, use that
    leaf = leaves[0];
  } else {
    // Our view could not be found in the workspace, create a new leaf
    // in the right sidebar for it
    leaf = workspace.getLeaf(false);
    if (!leaf) throw new Error("There is no leaf");
    await leaf.setViewState({ type: VIEW_WEEKLY_REPORT, active: true });
  }

  // "Reveal" the leaf in case it is in a collapsed sidebar
  workspace.revealLeaf(leaf);
}

const hslToRgb = (h: number, s: number, l: number): [number, number, number] => {
  s /= 100;
  l /= 100;
  
  const k = (n: number): number => (n + h/30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number): number => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  
  return [
      Math.round(255 * f(0)),
      Math.round(255 * f(8)),
      Math.round(255 * f(4))
  ];
};
const getContrastTextColor = (hue: number, saturation: number, lightness: number): string => {
  const [r, g, b] = hslToRgb(hue, saturation, lightness);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.55  ? 'black' : 'white';
};

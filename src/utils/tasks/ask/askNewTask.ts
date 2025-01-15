import { App } from "obsidian";
import { RecurringTask, recurringTasks } from "src/assets/recurringTasks";
import { openSuggester } from "src/modal/suggesterModal";

export const askNewTask = async (app: App): Promise<RecurringTask | null> => {
  const recurringTasksWithNew: RecurringTask[] = [
    {name: '🆕 Nouvelle tâche', task: {metadata: {}}}, 
    ...recurringTasks() 
  ]

  return await openSuggester(app, {
    displayedValues: [...recurringTasksWithNew.map(task => task.name)],
    usedValues: [...recurringTasksWithNew],
    title: 'Quelle tâche ?'
  });
}
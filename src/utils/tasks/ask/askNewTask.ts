import { App } from "obsidian";
import { RecurringTask, recurringTasks } from "src/assets/recurringTasks";
import { openSuggester } from "src/modal/suggesterModal";

export const askNewTask = async (app: App): Promise<RecurringTask | null> => {
  const recurringTasksWithNew: RecurringTask[] = [
    {name: '🆕 Nouvelle tâche', task: {metadata: {}}}, 
    ...recurringTasks() 
  ]

  const answer = await openSuggester(app, {
    displayedValues: [...recurringTasksWithNew.map(task => task.name)],
    usedValues: [...recurringTasksWithNew],
    title: 'Quelle tâche ?'
  });
  if (!answer) return null

  const checkAnswer = async (answer: RecurringTask | null): Promise<RecurringTask | null> => {
    if (answer && answer.name === "🌙 Sommeil") return answer
    if (answer && answer.task) return answer
    
    if (answer && answer.tasks) {
      const newAnswer = await openSuggester(app, {
        //@ts-ignore
        displayedValues: [...answer.tasks.map(task => task.name)],
        usedValues: [...answer.tasks],
        title: 'Quelle tâche ?'
      });
      if (!newAnswer) return null
      return await checkAnswer(newAnswer)
    }

    return null
  }

  return await checkAnswer(answer)
}
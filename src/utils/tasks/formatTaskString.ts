import { TaskObject } from "./formatTaskObject";

export const formatTaskString = (task: TaskObject) => {
  if (!task.status) throw new Error('Task status is required');

  const timeRange = task.start && task.end ? `${task.start} - ${task.end}` : '';

  const parts = [
    `- [${task.status}]`,
    timeRange,
    task.text,
    task.tags?.join(' '),
    task.occurrences,
    [
      task.emojiProperties?.priorityLowest, // ⏬️ 
      task.emojiProperties?.priorityLow, // 🔽
      task.emojiProperties?.priorityMedium, // 🔼
      task.emojiProperties?.priorityHigh, // ⏫️
      task.emojiProperties?.priorityHighest, // 🔺️
      task.emojiProperties?.scheduled, // ⏳️
      task.emojiProperties?.due, // 📅
      task.emojiProperties?.start, // 🛫
      task.emojiProperties?.created, // ➕️
      task.emojiProperties?.cancelled, // ❌️
      task.emojiProperties?.done, // ✅️
      task.emojiProperties?.after, // 🆔️
      task.emojiProperties?.before, // ⛔️
      task.emojiProperties?.recurs, // 🔁
    ].filter(Boolean).join(' ')
  ].filter(Boolean);
  return parts.join(' ');
}
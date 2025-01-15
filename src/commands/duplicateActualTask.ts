import { Editor, EditorPosition } from "obsidian";
import { formatTaskObject, TaskObject } from "src/utils/tasks/formatTaskObject";
import { formatTaskString } from "src/utils/tasks/formatTaskString";
import { timeFromTask } from "src/utils/time";

export const duplicateActualTask = async (editor: Editor, cursor: EditorPosition, lineContent: string) => {
  const content = editor.getValue()
  const task = formatTaskObject(lineContent, { metadata: { line: cursor.line } })
  const newTask: TaskObject = {...task}

  const isAlreadyDuplicate = !!task.occurrences

  newTask.status = " " 
  if (task.start && task.end) {
    newTask.start = timeFromTask(task, "after", "end", 5)
    newTask.end = timeFromTask(newTask, "after", "start", 30)
  }

  if (isAlreadyDuplicate) {
    const destructuredTaskOccurence = task.occurrences?.match(/\((\d+)\/(\d+)\)/)
    if (!destructuredTaskOccurence || !destructuredTaskOccurence[1] || !destructuredTaskOccurence[2]) throw new Error("Supposed to have an occurence number");

    const taskOccurencePosition = destructuredTaskOccurence[1]
    const newTotalOccurence = parseInt(destructuredTaskOccurence[2]) + 1

    content.split('\n').forEach((line, lineNumber) => {
      if (line.startsWith('- [') && line.includes(task.text || '')) {
        const taskObject = formatTaskObject(line, { metadata: { line: lineNumber } })
        const isLineOnUnderCursor = taskObject.occurrences === task.occurrences 
        const destructuredOccurence = taskObject.occurrences?.match(/\((\d+)\/(\d+)\)/)

        if (!destructuredOccurence || !destructuredOccurence[1] || !destructuredOccurence[2]) throw new Error("Supposed to have an occurence number");

        if (!isLineOnUnderCursor) {
          const leftNumber = destructuredOccurence[1] > taskOccurencePosition 
            ? parseInt(destructuredOccurence[1]) + 1 
            : destructuredOccurence[1]

          taskObject.occurrences = `(${leftNumber}/${newTotalOccurence})`

          editor.setLine(taskObject.metadata.line || lineNumber, formatTaskString(taskObject))
        }
      }
    });

    task.occurrences = `(${taskOccurencePosition}/${newTotalOccurence})`
    newTask.occurrences = `(${parseInt(taskOccurencePosition) + 1}/${newTotalOccurence})`
  } else {
    task.occurrences = "(1/2)"
    newTask.occurrences = "(2/2)"
  }
  const updatedLineContent = formatTaskString(task)
  const newLineContent = formatTaskString(newTask)
  editor.setLine(task.metadata.line || cursor.line, `${updatedLineContent}\n${newLineContent} `);
  editor.setCursor((task.metadata.line || cursor.line) + 1, newLineContent.length + 1);

  


  // if (isAlreadyDuplicate) {
  //   // Handle existing duplicate task
  //   // Extract current total from first occurrence (X/Y) -> get Y and increment
  //   const firstMatch = occurences[0].text.match(/\((\d+)\/(\d+)\)/);
  //   const newTotal = parseInt(firstMatch[2]) + 1;
    
  //   // Update numbering for all existing occurrences
  //   occurences.forEach((occurrence, index) => {
  //     const newText = occurrence.text.replace(/\(\d+\/\d+\)/, `(${index + 1}/${newTotal})`);
  //     editor.setLine(occurrence.line, newText);
  //   });
    
  //   // Add new occurrence at the end with updated numbering and time
  //   const lastOccurrence = occurences[occurences.length - 1];
  //   let newLineContent = lastOccurrence.text.replace(/\(\d+\/\d+\)/, `(${newTotal}/${newTotal})`);
  //   if (timeMatch) {
  //     newLineContent = newLineContent.replace(/\d{2}:\d{2}\s*-\s*\d{2}:\d{2}/, timeStringForNextTask.trim());
  //   }
  //   editor.replaceRange(`\n${newLineContent}`, {line: lastOccurrence.line, ch: lastOccurrence.text.length});
  // } else {
  //   // Add (1/2) to original task
  //   const updatedLineContent = occurences[0].text + (occurences[0].text.endsWith(' ') ? '' : ' ') + `(1/2)`;
  //   editor.setLine(occurences[0].line, updatedLineContent);

  //   // Add duplicate task with (2/2) and updated time
  //   let newLineContent = occurences[0].text + (occurences[0].text.endsWith(' ') ? '' : ' ') + `(2/2)`;
  //   if (timeMatch) {
  //     newLineContent = newLineContent.replace(/\d{2}:\d{2}\s*-\s*\d{2}:\d{2}/, timeStringForNextTask.trim());
  //   }
  //   editor.replaceRange(`\n${newLineContent}`, {line: occurences[0].line, ch: updatedLineContent.length});
  //   editor.setCursor(occurences[0].line + 1, newLineContent.length);
  // }
}
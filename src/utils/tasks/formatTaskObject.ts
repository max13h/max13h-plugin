import { Notice, moment } from "obsidian";

export interface TaskMetadata {
  path?: string;
  line?: number;
  startCh?: number;
  endCh?: number;
}
export interface TaskObject {
  status?: ' ' | 'x' | '/' | '-';
  start?: string;
  end?: string;
  tags?: string[];
  occurrences?: string;
  emojiProperties?: {
    priorityLowest?: string; // ⏬️ 
    priorityLow?: string; // 🔽
    priorityMedium?: string; // 🔼
    priorityHigh?: string; // ⏫️
    priorityHighest?: string; // 🔺️
    scheduled?: string; // ⏳️
    due?: string; // 📅
    start?: string; // 🛫
    created?: string; // ➕️
    cancelled?: string; // ❌️
    done?: string; // ✅️
    after?: string; // 🆔️
    before?: string; // ⛔️
    recurs?: string; // 🔁
  };
  text?: string;
  metadata: TaskMetadata
}

const patterns = {
  status: /^-\s*\[([ \/x-])\]/,
  time: /\b\d{1,2}:\d{2}\s*-\s*\b\d{1,2}:\d{2}\b/,
  start: /\b\d{1,2}:\d{2}\b/,
  end: /\b\d{1,2}:\d{2}\b/,
  occurrences: /\(\d+\/\d+\)/,
  tags: /#\S+/g,
  emojiProperties: {
    // Priority levels
    priorityLowest:  /(⏬[^⏬⏫🔽🔼🔺⏳📅🛫➕✅❌⛔🆔🔁\n#]*)/u,
    priorityLow:     /(🔽[^⏬⏫🔽🔼🔺⏳📅🛫➕✅❌⛔🆔🔁\n#]*)/u,
    priorityMedium:  /(🔼[^⏬⏫🔽🔼🔺⏳📅🛫➕✅❌⛔🆔🔁\n#]*)/u,
    priorityHigh:    /(⏫[^⏬⏫🔽🔼🔺⏳📅🛫➕✅❌⛔🆔🔁\n#]*)/u,
    priorityHighest: /(🔺[^⏬⏫🔽🔼🔺⏳📅🛫➕✅❌⛔🆔🔁\n#]*)/u,
    
    // Status indicators
    scheduled: /(⏳[^⏬⏫🔽🔼🔺⏳📅🛫➕✅❌⛔🆔🔁\n#]*)/u,
    due:       /(📅[^⏬⏫🔽🔼🔺⏳📅🛫➕✅❌⛔🆔🔁\n#]*)/u,
    start:     /(🛫[^⏬⏫🔽🔼🔺⏳📅🛫➕✅❌⛔🆔🔁\n#]*)/u,
    created:   /(➕[^⏬⏫🔽🔼🔺⏳📅🛫➕✅❌⛔🆔🔁\n#]*)/u,
    cancelled: /(❌[^⏬⏫🔽🔼🔺⏳📅🛫➕✅❌⛔🆔🔁\n#]*)/u,
    done:      /(✅[^⏬⏫🔽🔼🔺⏳📅🛫➕✅❌⛔🆔🔁\n#]*)/u,
    
    // Relations
    after:     /(🆔[^⏬⏫🔽🔼🔺⏳📅🛫➕✅❌⛔🆔🔁\n#]*)/u,
    before:    /(⛔[^⏬⏫🔽🔼🔺⏳📅🛫➕✅❌⛔🆔🔁\n#]*)/u,
    recurs:    /(🔁[^⏬⏫🔽🔼🔺⏳📅🛫➕✅❌⛔🆔🔁\n#]*)/u,
  },
  text: /[^⏬⏫🔽🔼🔺⏳📅🛫➕✅❌⛔🆔🔁#\n]+/u,
};

const extractAndRemove = (text: string | null, pattern: RegExp): [string[], string] => {
  const match = (text || '').match(pattern);
  if (!match) return [[], text || ''];

  const extracted = [...match];
  const newText = (text || '').replace(pattern, '').trim();
  return [extracted, newText];
};

const extractEmojiProperties = (text: string): [TaskObject['emojiProperties'], string] => {
  let currentText = text;
  const emojiProperties: TaskObject['emojiProperties'] = {};

  const extractEmojiProperty = (text: string, pattern: RegExp): [string | undefined, string] => {
    const match = text.match(pattern);
    if (!match) return [undefined, text];
    
    const value = match[1]?.trim();
    const newText = text.replace(pattern, '').trim();
    return [value, newText];
  };

  Object.entries(patterns.emojiProperties).forEach(([key, pattern]) => {
    const [value, newText] = extractEmojiProperty(currentText, pattern);
    if (value) {
      emojiProperties[key as keyof typeof emojiProperties] = value;
    }
    currentText = newText;
  });

  return [
    Object.keys(emojiProperties).length > 0 ? emojiProperties : undefined,
    currentText
  ]
};

export const formatTaskObject = (task: string, additional?: { status?: TaskObject['status'], metadata?: TaskMetadata }) => {
  const isFullTaskString = task.trim().startsWith("- [")
  if (!isFullTaskString && !additional) throw new Error("Missing informations about the task given");

  const taskObject: TaskObject = {metadata: additional?.metadata || {}};

  if (isFullTaskString && task.match(/^- \[([ x\/\-])\]/)) {
    const statusMatch = task.match(/^- \[([ x\/\-])\]/)?.[1] || ''
    if (![' ', 'x', '/', '-'].includes(statusMatch)) throw new Error("Not able to retrieve status")
    // @ts-ignore
    taskObject.status = statusMatch;
    task = task.replace(/^- \[([ x\/\-])\] /, '').trim();
  } else if (!isFullTaskString) {
    taskObject.status = additional?.status
  } else {
    throw new Error("Not able to retrieve status from task given");
  }
  const [time, textAfterTime] = extractAndRemove(task, patterns.time);
  const [start, textAfterStart] = time[0] ? extractAndRemove(time[0], patterns.start) : [null, textAfterTime];
  taskObject.start = start?.[0];
  const [end] = extractAndRemove(textAfterStart, patterns.end);
  taskObject.end = end?.[0];


  const [tags, textAfterTags] = extractAndRemove(textAfterTime, patterns.tags);
  taskObject.tags = tags;
  const [occurrences, textAfterOccurrences] = extractAndRemove(textAfterTags, patterns.occurrences);
  taskObject.occurrences = occurrences?.[0];

   const [emojiProperties, textAfterEmojiProperties] = extractEmojiProperties(textAfterOccurrences);
   taskObject.emojiProperties = emojiProperties

  taskObject.text = textAfterEmojiProperties.trim();

  return taskObject;
}

const sendNoticeAndThrowError = (value: string) => {
  const string = `Task's ${value} doesn't have an appropriate value`
  new Notice(string)
  throw new Error(string)
}

export const testTaskObject = (task: TaskObject) => {
  const momentStart = moment(task.start, "HH:mm")
  const momentEnd = moment(task.end, "HH:mm")
  const isTaskStartBeforeEnd = momentStart.diff(momentEnd) < 0

  if (task.status && ![' ', 'x', '/', '-'].includes(task.status || '')) {
    sendNoticeAndThrowError('STATUS')
  }
  if (task.start && !momentStart.isValid()) {
    sendNoticeAndThrowError('START')
  }
  if (task.end && !momentEnd.isValid()) {
    console.log(task);
    sendNoticeAndThrowError('END')
  }
  if (task.start && task.end && !isTaskStartBeforeEnd) {
    console.log('bien dedans');
    sendNoticeAndThrowError('START AND END')
  }
  if (task.tags?.length && task.tags?.some(tag => !tag.startsWith('#'))) {
    sendNoticeAndThrowError('TAGS')
  }
  if (task.occurrences && !task.occurrences.match(/\(\d+\/\d+\)/)) {
    sendNoticeAndThrowError('OCCURENCES')
  }
}
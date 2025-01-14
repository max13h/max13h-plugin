import { moment } from 'obsidian';
import { TaskObject } from './tasks/formatTaskObject';

//Time
export const timeNow = () => moment().format('HH:mm')

export const timeBeforeFromNow = (durationInMinutes = 0) => moment().subtract(durationInMinutes, 'minutes').format('HH:mm');

export const timeLaterFromNow = (durationInMinutes = 0) => moment().add(durationInMinutes, 'minutes').format('HH:mm');

export const durationFromStartTime = (start: string, durationInMinutes = 0) => moment(start, 'HH:mm').add(durationInMinutes, 'minutes').format('HH:mm');

export const timeFromTask = (task: TaskObject | null, beforeOrAfter: "before" | "after", startOrEnd: "start" | "end", distance: number = 1) => {
  if (!task || !task[startOrEnd]) return undefined

  const time = moment(task[startOrEnd], 'HH:mm');

  if (beforeOrAfter === "before") {
    time.subtract(distance, 'minutes').format('HH:mm')
  } else if (beforeOrAfter === "after") {
    time.add(distance, 'minutes').format('HH:mm')
  }
  return time.format('HH:mm')
}

//Date
type DayName = 'today' | 'tomorrow' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export const getNextDayDate = (dayName: DayName) => {
  const daysMap = {
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
    sunday: 7,
  };

  const targetDay = daysMap[dayName as keyof typeof daysMap];
  if (!targetDay) {
    throw new Error('Invalid day name. Please use "Monday", "Tuesday", etc.');
  }

  const today = moment();
  const daysToAdd = (targetDay + 7 - today.isoWeekday()) % 7 || 7;  // Ensure the result is the next occurrence

  return today.add(daysToAdd, 'days').format('YYYY-MM-DD');
}

export const dateWithEmoji = (date: string) => {
  if (date === '') throw new Error("Not able to return a date with empty string");
  
  if (date === 'today' || date === 'tomorrow' || date === 'monday' || date === 'tuesday' || date === 'wednesday' || date === 'thursday' || date === 'friday' || date === 'saturday' || date === 'sunday') {
    switch (date) {
      case 'today': return `\u23F3 ${moment().format('YYYY-MM-DD')}`;
      case 'tomorrow': return `\u23F3 ${moment().add(1, 'day').format('YYYY-MM-DD')}`;
      default: return `\u23F3 ${getNextDayDate(date)}`;
    }
  } else {
    const parsedDate = moment(date, 'YYYY-MM-DD', true);
    if (!parsedDate.isValid()) throw new Error("Invalid date format. Please use 'YYYY-MM-DD'.");
    return `\u23F3 ${parsedDate.format('YYYY-MM-DD')}`;
  }
}
import { TaskObject } from "src/utils/tasks/formatTaskObject";
import { dateWithEmoji, timeLaterFromNow, timeNow } from "src/utils/time";

export interface RecurringTask {
  name: string;
  tasks?: TaskObject[];
  task?: TaskObject;
}

export const recurringTasks = (): RecurringTask[] => {
  return [
    {
      name: "🌙 Sommeil",
      tasks: [
        {
          status: " ",
          start: timeNow(),
          end: "23:59",
          text: "🌙 Sommeil soirée",
          emojiProperties: {
            scheduled: dateWithEmoji('today')
          },
          metadata: {
            path: "_bin/Hygiène de vie.md"
          }
        },
        {
          status: " ",
          start: "00:00",
          end: "06:30",
          text: "🌙 Sommeil matin",
          emojiProperties: {
            scheduled: dateWithEmoji('tomorrow')
          },
          metadata: {
            path: "_bin/Hygiène de vie.md"
          }
        }
      ]
    },
    {
      name: "👕🫧 Laverie",
      task: {
        status: " ",
        text: "👕🫧 Laverie",
        start: timeNow(),
        end: timeLaterFromNow(10),
        emojiProperties: {
          scheduled: dateWithEmoji('today'),
        },
        metadata: {
          path: "_bin/Foyer et entretiens.md"
        }
      },
    },
    {
      name: "🚿🪥🪒 Salle de bain",
      tasks: [
        {
          status: " ",
          text: "🚿 Douche",
          start: timeNow(),
          end: timeLaterFromNow(15),
          emojiProperties: {
            scheduled: dateWithEmoji('today')
          },
          metadata: {
            path: "_bin/Foyer et entretiens.md"
          }
        },
        {
          status: " ",
          text: "🪥 Brossage des dents",
          start: timeNow(),
          end: timeLaterFromNow(15),
          emojiProperties: {
            scheduled: dateWithEmoji('today')
          },
          metadata: {
            path: "_bin/Foyer et entretiens.md"
          }
        },
        {
          status: " ",
          text: "🪒 Rasage",
          start: timeNow(),
          end: timeLaterFromNow(15),
          emojiProperties: {
            scheduled: dateWithEmoji('today')
          },
          metadata: {
            path: "_bin/Foyer et entretiens.md"
          }
        }
      ],
    },
    {
      name: "🍎🥗🍚 Repas",
      tasks: [
        {
          status: " ",
          text: "🍎 Petit déjeuner",
          start: timeNow(),
          end: timeLaterFromNow(15),
          emojiProperties: {
            scheduled: dateWithEmoji('today')
          },
          metadata: {
            path: "_bin/Manger.md"
          }
        },
        {
          status: " ",
          text: "🥗 Déjeuner",
          start: timeNow(),
          end: timeLaterFromNow(15),
          emojiProperties: {
            scheduled: dateWithEmoji('today')
          },
          metadata: {
            path: "_bin/Manger.md"
          }
        },
        {
          status: " ",
          text: "🍚 Dîner",
          start: timeNow(),
          end: timeLaterFromNow(25),
          emojiProperties: {
            scheduled: dateWithEmoji('today')
          },
          metadata: {
            path: "_bin/Manger.md"
          }
        }
      ],
    },
    {
      name: "⛹️🤸🏊 Activités physiques",
      tasks: [
        {
          status: " ",
          text: "🤸Étirement",
          start: timeNow(),
          end: timeLaterFromNow(10),
          emojiProperties: {
            scheduled: dateWithEmoji('today')
          },
        metadata: {
          path: "_bin/Sport.md"
        }
        }
      ],
    },
    {
      name: "☠️ Temps perdu",
      task: {
        status: " ",
        text: "☠️ Temps perdu",
        start: timeNow(),
        end: timeLaterFromNow(30),
        emojiProperties: {
            scheduled: dateWithEmoji('today')
          },
        metadata: {
          path: "_bin/Temps perdu.md"
        }
      },
    },
    {
      name: "🧘 Temps calme",
      task: {
        status: " ",
        text: "🧘 Temps calme",
        start: timeNow(),
        end: timeLaterFromNow(15),
        emojiProperties: {
            scheduled: dateWithEmoji('today')
          },
        metadata: {
          path: "_bin/Hygiène de vie.md"
        }
      },
    },
  ]
}
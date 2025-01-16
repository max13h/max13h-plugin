import { TaskObject } from "src/utils/tasks/formatTaskObject";
import { dateWithEmoji, timeLaterFromNow, timeNow } from "src/utils/time";

export interface RecurringTask {
  name: string;
  tasks?: RecurringTask[];
  task?: TaskObject;
}

export const recurringTasks = (): RecurringTask[] => {
  return [
    {
      name: "🌙 Sommeil",
      tasks: [
        {
          name: "🌙 Sommeil soirée",
          task: {
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
        },
        {
          name: "🌙 Sommeil matin",
          task: {
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
        }
      ]
    },
    {
      name: "💜 Avec Marie",
      tasks: [
        {
          name: "Test",
          task: {
            status: " ",
            start: timeNow(),
            end: timeLaterFromNow(20),
            text: "💜 Temps chill avec Marie",
            emojiProperties: {
              scheduled: dateWithEmoji('today')
            },
            metadata: {
              path: "_bin/Avec Marie 💜.md"
            }
          },
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
          name: "🚿 Douche",
          task: {
            status: " ",
            text: "🚿 Douche",
            start: timeNow(),
            end: timeLaterFromNow(15),
            emojiProperties: {
              scheduled: dateWithEmoji('today')
            },
            metadata: {
              path: "_bin/Bien être & santé.md"
            }
          },
        },
        {
          name: "🪥 Brossage des dents",
          task: {
            status: " ",
            text: "🪥 Brossage des dents",
            start: timeNow(),
            end: timeLaterFromNow(15),
            emojiProperties: {
              scheduled: dateWithEmoji('today')
            },
            metadata: {
              path: "_bin/Bien être & santé.md"
            }
          },
        },
        {
          name: "🪒 Rasage",
          task: {
            status: " ",
            text: "🪒 Rasage",
            start: timeNow(),
            end: timeLaterFromNow(15),
            emojiProperties: {
              scheduled: dateWithEmoji('today')
            },
            metadata: {
              path: "_bin/Bien être & santé.md"
            }
          },
        },
        {
          name: "🚽 Toilette",
          task: {
            status: " ",
            text: "🚽 Toilette",
            start: timeNow(),
            end: timeLaterFromNow(10),
            emojiProperties: {
              scheduled: dateWithEmoji('today')
            },
            metadata: {
              path: "_bin/Foyer et entretiens.md"
            }
          },
        }
      ],
    },
    {
      name: "🍎🥗🍚 Repas",
      tasks: [
        {
          name: "🛒 Faire les courses",
          task: {
            status: " ",
            text: "🛒 Faire les courses",
            start: timeNow(),
            end: timeLaterFromNow(45),
            emojiProperties: {
              scheduled: dateWithEmoji('today')
            },
            metadata: {
              path: "_bin/Manger.md"
            }
          },
        },
        {
          name: "🍳 Préparer le repas",
          task: {
            status: " ",
            text: "🍳 Préparer le repas",
            start: timeNow(),
            end: timeLaterFromNow(30),
            emojiProperties: {
              scheduled: dateWithEmoji('today')
            },
            metadata: {
              path: "_bin/Manger.md"
            }
          },
        },
        {
          name: "🍎 Petit déjeuner",
          task: {
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
        },
        {
          name: "🥗 Déjeuner",
          task: {
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
        },
        {
          name: "🍚 Dîner",
          task: {
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
          },
        }
      ],
    },
    {
      name: "⛹️🤸🏊 Activités physiques",
      tasks: [
        {
          name: "🤸Étirement",
          task: {
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
        }
      ],
    },
    {
      name: "🚗 Voiture",
      task: {
        status: " ",
        text: "🚗 Voiture",
        start: timeNow(),
        end: timeLaterFromNow(20),
        emojiProperties: {
            scheduled: dateWithEmoji('today')
          },
        metadata: {
          path: "_bin/Transports.md"
        }
      },
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
import { App, moment } from "obsidian";
import { formatTaskObject } from "./formatTaskObject";
import { TaskObject } from "./formatTaskObject";


export const retrieveMostRecentTask = (
  app: App,
  direction: "past" | "future" // Indique si l'on veut chercher une tâche passée ("past") ou future ("future").
): TaskObject | null => {
  // @ts-ignore
  const dv = app.plugins.plugins.dataview.api;
  const now = new Date();
  let mostRecentTask: TaskObject | null = null;
  let smallestTimeDiff = Infinity;

  const pagePaths = dv.pagePaths();
  pagePaths.forEach((path: string) => {
    
    const tasks = dv.page(path).file.tasks
    tasks.forEach((task: any) => {
      // Formate l'objet tâche pour en extraire des informations utiles.
      const formattedTask = formatTaskObject(task.text, { status: task.status, metadata: { path: task.link.path, line: task.line, startCh: task.position.start.col, endCh: task.position.end.col } });

      // Cherche une propriété d'émoji correspondant à une date (commençant par "⏳").
      const dateStr = formattedTask.emojiProperties?.scheduled?.slice(2).trim()
      if (!dateStr) return;
      if (!moment(dateStr, 'YYYY-MM-DD', true).isValid()) return "Invalid date format. Please use 'YYYY-MM-DD'."

      // Sépare les heures et minutes si elles existent dans le champ `end`.
      const [hours, minutes] = (formattedTask.end || '').split(':').map(Number);

      // Convertit la chaîne de date en un objet `Date`.
      const taskDate = new Date(dateStr);

      // Si la conversion échoue (date invalide), ignore cette tâche.
      if (isNaN(taskDate.getTime())) return;

      // Ajoute les heures et minutes au temps de la tâche.
      taskDate.setHours(hours || 0, minutes || 0);

      // Calcule la différence en millisecondes entre maintenant et la date de la tâche.
      const timeDiff = now.getTime() - taskDate.getTime();

      // Vérifie si la tâche correspond au critère "past" ou "future".
      if (
        (direction === "past" && timeDiff > 0 && timeDiff < smallestTimeDiff) || // Tâche passée la plus récente.
        (direction === "future" && timeDiff < 0 && -timeDiff < smallestTimeDiff) // Tâche future la plus proche.
      ) {
        // Met à jour la plus petite différence de temps trouvée.
        smallestTimeDiff = Math.abs(timeDiff);

        // Stocke la tâche comme la plus proche pour le moment.
        mostRecentTask = formattedTask
        };
      }
    );
  });

  // Retourne la tâche la plus proche trouvée ou null si aucune n'a été trouvée.
  return mostRecentTask;
};





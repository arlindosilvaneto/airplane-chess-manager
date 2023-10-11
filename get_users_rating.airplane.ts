import airplane from "airplane";
import { parsePlayerData } from "./utils";

function convertToCSV(arr) {
  if (arr.length === 0) {
    return '';
  }

  // Extract headers
  const headers = Object.keys(arr[0]);

  // Create rows
  const rows = arr.map(obj => {
    return headers.map(header => {
      let data = obj[header];

      // Quote the data if it contains special characters
      if (typeof data === 'string' && (data.includes(',') || data.includes('\n') || data.includes('"'))) {
        data = `"${data.replace(/"/g, '""')}"`;  // Escape double quotes
      }
      return data;
    }).join(',');
  });

  // Join headers and rows
  return [headers.join(','), ...rows].join('\n');
}

export default airplane.task(
  {
    slug: "get_users_rating",
    name: "Get Users Rating",
    parameters: {
      webhook_payload: {
        name: "Webhook payload",
        type: "json",
        default: {
          body: {},
          headers: {}
        }
      }
    },
    resources: {
      db: "atlas_cluster"
    }
  },
  // This is your task's entrypoint. When your task is executed, this
  // function will be called.
  async () => {
    const { output: users } = await airplane.mongodb.find("db", "users");

    return convertToCSV(
      parsePlayerData(users)
        .map(user => ({
          id: user.id,
          rating: user.rating,
          lastScore: user.lastScore,
          lastScoreDate: new Date(user.lastScoreDate).toLocaleString(),
          progress: user.progress.map(progress => progress.rating).join('-')
        }))
    );
  }
);

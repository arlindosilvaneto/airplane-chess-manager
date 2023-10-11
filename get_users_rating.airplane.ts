import airplane from "airplane";
import { parsePlayerData, convertToCSV } from "./utils";

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
          lastScoreDate: user.lastScoreDate,
          progress: user.progress.map(progress => progress.rating).join('-')
        }))
    );
  }
);

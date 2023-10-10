import airplane from "airplane";

export default airplane.task(
  {
    slug: "update_user_rating",
    name: "Update User Rating",
    resources: {
      db: "atlas_cluster"
    },
    parameters: {
      user_id: {
        name: "User ID",
        type: "shorttext",
        required: true
      },
      rating: {
        name: "User Rating",
        type: "integer",
        default: 800
      },
      meta: {
        name: "User Update Meta",
        type: "shorttext",
        default: "{}"
      }
    }
  },
  // This is your task's entrypoint. When your task is executed, this
  // function will be called.
  async ({ user_id, rating, meta }) => {
    let response: object;

    const { output: user } = await airplane.mongodb.findOne("db", "users", {
      filter: { id: user_id }
    });

    if (!user?._id) {
      const newUser = {
        id: user_id,
        rating: [{
          rating,
          timestamp: new Date().getTime()
        }],
        meta
      };

      response = await airplane.mongodb.insertOne(
        "db", "users", newUser
      );
    } else {
      user.rating.push({
        rating,
        timestamp: new Date().getTime()
      });
      user.meta = JSON.stringify({
        ...JSON.parse(user.meta),
        ...JSON.parse(meta)
      });

      response = await airplane.mongodb.updateOne(
        "db", "users", { $set: { rating: user.rating, meta: user.meta } }, {
        filter: { id: user_id }
      });
    }

    return response
  }
);

import airplane from "airplane";

export default airplane.task(
  {
    slug: "get_all_users",
    name: "Get All Users",
    resources: {
      db: "atlas_cluster"
    }
  },
  // This is your task's entrypoint. When your task is executed, this
  // function will be called.
  async () => {
    const {output: users} = await airplane.mongodb.find("db", "users");

    return users;
  }
);

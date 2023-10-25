const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");
let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("connected");
    });
  } catch (e) {
    console.log("catch error");
    process.exit();
  }
};

initializeDBAndServer();
//get todo
const jsonToRes = (item) => {
  return {
    id: item["id"],
    todo: item["todo"],
    priority: item["priority"],
    status: item["status"],
  };
};
const getResObj = (result) => {
  return result.map((item) => jsonToRes(item));
};
const statusAndPriority = (requestQuery) => {
  return (
    requestQuery.status !== undefined && requestQuery.priority !== undefined
  );
};
const status = (requestQuery) => {
  return requestQuery.status !== undefined;
};
const priority = (requestQuery) => {
  return requestQuery.priority !== undefined;
};
app.get("/todos/", async (request, response) => {
  const { search_q = "", priority, status } = request.query;
  let getTodoQuery = "";
  switch (true) {
    case statusAndPriority(request.query):
      getTodoQuery = `select * from todo where todo like '%${search_q}%' and status='${status}' and Priority='${priority}';`;
      break;

    case status(request.query):
      getTodoQuery = `select * from todo where todo like '%${search_q}%' and status='${status}';`;
      break;

    case priority(request.query):
      getTodoQuery = `select * from todo where todo like '%${search_q}%' and priority='${priority}';`;
      break;
    default:
      getTodoQuery = `select * from todo where todo like '%${search_q}%';`;
  }

  const result = await db.all(getTodoQuery);
  const final = getResObj(result);
  response.send(final);
});

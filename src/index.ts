import express from "express";
import http from "http";
import registerSocket from "./websocket";
import cors from "cors";
import router from "./routes";
import errorHandler from "./middlewares/errorHandler";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

const server = http.createServer(app);
const socket = registerSocket(server);

app.use((req, res, next) => {
  req.websocket = socket;
  return next();
});

app.use(router);
app.use(errorHandler);

const port = process.env.PORT || 3333;

server.listen(port, () => {
  console.log("Server listening to %d", port);
});

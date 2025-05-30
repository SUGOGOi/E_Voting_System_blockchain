import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./src/config/dbConfig.js";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import http from "http";
import { Server } from "socket.io";
import { socketManager } from "./src/socket/socketManager.js";
import passport from "passport";
import cookieParser from "cookie-parser";
import { Admin } from "./src/models/adminModel.js";

//<=====================================IMPORT ROUTES==============================>
import voterRoutes from "./src/routes/voterRoute.js";
import conflictRoutes from "./src/routes/conflictRoute.js";
import adminRoutes from "./src/routes/adminRoute.js";
import transactionRoutes from "./src/routes/transactionRoute.js";
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

//<===================Initialize Socket.IO======================>
socketManager.initialize(io).setupEventHandlers();

//<==============ADDITIONAL MIDDLEWARE==========================>
app.use(cookieParser()); // Cookie Parser
app.use(helmet());
app.use(express.json());
app.use(morgan("dev"));
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  next();
});
app.use("/uploads", express.static("uploads"));

//<==================DB CONNECT==============================>
connectDB();

//<==============USING ROUTES===============================>
app.use("/voter", voterRoutes); // voter routes
app.use("/data", conflictRoutes); // check conflict routes
app.use("/v1", adminRoutes); // admin routes
app.use("/transaction", transactionRoutes);

const port = process.env.PORT;

//<===================================================================SOCKET IO=========================================================>

let countdownValue = 0; // Default value in seconds
let interval = null;
let isPaused = true;
let canVote = false;

const broadcastCountdown = () => {
  canVote = countdownValue > 1; // Allow voting only if time > 1
  io.emit("countdown", { countdownValue, isPaused, canVote });
};

const startCountdown = () => {
  if (interval || countdownValue <= 0) return;
  isPaused = false;

  interval = setInterval(() => {
    if (!isPaused && countdownValue > 0) {
      countdownValue--;
      broadcastCountdown();
    }
    if (countdownValue <= 0) {
      clearInterval(interval);
      interval = null;
      isPaused = true;
      canVote = false; // Disallow voting when time is up
      broadcastCountdown();
    }
  }, 1000);
};

const stopCountdown = () => {
  isPaused = true;
  if (interval) {
    clearInterval(interval);
    interval = null;
  }
};

io.on("connection", (socket) => {
  console.log("User connected");
  broadcastCountdown(); // Sync client with latest state

  socket.on("setCountdown", (value) => {
    const numericValue = parseInt(value);
    if (isNaN(numericValue) || numericValue < 0) return;

    countdownValue = numericValue;
    isPaused = true;
    canVote = countdownValue > 1;
    broadcastCountdown();
  });

  socket.on("startCountdown", () => {
    startCountdown();
  });

  socket.on("pauseCountdown", () => {
    isPaused = true;
    broadcastCountdown();
  });

  socket.on("resetCountdown", () => {
    stopCountdown();
    countdownValue = 0;
    canVote = false;
    broadcastCountdown();
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

server.listen(port, () => {
  console.log(`server  running ${port}`);
});

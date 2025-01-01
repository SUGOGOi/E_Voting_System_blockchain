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
import cookieParser from 'cookie-parser';
import { Admin } from "./src/models/adminModel.js";
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';


//<=====================================IMPORT ROUTES==============================>
import voterRoutes from "./src/routes/voterRoute.js";
import conflictRoutes from "./src/routes/conflictRoute.js";
import adminRoutes from "./src/routes/adminRoute.js";
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


//<=======================================passport===================================
var opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Extracts JWT from Authorization header

    secretOrKey: process.env.JWT_ACCESS_TOKEN_SECRET_KEY, // Secret key for JWT verification
};

passport.use(new JwtStrategy(opts, async function(jwt_payload, done) {
    try {
        // Attempt to find the admin based on the _id from JWT payload
        const user = await Admin.findOne({ _id: jwt_payload._id }).select('-password'); // Exclude password field

        if (user) {
            return done(null, user); // If admin found, pass the admin object
        } else {
            return done(null, false); // If no admin found, authentication fails
        }

    } catch (error) {
        return done(error, false); // Corrected variable name from 'err' to 'error'
    }
}));
app.use(passport.initialize());



//<==============ADDITIONAL MIDDLEWARE==========================>
app.use(helmet());
app.use(express.json());
app.use(morgan("dev"));
app.use(
    express.urlencoded({
        extended: true,
    })
);
app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
}));
app.use(cookieParser()) // Cookie Parser



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

const port = process.env.PORT;


//<===================================================================SOCKET IO=========================================================>

let countdownValue = 0; // Default value in seconds
let interval = null;
let isPaused = true;
let canVote = false

const broadcastCountdown = () => {
    if (countdownValue > 1) {
        canVote = true
    }
    io.emit('countdown', { countdownValue, isPaused, canVote });
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
            isPaused = true; // Automatically pause
            broadcastCountdown(); // Notify the frontend that the countdown is finished
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

io.on('connection', (socket) => {
    console.log('User connected');
    broadcastCountdown();

    socket.on('setCountdown', (value) => {
        countdownValue = value;
        isPaused = true;
        broadcastCountdown();
    });

    socket.on('startCountdown', () => {
        startCountdown();
    });

    socket.on('pauseCountdown', () => {
        isPaused = true;
        broadcastCountdown();
    });

    socket.on('resetCountdown', () => {
        stopCountdown();
        countdownValue = 0; // Reset to 0 by default
        broadcastCountdown();
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});






server.listen(port, () => {
    console.log(`server  running ${port}`);
});
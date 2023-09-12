/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import express from "express";
import http from 'https';
import { Server } from 'socket.io';
import { IP_ADDRESS, SERVER_PORT, VUE_PORT } from "../data/data"
import cors from 'cors';
import fs from 'fs';

const options = {
    key: fs.readFileSync('cert\\CA\\localhost\\localhost.decrypted.key', 'utf-8'),
    cert: fs.readFileSync('cert\\CA\\localhost\\localhost.crt', 'utf-8')
};

const app = express();
app.use(cors({
    origin: '*',
}));
const server = http.createServer(options, app);
const io = new Server(server, {
    cors: {
        origin: [`https://localhost:${VUE_PORT}`, `https://${IP_ADDRESS}:${VUE_PORT}`],
        methods: ["GET", "POST"],
        allowedHeaders: ["my-custom-header"],
        credentials: true
    }
});

enum USER_STATUS {
    CONNECTED,
    DISCONNECTED
}

interface User {
    id: string;
    username: string;
    status: USER_STATUS
}

let users: User[] = [];
const messages: any[] = [];

app.get("/", (req, res) => {
    res.send("Successfully verified server! Pick a username and join in!");
});

app.get("/usernameexists/:username", (req, res) => {
    const username = req.params.username;
    for (const user of users) {
        if (user.username == username) {
            res.send(true);
            return;
        }
    }
    res.send(false);
});

app.get("/delete/:username", (req) => {
    const username = req.params.username;
    users = users.filter(user => user.username != username);
});

function getUserById(id: string) {
    for (const i of users)
        if (i.id == id)
            return i;
    return undefined;
}

function getUserByName(name: string) {
    for (const i of users)
        if (i.username == name)
            return i;
    return undefined;
}

io.on('connection', (socket) => {
    socket.on('disconnect', () => {
        const user = getUserById(socket.id);
        if (user)
            user.status = USER_STATUS.DISCONNECTED;
        io.emit("disconnected", JSON.stringify({users: users}));
    });
    socket.on('sent', (message) => {
        messages.push(JSON.parse(message));
        io.emit("sent", message);
    });
    socket.on('getmessagehistory', () => {
        socket.emit("getmessagehistory", JSON.stringify({msgs: messages}));
    });
    socket.on('joined', (message) => {
        const currentSocket: User = {
            id: socket.id,
            username: message,
            status: USER_STATUS.CONNECTED
        };
        const user = getUserByName(message);
        if (user == undefined) {
            users.push(currentSocket);
            messages.push({
                message: `${currentSocket.username} joined`,
                sender: currentSocket.username,
                timestamp: Date.now(),
                type: 1,
            })
        } else {
            user.id = socket.id;
            user.status = USER_STATUS.CONNECTED;
        }
        io.emit("joined", JSON.stringify({users: users, user: currentSocket, isNew: user == undefined}));
    });
})

server.listen(SERVER_PORT, () => {
    console.log(`Listening on port ${SERVER_PORT}`);
});
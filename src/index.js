const http = require('http');
const express = require('express');
const path = require("path");
const socketio = require('socket.io');


const app = express()
const server = http.createServer(app)
const io = socketio(server)
// Public set up
app.use(express.static(path.join(__dirname, '../public')))


let message = 'Welcome!';
let count = 0

io.on('connection',(socket)=>{
    console.log('New WebSocket connection')
    count++;
    // socket.emit('countUpdated', count)

    // socket.on('increment', ()=>{
    //     count++;
    //     // socket.emit('countUpdated', count)
    //     io.emit('countUpdated',count)
    // })
    socket.emit('message', message, count)
    socket.on('sendmessage',(message )=>{
        io.emit('message', message)
    })
} )

// PORT
const PORT = process.env.PORT || 3000
server.listen(PORT, ()=>{
    console.log('Server is runnin on '+PORT)
})
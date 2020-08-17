const http = require('http');
const express = require('express');
const path = require("path");
const socketio = require('socket.io');
const Filter = require('bad-words');
const {generateMessage, generateLocationMessage} = require('./utils/messages')
const {addUser, getUser, getUsersInRoom, removeUser} = require('./utils/users')


const app = express()
const server = http.createServer(app)
const io = socketio(server)
// Public set up
app.use(express.static(path.join(__dirname, '../public')))


io.on('connection',(socket)=>{
    console.log('New WebSocket connection')
   
    socket.on('join', (options, callback)=>{
        const {error, user } = addUser({id:socket.id, username:options.username, room:options.room})
        if(error){
            return callback(error)
        }
        socket.join(user.room)

        socket.emit('message',generateMessage(user.username,'Welcome!') )
        // New user joined
        socket.broadcast.to(user.room).emit('message', generateMessage(user.username,`${user.username} has joined`))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        }) 
        callback() 
    })
    
    // Form message
    socket.on('sendmessage',(message, callback )=>{
        const filter = new Filter()
        if(filter.isProfane(message)){
            return callback('Profanity is not allowed!')
        }
        const user = getUser(socket.id)
        io.to(user.room).emit('message', generateMessage(user.username,message));
        callback()
    })
    // Location lat and long
    socket.on('sendLocation',(coords, callback)=>{
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username,`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback()
    })

    // Notifiying disconnection
    socket.on('disconnect', ()=>{
        const user = removeUser(socket.id)
        if(user){
            io.to(user.room).emit('message', generateMessage(`${user.username} has left!`))
            io.to(user.room).emit('roomData', {
                room:user.room,
                users:getUsersInRoom(user.room)
            })
        }
    })
})

// PORT
const PORT = process.env.PORT || 3000
server.listen(PORT, ()=>{
    console.log('Server is runnin on '+PORT)
})
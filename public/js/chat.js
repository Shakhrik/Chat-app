const socket = io()

// socket.on('countUpdated', (count)=>{
//     console.log('Count updated:',count)
// })

// document.querySelector('#increment').addEventListener('click',()=>{
//     console.log('Clicked')
//     socket.emit('increment')
// })

socket.on('message', (message,count)=>{
    console.log('Message:',message)
})

document.querySelector('#message-form').addEventListener('submit',(e)=>{
    e.preventDefault()
    console.log('Sended');
    const message = e.target.elements.message.value
    socket.emit('sendmessage', message)
})
const socket = io()

const $messageForm = document.querySelector('#message-form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages');

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;
// Options
const {room} = Qs.parse(location.search, { ignoreQueryPerfix: true })
const Parsed = Qs.parse(location.search, { ignoreQueryPrefix: true })
const username = Parsed.username

const autoscroll = ()=>{
    // New message element
    const $newMessage = $messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

    // Visible height
    const visibleHeight = $messages.offsetHeight

    // Height of messages container
    const containerHeight = $messages.scrollHeight

    // How far have I scrolled?
    const scrollOfset = $messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOfset){
        $messages.scrollTop = $messages.scrollHeight
    }
}

// Messages listener

socket.on('message', (message)=>{
    console.log(message.text)
    const html = Mustache.render(messageTemplate, {
        message:message.text,
        createdAt:moment(message.createdAt).format('HH:mm'),
        username:message.username
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()

})

// SendLocation button listener
socket.on('locationMessage', (message)=>{
    const html = Mustache.render(locationMessageTemplate, {
        locationUrl:message.url,
        createdAt:moment(message.createdAt).format('HH:mm'),
        username:message.username
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('roomData', (options)=>{
    console.log(options.room)
    console.log(options.users)
    const html = Mustache.render(sidebarTemplate,{
        room:options.room,
        users:options.users
    })
    document.querySelector('#sidebar').innerHTML = html
})

$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()
    //disable 
    $messageFormButton.setAttribute('disabled', 'disabled')
    const message = e.target.elements.message.value

    socket.emit('sendmessage', message, (error)=>{
        $messageFormButton.removeAttribute('disabled') 
        $messageFormInput.value = ''
        $messageFormInput.focus()
        // enable
        if(error){
            return console.log(error)
        }
        console.log('Message is delivered!')
    })
})


$sendLocationButton.addEventListener('click', ()=>{
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your browser')
    }
    // Disable the button
    $sendLocationButton.setAttribute('disabled', 'disabled');

    navigator.geolocation.getCurrentPosition((position)=>{
        socket.emit('sendLocation', {
            latitude:position.coords.latitude,
            longitude:position.coords.longitude
        }, ()=>{
            console.log('Location is shared!')
            // Re-enable the button
            $sendLocationButton.removeAttribute('disabled')
        })
        
    })
})

socket.emit('join', {username, room}, (error)=>{
    if(error){
        alert(error)
        location.href = '/'
    }
})
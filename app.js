const express = require('express');
const path = require('path');
const socket = require('socket.io');
const app = express();
app.use(express.static('public'));
app.get('/', (req,res,next) => {
    res.sendFile(path.join(__dirname, 'public', 'rtc.html'));
});

const server = app.listen(3000);

const io = socket(server);

io.on('connection', function(socket){
    socket.on('video-offer', function(data){
        io.emit('video-offer', data);
    })
    socket.on('video-answer', function(data){
       io.emit('video-answer', data);
    })
    socket.on('newICE',function(data){
        io.emit('addICECandidate', data);
    })
})


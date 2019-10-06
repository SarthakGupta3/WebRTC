const express = require('express');
const path = require('path');

const app = express();
app.use(express.static('public'));
app.get('/',(req,res,next) => {
    res.send('hi');
})
app.get('/chat',(req,res,next) => {
    res.sendFile(path.join(__dirname, 'public', 'rtc.html'));
})

app.listen(8080);

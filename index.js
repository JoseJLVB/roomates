const express = require('express');
const app = express();
app.use(express.static('static'));
const axios = require('axios');
const uuid = require('uuid');
const fs = require('fs').promises;

app.use( express.json() );
app.use( express.urlencoded({ extended: true }) );

async function newRoomate(){
    const roomateData = await axios.get('https://randomuser.me/api')
    const randomUser = roomateData.data.results[0]
    const user = {
        id : uuid.v4().slice(30),
        nombre: randomUser.name.first + ' ' + randomUser.name.last,
    }
    return user
}

app.post('/roommates', async(req, res)=>{
    
    const roommate = await newRoomate()
    const db = await fs.readFile('db.json', 'utf-8')
    db = JSON.parse(db)
    db.roommates.push(randomUser)
    await fs.writeFile('db.json', JSON.stringify(db), 'utf-8')
    res.json(db)
});

app.post('/gasto', async (req, res)=>{
    let body;
    req.on('data', (payload) =>{
        body = JSON.parse(payload);
    });
    req.on('end', async()=>{
        let id = uuid.v4().slice(30);

        const gasto = {
            roomate: body.roomate,
            descripcion: body.descripcion,
            monto: body.monto,
            id: id
        };

        let db = await fs.readFile('db.json', 'utf-8');
        db = JSON.parse(db);
        db.gastos.push(gasto)

        await fs.writeFile('db.json', JSON.stringify(db), 'utf-8')
        res.send({todo: 'OK'});
    });
});
app.get('/roommates', (req, res) => {   
    let db = require('./db.json')
    let roommates = db.roommates
    res.json({roommates})
})

app.get('/gastos', (req, res) => {
    let db = require('./db.json')
    let gastos = db.gastos
    res.json({gastos})
})

app.listen(3000, function(){
    console.log('Running server on  port 3000')
})
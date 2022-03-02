const express = require('express');
const app = express();
const axios = require('axios');
const uuid = require('uuid');
const fs = require('fs').promises;


app.use(express.static('static'));
app.use( express.json() );
app.use( express.urlencoded({ extended: true }) );



app.get('/gastos', async (req, res) => {
    let db = await fs.readFile('db.json', 'utf-8')
    db = JSON.parse(database)
    let gastos = db.gastos
    res.send({gastos})
});

app.get('/roommates', async (req, res) => {   
    let db = await fs.readFile('db.json', 'utf-8')
    let roommates = db.roommates
    res.send({roommates})
});

app.post('/roommates', async(req, res)=>{
    
    const roomateData = await axios.get('https://randomuser.me/api')
    const randomUser = roomateData.data.results[0]
    const user = {
        id : uuid.v4().slice(30),
        nombre: randomUser.name.first + ' ' + randomUser.name.last,
    }
    
    let db = await fs.readFile('db.json', 'utf-8')
    db = JSON.parse(db)
    db.roommates.push(randomUser)
    await fs.writeFile('db.json', JSON.stringify(db), 'utf-8')
    res.send({todo: 'ok'})
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




app.put('/gasto', async (req, res)=> {
    const id = req.query.id;
    let body;
    req.on('data', (payload) => {
        body = JSON.parse(payload);
    });
    req.on('end', async () => {
        let db = await fs.readFile('db.json', 'utf-8')
        db = JSON.parse(db)
        let gasto = db.gastos.find(g=>g.id === id)
        let gastopast = gasto.monto

        gasto.roommate = body.roommate
        gasto.monto = body.monto
        gasto.descripcion = body.descripcion

        let roommate = db.roommates.find(r => r.nombre == body.roommate);
        let roomatepast = roommate.debe

        roommate.debe = roommate.debe + (gasto.monto - gastopast)

        await fs.writeFile('db.json', JSON.stringify(db), 'utf-8') 
        res.send({todo:'ok'})
    })
})

app.delete('/gasto', async(req, res) => {
    const id = req.query.id;
    let db = await fs.readFile ('db.json', 'utf-8');
    db = JSON.parse(db);
    const deletegastos = db.gastos.filter(x => x.id !== id);
    db.gastos = deletegastos
    await fs.writeFile('db.json', JSON.stringify(db), 'utf-8');
    res.send(db);
})


app.listen(3000, function(){
    console.log('Running server on  port 3000')
})
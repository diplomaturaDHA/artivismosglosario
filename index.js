import express from 'express'
import exphbs from 'express-handlebars'

import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import bodyParser from 'body-parser'

import bcrypt from 'bcrypt'

const dbPromise = open({
  filename: 'data.db',
  driver: sqlite3.Database
})

const app = express()

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');
//app.use(bodyParser.urlencoded({extended:false}))
app.use(express.urlencoded({extended:false}))
app.use(express.static('public'));

app.get('/', async (req, res) => {
  const db = await dbPromise;
  const messages = await db.all('SELECT * FROM Message;')
  res.render('home', { messages })
})
app.get('/alta', async (req, res) => {
  const db = await dbPromise;
  const messages = await db.all('SELECT * FROM Message;')
  res.render('alta', { messages })
})
app.get('/glosario/:letra', async (req, res) => {
  const  letraTxt  = req.params.letra
  console.log(`palabra`+req.params.letra);
  const db = await dbPromise;
  const messages = await db.all('SELECT * FROM Message WHERE letra = ?;', [req.params.letra])
  res.render('glosario', { letraTxt,messages })
})
app.get('/register', async (req, res) => {
  res.render('register')
})
app.get('/artistas', async (req, res) => {
  res.render('artistas')
})
app.get('/introduccion', async (req, res) => {
  res.render('introduccion')
})
app.post('/message', async (req, res) => {
  const db = await dbPromise
  const messageText = req.body.messageText
  const descripcionText = req.body.descripcionText
  const autorText = req.body.autorText
  const letraText = req.body.letraText
  await db.run('INSERT INTO Message (titulo,descripcion,autor,letra) VALUES (?,?,?,?);',[ messageText,descripcionText,autorText,letraText])
  res.redirect('/')
})
app.get('/delete/:id',async (req, res) => {
  const db = await dbPromise
  const  idPalabra  = req.params.id
 
  await db.run('delete FROM Message WHERE id = ?;',[idPalabra],function(err){
    if(err){
      console.log(err.message)
    }
    console.log('got deleted' + idPalabra)
  })
    
    res.redirect('/')
  
});

app.post('/register', async (req, res) => {
  const {
    name,
    email,
    password,
    passwordConfirmation
  } = req.body;
  const passwordHash = await bcrypt.hash(password, 10)
  console.log(passwordHash)
  res.redirect('/')
})

const setup = async () => {
  const db = await dbPromise
  await db.migrate()
  app.listen(8000, () => {
    console.log('listening on localhost:8000')
  })
}
setup()

const express = require('express')
const app = express()
const mongoose = require('mongoose')
const exphbs = require('express-handlebars')
const bodyParser = require('body-parser')
const port = 3000

app.engine('handlebars', exphbs({ defaultLayout: 'main' }))
app.set('view engine', 'handlebars')
app.use(bodyParser.urlencoded({ extended: true }))

mongoose.connect('mongodb://localhost/todo', { useNewUrlParser: true })

const db = mongoose.connection

db.on('error', () => {
    console.log('mongodb error!')
})

db.once('open', () => {
    console.log('mongodb connected!')
})

const Todo = require('./models/todo')
app.use(express.static('public'))

app.get('/', (req, res) => {
    Todo.find((err, todos) => {
        if (err) return console.log(err)
        return res.render('index', { todos: todos })
    })
})

app.get('/todos', (req, res) => {
    return res.redirect('/')
})

app.get('/todos/new', (req, res) => {
    res.render('new')
})

app.post('/todos', (req, res) => {
    const todo = Todo({
        name: req.body.name
    })
    todo.save(err => {
        if (err) return console.log(err)
        return res.redirect('/')
    })
})

app.get('/todos/:id', (req, res) => {
    Todo.findById(req.params.id, (err, todo) => {
        if (err) return console.error(err)
        return res.render('detail', { todo: todo })
    })
})

app.get('/todos/:id/edit', (req, res) => {
    Todo.findById(req.params.id, (err, todo) => {
        if (err) return console.error(err)
        return res.render('edit', { todo: todo })
    })
})

app.post('/todos/:id/edit', (req, res) => {
    Todo.findById(req.params.id, (err, todo) => {
        if (err) return console.error(err)
        todo.name = req.body.name
        todo.save(err => {
            if (err) return console.error(err)
            return res.redirect(`/todos/${req.params.id}`)
        })
    })
})

app.post('/todos/:id/delete', (req, res) => {
    Todo.findById(req.params.id, (err, todo) => {
        if (err) return console.error(err)
        todo.remove(err => {
            if (err) return console.error(err)
            return res.redirect('/')
        })
    })
})

app.listen(port, () => {
    console.log('app is running')
})
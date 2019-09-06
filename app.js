const express = require('express')
const app = express()
const mongoose = require('mongoose')
const exphbs = require('express-handlebars')
const bodyParser = require('body-parser')
const port = 3000

app.engine('handlebars', exphbs({ defaultLayout: 'main' }))
app.set('view engine', 'handlebars')
app.use(bodyParser.urlencoded({ extended: true }))

mongoose.connect('mongodb://localhost/restaurant', { useNewUrlParser: true })

const db = mongoose.connection

db.on('error', () => {
    console.log('mongodb error!')
})

db.once('open', () => {
    console.log('mongodb connected!')
})

const Restaurant = require('./models/restaurant')
app.use(express.static('public'))

app.get('/', (req, res) => {
    Restaurant.find((err, restaurants) => {
        if (err) return console.log(err)
        return res.render('index', { restaurants: restaurants })
    })
})

app.get('/search', (req, res) => {
    Restaurant.find((err, restaurants) => {
        const restaurant = restaurants.filter(restaurant => {
            return restaurant.name.toLowerCase().includes(req.query.keyword.toLowerCase())
        })
        res.render('index', { restaurants: restaurant,keyword: req.query.keyword })
    })
})

app.get('/restaurants', (req, res) => {
    return res.redirect('/')
})

app.get('/restaurants/new', (req, res) => {
    res.render('new')
})

app.post('/restaurants', (req, res) => {
    const restaurant = Restaurant({
        name: req.body.name,
        name_en: req.body.name_en,
        category: req.body.category,
        image: req.body.image,
        location: req.body.location,
        phone: req.body.phone,
        google_map: req.body.google_map,
        rating: req.body.rating,
        description: req.body.description
    })
    restaurant.save(err => {
        if (err) return console.log(err)
        return res.redirect('/')
    })
})

app.get('/restaurants/:id', (req, res) => {
    Restaurant.findById(req.params.id, (err, restaurant) => {
        if (err) return console.error(err)
        return res.render('detail', { restaurant: restaurant })
    })
})

app.get('/restaurants/:id/edit', (req, res) => {
    Restaurant.findById(req.params.id, (err, restaurant) => {
        if (err) return console.error(err)
        return res.render('edit', { restaurant: restaurant })
    })
})

app.post('/restaurants/:id/edit', (req, res) => {
    Restaurant.findById(req.params.id, (err, restaurant) => {
        if (err) return console.error(err)
        restaurant.name = req.body.name
        restaurant.name_en = req.body.name_en
        restaurant.category = req.body.category
        restaurant.image = req.body.image
        restaurant.location = req.body.location
        restaurant.phone = req.body.phone
        restaurant.google_map = req.body.google_map
        restaurant.rating = req.body.rating
        restaurant.description = req.body.description
        restaurant.save(err => {
            if (err) return console.error(err)
            return res.redirect(`/restaurants/${req.params.id}`)
        })
    })
})

app.post('/restaurants/:id/delete', (req, res) => {
    Restaurant.findById(req.params.id, (err, restaurant) => {
        if (err) return console.error(err)
        restaurant.remove(err => {
            if (err) return console.error(err)
            return res.redirect('/')
        })
    })
})

app.listen(port, () => {
    console.log('app is running')
})
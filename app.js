const express = require('express')
const app = express()
const bodyparser = require('body-parser')
const routes = require('./routes/routes')
const compression = require('compression')
const helmet = require('helmet')

const port = process.env.PORT||3000;

app.use(bodyparser.urlencoded({extended:true}))
app.use(express.static(__dirname + "/public"))  //to connect to css folder
app.use(routes)
app.use(compression())
app.use(helmet())

app.set("view engine","ejs");

app.listen(port,function(){
    console.log("App is connected to port 3000!");
});
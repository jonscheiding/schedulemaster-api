import express from 'express'

const app = express()
app.get('/', (req, res) => res.status(200).end())

app.listen(3000)
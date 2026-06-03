import express from "express"

import dotenv from "dotenv"
import connectDB from "./Configs/ConnextDB.js"

dotenv.config()

const app = express()

const PORT = process.env.PORT

app.get("/" , (req,res)=>{
    res.json("Hello from Server")
})

app.listen(PORT , ()=>{
    console.log(`Server Started on Port ${PORT}`)
    connectDB()
})
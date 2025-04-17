const express = require('express')
const mongoose = require('mongoose')
const RedisStore = require('connect-redis').RedisStore;
const redis = require('redis');
const session = require('express-session');
const cors = require('cors')


const { MONGO_USER, MONGO_PASSWORD, MONGO_IP, MONGO_PORT, REDIS_URL, SESSION_SECRET, REDIS_PORT } = require('./config/config')
const app = express()
const port = process.env.PORT || 3000

const postRouter = require('./routes/postRoute')
const userRouter = require('./routes/userRoute')


let redisClient = redis.createClient({
    socket: {
      host: REDIS_URL,
      port: REDIS_PORT
    }
  });

  redisClient.connect().catch(console.error);

  app.enable("trust proxy")
  app.use(cors({}))
  app.use(
    session({
      store: new RedisStore({ client: redisClient }),
      secret: SESSION_SECRET,
      cookie: {
        secure: false, // true in production with HTTPS
        resave: false,
        saveUninitialized: false,
        httpOnly: true,
        maxAge: 60000,
      },
    })
  );

app.use(express.json())
app.get("/api/v1", (req, res) => {
    console.log("Hmmm, do we still have multiple node containers?")
    res.send("<h2>Hello Kojo Asiedu. Let's get the bag this year. It is so important</h2>")
})


app.use("/api/v1/posts", postRouter)
app.use("/api/v1/users", userRouter)

const startServer = () => {

    app.listen(port, () => console.log(`listening on port ${port}`))
}

const connectWithRetry = () => {
    console.log({MONGO_USER, MONGO_PASSWORD, MONGO_IP, MONGO_PORT})
    mongoose.connect(`mongodb://${MONGO_USER}:${MONGO_PASSWORD}@mongo:27017/?authSource=admin`)
    .then(() => {
        console.log('Successfully connected to ..MongoDB.')
        startServer()
    })
    .catch((e) => {
        console.error('Error connecting to MongoDB...', e)
        setTimeout(connectWithRetry, 5000)
    })
}

connectWithRetry()


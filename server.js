const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cookieParser = require('cookie-parser');

//route file เอารวมไว้ตรงนี้
const auth = require('./routes/auth');
const campgrounds = require('./routes/campgrounds');
const bookings = require('./routes/bookings');
//API Security & other
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const {xss} = require('express-xss-sanitizer');
const hpp = require('hpp');
const cors = require('cors');

const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');

dotenv.config({path:'./config/config.env'});
//connect to db
connectDB();

const app = express();

app.use(express.json());

app.use(cookieParser());

app.use(mongoSanitize());

app.use(helmet());

app.use(xss());

app.use(hpp());

app.use(cors());

app.use('/api/v1/campgrounds',campgrounds);
//เอา app.use campground ไว้ด้านบนบรรทัดนี้ (ปัง)
app.use('/api/v1/auth',auth);
app.use('/api/v1/bookings',bookings);


app.get('/', (req,res) => {
    res.status(200).json({success:true, data:{id:1}});
});

const PORT = process.env.PORT || 4000;

const server = app.listen(
    PORT, 
    console.log('Server running in ', 
    process.env.NODE_ENV,
    ' on' + process.env.HOST + ":" + PORT
    )
);

const swaggerOptions={
    swaggerDefinition:{
        openapi: '3.0.0',
        info: {
        title: 'Campground API',
        version: '1.0.0',
        description: 'Campground Booking API'
        },
        servers:[
            {
                url: process.env.HOST + ":" + PORT + '/api/v1'
            }
        ],
    },
    apis:['./routes/*.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs));

process.on('unhandledRejection',(err,promise)=> {
    console.log(`Error: ${err.message}`);
    server.close(()=>process.exit(1));
})
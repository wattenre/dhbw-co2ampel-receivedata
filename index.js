// simple node.js application to receive data from clients and keep this data in memeory

const express = require('express');
const bodyParser = require('body-parser');
const {randomBytes} = require('crypto');
const axios = require('axios');
const cors = require('cors'); 

const app = express();
app.use(bodyParser.json());

const measurements = {};

// dynamic endpoint
var EP_EVENTBUS = process.env.EP_EVENTBUS || 'http://localhost';

// will be invoked when a GET request is received
app.get('/values', (req,res)=>{
  // when a get request is received send all data back to the requester
  res.send(measurements);
});

// will be invoked when a post request is received - it means a new measurements is received from a device
app.post('/values',  async(req, res) =>{
    // generate a unique id for each new post request
    const id = randomBytes(4).toString('hex');
    
    // get the data from request body
    const { data } = req.body;
    const { devid} = req.body.data[0];
    // put the data into the data array with id as key
    measurements[id] = {
        id,data
    };
    console.log(measurements[id]);
    
    // send data to event bus
    await axios.post(`${EP_EVENTBUS}:4005/events`, {
        type: 'measurements received',
        measurementdata: { 
            id,
            data
        } 
    });
    
    // return status 201 to client and the data itself
    res.status(201).send(measurements[id]);
});

app.listen(4000, () =>{
    console.log(`${EP_EVENTBUS}:4005/events`)
    console.log('Listening on port 4000')
})
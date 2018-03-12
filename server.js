require('dotenv').config();
const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const axios = require('axios');
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());
app.disable('x-powered-by');

app.use('/', express.static(path.join(__dirname, 'public')));

app.get('/favorites', function(req, res){
  const data = JSON.parse(fs.readFileSync('./data.json'));
  res.setHeader('Content-Type', 'application/json');
  res.status(200).json(data);
});

app.get('/search', async (req, res)=>{
  const {queryString} = req.query;
  const url = `http://www.omdbapi.com/?s=${queryString}&apikey=${process.env.API_KEY}`;
  let totalResults = 0;
  let nextPage = 1;
  let results = [];
  try{
     results = await axios.get(url).then((response)=>{
      if(response.Response === 'False'){
        throw new Error(`No title matches ${queryString}`);
      }
      totalResults = response.data.totalResults;
      return response.data.Search;
    });
    if(results && results.length){
      while(results.length < totalResults){
        let chunk = await axios.get(`${url}&page=${nextPage}`);
        nextPage ++;
        results = results.concat(chunk.data.Search);
      }
    }
    res.status(200).json(results);
  }catch(error){
    console.error(error);
    res.status(400).json(error);
  }
});

app.get('/fullDescription',async (req, res)=>{
  const {movieId} = req.query;
  const url = `http://www.omdbapi.com/?i=${movieId}&apikey=${process.env.API_KEY}`;
  let result;
  try{
    result = await axios.get(url).then((response)=>{
      return response.data;
    });
    res.status(200).json(result);
  }catch(error){
    console.error(error);
    res.status(400).json(error);
  }
});

// didn't have enough time to complete this
// app.get('/poster', async (req, res)=>{
//   const {movieId} = req.query;
//   const url = `http://img.omdbapi.com/?i=${movieId}&apikey=${process.env.API_KEY}`;
//   try{
//     const data = await axios.get(url);
//     res.status(200).json(data.data)
//   }catch(error){
//     console.error(error);
//     res.status(400).json(error);
//   }
// });

app.post('/addToFavorites', (req, res)=>{
  const {title, imdbID} = req.body;
  if(!title || !imdbID){
    res.status(400).send("Error");
  }
  try{
    let data = JSON.parse(fs.readFileSync('./data.json'));
    data.push({title, imdbID});
    fs.writeFileSync('./data.json', JSON.stringify(data));
    res.status(201).send();
  }catch(error){
    console.error(error);
    res.status(400).json(error);
  }
});

app.listen(port, function(){
  console.log(`Listening on port ${port}`);
});

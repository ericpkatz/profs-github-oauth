try {
  Object.assign(process.env, require('./.env'));
}
catch(ex){
  console.log(ex);
}
const axios = require('axios');
const express = require('express');
const path = require('path');
const app = express();
const ejs = require('ejs');
const qs = require('querystring');
app.engine('html', ejs.renderFile);

app.get('/', (req, res, next)=> {
  res.render(path.join(__dirname, 'index.html'), { user: undefined });
});

app.get('/github/callback', (req, res, next)=> {
  axios.post('https://github.com/login/oauth/access_token', {
    client_id: process.env.CLIENT_ID, 
    client_secret: process.env.CLIENT_SECRET,
    code: req.query.code
  })
  .then( response => response.data)
  .then( data => {
    const { access_token } = qs.parse(data);
    return axios.get('https://api.github.com/user', {
      headers: {
        authorization: `token ${access_token}`
      }
    })
  })
  .then(response => response.data)
  .then(githubUser => res.send(githubUser))
  .catch(next);
});

app.get('/login', (req, res, next)=> {
  const URL = `https://github.com/login/oauth/authorize?client_id=${process.env.CLIENT_ID}`;
  res.redirect(URL);
});

app.listen(process.env.PORT || 3000);

const express = require('express');
const mongoose = require('mongoose');

const port = process.env.PORT || 8000;
const app = require('./app');

app.listen(port, () => {
  console.log("3up API server listening on port:", port);
});

const Gun = require('gun');
const { serve } = require('gun');
const express = require('express');

const app = express();
const port = process.env.RELAY_PORT;

app.use(serve);

const server = app.listen(port, () => {
    console.log(`Gun relay server running at http://localhost:${port}`);
});

Gun({ web: server });
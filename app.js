const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.urlencoded({ extended : false }));

app.get('/', (req, res) => {
    res.json({
        msg: 'success'
    })
})

const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`Server started on port: ${port}`));
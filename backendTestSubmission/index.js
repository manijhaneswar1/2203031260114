const express = require('express');
const cors = require('cors');
const { configDotenv } = require("dotenv");
const loggerMiddleware = require('./middlewares/loggerMiddleware');
const shortUrlRoutes = require('./routes/shortUrlRoutes');

const app = express();
configDotenv();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(loggerMiddleware);

app.use('/', shortUrlRoutes);

app.use((err, req, res, next) => {
    process.stdout.write(`[ERROR] ${err.message}\n`);
    res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});

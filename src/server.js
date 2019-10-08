import app from './app';

const port = 3333;

console.log(process.env.APP_URL);
app.listen(port);

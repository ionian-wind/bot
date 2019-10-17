const localtunnel = require('localtunnel');
const express = require('express');

const viber = require('./client/viber');
const telegram = require('./client/telegram');
const facebook = require('./client/facebook');

const PORT = process.env.HTTP_PORT || 0;
const HOST = process.env.HTTP_HOST || '0.0.0.0';

const app = express();

app.use(
    express.json(),
    express.urlencoded({ extended: true })
);

app.use(
    facebook.route,
    telegram.route,
    viber.route
);

app.listen(PORT, HOST, async function () {
    try {
        const { port } = this.address();

        const tunnel = await localtunnel({ port });

        await facebook.hook(tunnel.url);
        await viber.hook(tunnel.url);
        await telegram.hook(tunnel.url);

        console.log(`started ${tunnel.url}`);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
});

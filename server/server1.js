'use strict';

/* Подключаем Zone.js для сервера */
require('zone.js/dist/zone-node');

const express = require('express');
const ngUniversal = require('@nguniversal/express-engine');

const appServer = require('./dist-server/main.bundle');

/* Рендеринг на стороне сервера */
function angularRouter(req, res) {

    res.render('index', { req, res });

}

const app = express();

/* Направляем роут в корень нашего приложения*/
app.get('/', angularRouter);

/* Отдаем статические файлы генерируемые CLI  (index.html, CSS? JS, assets...) */
// app.use(express.static(`${__dirname}/dist`));
app.use(express.static('D:/projects/Angular/shop/dist/shop/index.html'));

/*Конфигурируем движок Angular Express */
app.engine('html', ngUniversal.ngExpressEngine({
    bootstrap: appServer.AppServerModuleNgFactory
}));
app.set('view engine', 'html');
app.set('views', 'dist');

/* Direct all routes to index.html, where Angular will take care of routing */
app.get('*', angularRouter);
app.post('*', angularRouter);

app.listen(3000, () => {
    console.log(`Listening on http://localhost:3000`);
});

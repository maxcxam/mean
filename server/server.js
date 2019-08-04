const express = require('express');
const MongoClient = require('mongodb').MongoClient;

const app = express();
const mongoClient = new MongoClient("mongodb+srv://root:Ghbdtngh1@cluster0-yhi5k.gcp.mongodb.net/test?retryWrites=true&w=majority", {useNewUrlParser: true});
const jsonParser = express.json();
let clientDb, db, products, users;

mongoClient.connect((err, client) => {
    if(err) return console.log(err);
    clientDb = client;
    db = client.db('data');
    products = db.collection('products');
    users = db.collection('users');
    users.createIndex({'loginName' : 1}, {'unique' : true});
});

const DIST_FOLDER = 'dist';
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.set('views', DIST_FOLDER+'/shop');

const html = 'dist/shop/index.html';
const port = 8080;
const apiUrl = '/api';

app.get('/app/*', function(req, res) {
    res.sendFile(html)
});

app.listen(port, (err) => {
    if (err) return console.log('something bad happened', err);
    console.log('Сервер ожидает подключения...');
    console.log('Html: ' + html);
});

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.get('/api/BookShop/GetBook/:id', (req, res) => {
    console.log(req.params.id);
    products.findOne({_id: +req.params.id}, (err, product) => {
        if(err) return console.log(err);
        console.log(product);
        res.send(product);
    });
});

app.get('/api/BookShop/GetBooksById/:id', (req, res) => {
    console.log(req.params.id);
    products.find({cat_id: +req.params.id}).toArray((err, products) =>{
        if(err) return console.log(err);
        console.log(products);
        res.send(products);
    });
});

app.get('/api/BookShop/GetAllBooks', (req, res) => {
    products.find({}).toArray((err, products) =>{
        if(err) return console.log(err);
        //console.log(products);
        res.send(products);
    });
});

app.get('/api/BookShop/DeleteBook/:id', (req, res) => {
    console.log(req.params.id);
    products.deleteOne({_id: +req.params.id}, (err, obj) => {
        if(err) return console.log(err);
        if (obj.result.n) {
            console.log('Товар видалено успішно');
            res.send('Товар видалено успішно');
        } else {
            console.log('Такого товару не знайдено');
            res.send('Такого товару не знайдено');
        }
    });
});

app.get('/api/BookShop/DeleteAllBooks', (req, res) => {
    products.deleteMany({}, (err, obj) => {
        if(err) return console.log(err);
        if (obj.result.n) {
            console.log('Всі товари видалено успішно');
            res.send('Всі товари видалено успішно');
        } else {
            console.log('Товарів не знайдено');
            res.send('Товарів не знайдено');
        }
    });
});

app.get('/api/BookShop/GetAllCategories', (req, res) => {
    products.find({}).toArray((err, products) =>{
        if(err) return console.log(err);
        const filteredList = [];
        const categories = products.reduce((result, item) => {
            if (!filteredList.includes(item.cat_id)) {
                filteredList.push(item.cat_id);
                result.push({
                    cat_id: item.cat_id,
                    cat_name: item.cat_name,
                    cat_img: item.cat_img,
                    count: 1
                });
            } else {
                result.map((cat) => (cat.cat_id === item.cat_id) ? cat.count++ : cat.count);
            }
            return result;
        }, []);
        //console.log(categories);
        res.send(categories);
    });
});

/*app.get('/api/BookShop/GetAllCategories', (req, res) => {
    products.find({}).toArray((err, products) =>{
        if(err) return console.log(err);
        const filteredList = [];
        const categories = products.filter((item) => {
            if (filteredList.includes(item.cat_id)) {
                return false;
            } else {
                filteredList.push(item.cat_id);
                return true;
            }
        }).map(item => {
            return {
                cat_id: item.cat_id,
                cat_name: item.cat_name,
                cat_img: item.cat_img
            };
        });
        console.log(categories);
        res.send(categories);
    });
});*/

app.post('/api/BookShop/CreateNewBook', jsonParser, (req, res) => {
    if(!req.body) {
        console.log('Помилка отриманих даних');
        return res.sendStatus(400);
    }
    console.log(req.body);

    let cursor = products.find().sort({"_id": -1}).limit(1);
    cursor.toArray().then(arr => {
        let _id=1;
        if(arr.length > 0) _id = arr[0]._id+1;

        let product = req.body;
        product._id = _id;

        if (product.cat_id === 0) {
            product.cat_id = 0;
        }

        products.insertOne(product, (err, result) => {
            if(err) {
                console.log(err);
                return res.sendStatus(400);
            }
            console.log('Доданий 1 товар:', result.ops[0]);
            res.send(result.ops[0]);
        });
    });
});

app.post('/api/Account/AddUser', jsonParser, (req, res) => {
    if(!req.body) {
        console.log('Помилка отриманих даних');
        return res.sendStatus(400);
    }
    console.log(req.body);
    let user = {
        loginName: req.body.loginName,
        password: req.body.password,
        roles: req.body.roles
    };
    users.insertOne(user, (err, result) => {
        if(err) {
            console.log(err);
            if (err.code == 11000) {
                return res.send({message: 'notUnique'});
            }
            return res.sendStatus(400);
        }
        console.log('Доданий 1 user:', result.ops[0]);
        res.send(result.ops[0]);
    });
});

app.post('/api/Account/LogIn', jsonParser, (req, res) => {
    if(!req.body) {
        console.log('Помилка отриманих даних');
        return res.sendStatus(400);
    }
    console.log(req.body);
    users.findOne({loginName: req.body.loginName}, (err, user) => {
        if(err) return console.log(err);
        console.log('login', user);
        if (user && user.password === req.body.password) {
            res.send(user);
        } else {
            res.send({message: 'authFailed'});
        }
    });
});

app.get('/api/BookShop/GetAllUsers', (req, res) => {
    users.find({}).toArray((err, users) =>{
        if(err) return console.log(err);
        //console.log(users);
        res.send(users);
    });
});

app.get('/productinsert', (req, res) => {
    let cursor = products.find().sort({"_id": -1}).limit(1);
    cursor.toArray().then(arr => {
        let _id=1;
        if(arr.length > 0) _id = arr[0]._id+1;

        let product = {
            _id: 4,
            name: 'Що робити коли...',
            img: 'https://i2.rozetka.ua/goods/2969930/32598239_images_2969930215.jpg',
            cat_name: 'Книги для батьків',
            cat_id: 4,
            cat_img: 'https://blogs.ntu.edu.sg/files/2014/07/change_default_category.jpg',
            author: 'Петрановская Л.В.',
            isbn: '978-966-942-091-6',
            price: 22.99,
            old_price: 35,
            description: '«Що робити, коли ...» - повчальна книга для дітей, яка навчить взаємодіяти з незнайомими людьми, відповідати на образливі слова, запобігати виникненню небезпечних ситуацій, вести себе в людних місцях. Написана вона кваліфікованим психологом і педагогом та стане добрим другом і порадником для дитини! Ця книжка допоможе дитині не розгубитися, знайти правильний вихід з різноманітних складних ситуацій, які можуть трапитися в житті кожної людини.',
            additional: 'Психологічні поради, схеми дій, багатий ілюстративний матеріал сприятимуть легкому засвоєнню матеріалу. Можливо, ця книга не зможе зберегти дітей від усіх неприємностей, але в першу чергу вона навчить слідувати головному - не втрачати голову і бути готовими діяти!'
        };
        product._id = _id;

        products.insertOne(product, (err, result) => {
            if(err) {
                console.log(err);
                return res.sendStatus(400);
            }
            console.log('Доданий 1 товар:', result.ops[0]);
            res.send(result.ops[0]);
        });
    });
});

app.get('*.*', express.static(DIST_FOLDER+'/shop'));

// All regular routes use the Universal engine
app.get('*', (req, res) => {
  res.render('index', { req });
});

// прослушиваем прерывание работы программы (ctrl-c)
process.on('SIGINT', () => {
    clientDb.close();
    process.exit();
});



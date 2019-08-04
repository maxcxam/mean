const mongo = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017';

exports.addProduct = function() {
    mongo.connect(url,{useNewUrlParser: true}, (err, client) => {
        if (err) {
            console.error(err);
            return;
        }

        const db = client.db('data');
        const products = db.collection('products');

        class Product {
            constructor(_id, name, img, cat_name, cat_id, cat_img, author, isbn, price, old_price, description, additional) {
                this._id = _id;
                this.name = name;
                this.img = img;
                this.cat_name = cat_name;
                this.cat_id = cat_id;
                this.cat_img = cat_img;
                this.author = author;
                this.isbn = isbn;
                this.price = price;
                this.old_price = old_price;
                this.description = description;
                this.additional = additional;
            }
        }

        let cursor = products.find().sort({"_id": -1}).limit(1);
        cursor.toArray().then(arr => {
            let _id=1;
            if(arr.length > 0) {
                _id = arr[0]._id+1;
            }

            const product = new Product(
                _id,
                'Javascript для дітей - Морґан Нік',
                'https://i1.rozetka.ua/goods/4116170/vydavnytstvo_staroho_leva_9786176794790_images_4116170096.jpg',
                'Дитячі книги',
                1,
                'https://blogs.ntu.edu.sg/files/2014/07/change_default_category.jpg',
                'Nigel Rees',
                '0-553-21311-3',
                8.95,
                15,
                '«JavaScript для детей» — веселое пособие, вступление к основам программирования, с которым вы шаг за шагом овладеете работой со строками, массивами и циклами, инструментами DOM и jQuery и элементом canvas для рисования графики. Вы сможете писать и модифицировать HTML-элементы для создания динамических веб-страниц и напишите классные онлайн игры «Найди спрятанный клад», «Виселица» и «Змейка».',
                'В этой книге — множество интересных примеров и забавных иллюстраций, а задача по программированию в конце каждого раздела, вдохновят на создание собственных потрясающих программ. Сотворим что-то крутое с JavaScript!',
            );

            products.insertOne(product, (err, result) => {
                console.log('product added');
            });

            client.close();
        });
    });
}

exports.getProducts = function() {
    mongo.connect(url,{useNewUrlParser: true}, (err, client) => {
        if (err) {
            console.error(err);
            return;
        }

        const db = client.db('data');
        const products = db.collection('products');

        products.find().toArray((err, products) => {
            return products;
        });

        client.close();
    });
};

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/mongoose', {useNewUrlParser: true});
const Schema = mongoose.Schema;

const productSchema = new Schema({
    _id: {type: Number, unique: true},
    name: String,
    img: String,
    cat_name: String,
    cat_id: {type: Number, unique: true},
    cat_img: String,
    author: String,
    isbn: String,
    price: Number,
    old_price: Number,
    description: String,
    additional: String
});

const Product = mongoose.model('products', productSchema);

const product = new Product(
    {
        _id: 1,
        name: 'Javascript для дітей - Морґан Нік',
        img: 'https://i1.rozetka.ua/goods/4116170/vydavnytstvo_staroho_leva_9786176794790_images_4116170096.jpg',
        cat_name: 'Дитячі книги',
        cat_id: 1,
        cat_img: 'https://blogs.ntu.edu.sg/files/2014/07/change_default_category.jpg',
        author: 'Nigel Rees',
        isbn: '0-553-21311-3',
        price: 8.95,
        old_price: 15,
        description: '«JavaScript для детей» — веселое пособие, вступление к основам программирования, с которым вы шаг за шагом овладеете работой со строками, массивами и циклами, инструментами DOM и jQuery и элементом canvas для рисования графики. Вы сможете писать и модифицировать HTML-элементы для создания динамических веб-страниц и напишите классные онлайн игры «Найди спрятанный клад», «Виселица» и «Змейка».',
        additional: 'В этой книге — множество интересных примеров и забавных иллюстраций, а задача по программированию в конце каждого раздела, вдохновят на создание собственных потрясающих программ. Сотворим что-то крутое с JavaScript!'
    }
);

product.save().then(() => console.log(product.cat_name));

Product.find(function (err, products) {
    if (err) return console.error(err);
    console.log(products);
});
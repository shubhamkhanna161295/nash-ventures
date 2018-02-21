var express = require('express');
var app = express();
var path = require('path');
var http = require('http').Server(app);
var bodyParser = require('body-parser');
var fs = require('fs');
var download = require('image-downloader');

var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var url = 'mongodb://localhost:27017/imageScrapper';
var collection = 'images';

//var port = 

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/views/index.html');
});

var Scraper = require('images-scraper');
var google = new Scraper.Google();

app.post('/downloadImage', function (req, res) {
    google.list({
        keyword: req.body.keyword,
        num: 15,
        detail: true,
        nightmare: {
            show: false
        }
    })
        .then(function (images) {
            var async = require('async');
            var request = require('request');
            async.forEachSeries(images, function (image, cb) {
                var ext = image.url.split('.')[image.url.split('.').length - 1]
                if (ext.includes('?')) {
                    ext = ext.split('?')[0];
                }
                if (ext.includes('&')) {
                    ext = ext.split('&')[0];
                }

                ext = 'jpg';

                var fileName = new Date().getTime() + '.' + ext;
                options = {
                    url: image.url,
                    dest: __dirname + '/' + fileName
                }
                download.image(options)
                    .then(({
                        filename,
                        image
                    }) => {
                        console.log('File saved to', filename);
                        var Jimp = require("jimp");
                        var path = __dirname + '/' + fileName;
                        Jimp.read(path, function (err, lenna) {
                            if (err) {
                                console.log('err in converting file');
                                fs.unlink(__dirname + '/' + fileName);
                                cb();
                            } else {
                                lenna.resize(256, 256)
                                    .quality(60)
                                    .greyscale()
                                    .write(__dirname + '/public/images/' + fileName);
                                saveFile(req.body.keyword, path, __dirname + '/public/images/' + fileName, fileName);
                                cb();
                            }
                        });
                    }).catch((err) => {
                        console.log(err);
                    })
            }, function () {
                console.log('***** All Files Saved');
                res.json({
                    status: true
                });
            })
        }).catch(function (err) {
            console.log('err', err);
            res.json({
                status: false
            });
        });
});

function saveFile(keyword, path, newPath, fileName) {
    setTimeout(function () {
        MongoClient.connect(url, function (err, db) {
            var data = {};
            data.keyword = keyword;
            data.filePath = newPath;
            data.sortPath = '../images/' + fileName;
            data.fileName = fileName;
            data.insertedAt = new Date().getTime();
            db.collection(collection).insertOne(data, function (err, res) {
                console.log("file inserted to db " + fileName);
                deleteLocalFile(path);
            });
        })
    }, 2000);
}

function deleteLocalFile(file) {
    setTimeout(function () {
        fs.unlink(file, function () {
            console.log('deleted **** ' + file);
        });
    }, 5000);
}

app.post('/getData', function (req, res) {
    MongoClient.connect(url, function (err, db) {
        db.collection(collection).find({}).sort({
            'insertedAt': -1
        }).toArray(function (err, item) {
            res.json(item);
        })
    })
})


http.listen(3000, function () {
    console.log("listening on 3000");
});
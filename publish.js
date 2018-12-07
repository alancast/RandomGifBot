var zipFolder = require('zip-folder');
var path = require('path');
var fs = require('fs');
var request = require('request');
const ENV_FILE = path.join(__dirname, '.env');
require('dotenv').config({ path: ENV_FILE });

var rootFolder = path.resolve('.');
var zipPath = path.resolve(rootFolder, '../GifBot.zip');
var kuduApi = 'https://GifBot.scm.azurewebsites.net/api/zip/site/wwwroot';
var userName = '$GifBot';
var password = process.env.kuduPassword;

function uploadZip(callback) {
    fs.createReadStream(zipPath)
        .pipe(
            request.put(kuduApi, {
                auth: {
                    username: userName,
                    password: password,
                    sendImmediately: true
                },
                headers: {
                    'Content-Type': 'application/zip'
                }
            })
        )
        .on('response', function(resp) {
            if (resp.statusCode >= 200 && resp.statusCode < 300) {
                fs.unlink(zipPath);
                callback(null);
            } else if (resp.statusCode >= 400) {
                callback(resp);
            }
        })
        .on('error', function(err) {
            callback(err);
        });
}

function publish(callback) {
    zipFolder(rootFolder, zipPath, function(err) {
        if (!err) {
            uploadZip(callback);
        } else {
            callback(err);
        }
    });
}

publish(function(err) {
    if (!err) {
        console.log('GifBot publish');
    } else {
        console.error('failed to publish GifBot', err);
    }
});

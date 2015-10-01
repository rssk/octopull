#! /usr/bin/env node
'use strict';
var argv = require('yargs').argv;
var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));
var _ = require('lodash');
var git = require('nodegit');

var baseDir = process.cwd();
var depth = 2;

function getDirectories(directory, depth) {
    depth -= 1;
    if (depth === -1) {
        return Promise.resolve([]);
    }

    return fs.readdirAsync(directory)
    .then(function(files) {
        var dirList = [];
        var promises = [];
        _.each(files, function(file) {
            if (file[0] !== '.') {
                var filePath = directory + '/' + file;
                var dirFilter = function(file, filePath) {
                    return fs.statAsync(filePath)
                    .then(function(stat) {
                        if (stat.isDirectory()) {
                            dirList.push(filePath);
                            return getDirectories(filePath, depth)
                            .then(function(recurseDirs) {
                                dirList = dirList.concat(recurseDirs);
                            });
                        }
                    });
                };

                promises.push(dirFilter(file, filePath));
            }
        });

        return Promise.all(promises)
        .then(function() {
            return dirList;
        });
    });
}

var mapRepositories = function(directory, depth) {
    var repos = {};
    var promises = [];
    repos.default = [];
    return getDirectories(directory, depth)
    .then(function(directories) {
        _.each(directories, function(directory) {
            promises.push(git.Repository.open(directory).then(function() {
                repos.default.push(directory);
            }));
        });

        return Promise.settle(promises)
        .then(function() {
            return repos;
        });
    });
};

mapRepositories(baseDir, depth)
.then(function(repos) {
    var repoMap = fs.createWriteStream('.repoMap');
    repoMap.once('open', function() {
        repoMap.write(JSON.stringify(repos, null, 2));
        repoMap.end();
    });
});

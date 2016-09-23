var glob = require('glob'),
    async = require('async'),
    pathManager = require('path'),
    fs = require('fs'),
    ALIAS_REGEX = /((\s*)@alias(\s*))/g,
    Promise = require('./promise.js');

module.exports = function (config) {
    var promise = new Promise(),
        finishedTargets = 0,
        aliases = {};

    config.targets.forEach(function (filesToBuildAliases) {
        glob(filesToBuildAliases, { ignore: config.ignore }, function (err, files) {
            fillAliases(files, aliases).then(function (aliases) {
                finishedTargets++;
                if (finishedTargets === config.targets.length) {
                    promise.resolve(aliases);
                }
            });
        });
    });

    return promise;
};

function fillAliases(files, aliases) {
    var self = this,
        promise = new Promise();
    async.map(files, function (filePath, done) {
        var promise = new Promise();
        var reader = fs.createReadStream(filePath, { encoding: 'utf8' });
        reader.on('data', function (chunk) {
            var aliasInfo = getAliasOf(chunk, filePath);
            if (aliasInfo) {
                aliases[aliasInfo.alias] = aliasInfo.path;
            }
            reader.close();
            done();
        });
    }, function () {
        promise.resolve(aliases);
    });

    return promise;
}

function getAliasOf(chunk, filePath) {
    var aliasStartPosition = chunk.search(ALIAS_REGEX);
    if (aliasStartPosition !== -1) {
        var aliasLine = chunk.substring(aliasStartPosition, chunk.indexOf('\n')),
            alias = aliasLine.split('"')[1];
        return { alias: alias, path: pathManager.resolve(filePath, '.') };
    }
}
var arango, db, indices = {};

try {
    arango = require('arango')
} catch (e) {
    arango = require('..')
}

function check(done, f) {
    try {
        f()
        done()
    } catch (e) {
        console.log(e);
        done(e)
    }
}

function getIndexByType(collection, type) {
    var result;
    indices[collection].forEach(function(index) {
        if (index.type === type) {
            result = index.id;
        }
    })
    return result;
}


describe("simpleWithDefaultCollection", function() {


    before(function(done) {
        this.timeout(20000);
        db = arango.Connection("http://127.0.0.1:8529/_system");
        db.database.delete("newDatabase", function(err, ret) {
            db.database.create("newDatabase", function(err, ret) {
                db = arango.Connection({
                    _name: "newDatabase",
                    _server: {
                        hostname: "localhost"
                    }
                });
                db.collection.create("GeoCollection", function(err, ret, message) {
                    var data = [{
                        "_key": "Ort1",
                        "longitude": 20.00,
                        latitude: 22.00,
                        location: [20.00, 12.00]
                    }, {
                        "_key": "Ort2",
                        "longitude": 21.00,
                        latitude: 19.00,
                        location: [28.00, 12.00]
                    }, {
                        "_key": "Ort3",
                        "longitude": 22.00,
                        latitude: 15.00,
                        location: [16.00, 18.00]
                    }, {
                        "_key": "Ort4",
                        "longitude": 23.00,
                        latitude: 24.00,
                        location: [21.00, 19.00]
                    }];
                    db.import.importJSONData("GeoCollection", data, function(err, ret, message) {
                        db.index.createGeoSpatialIndex("GeoCollection", ["latitude", "longitude"], {
                            "constraint": true,
                            "ignoreNull": true
                        }, function(err, ret, message) {
                            db.index.createGeoSpatialIndex("GeoCollection", ["location"], {
                                    "geoJson": true
                                },
                                function(err, ret, message) {
                                    db.collection.create("SkiptListcollection", function(err, ret, message) {
                                        var data = [{
                                            "_key": "Anton",
                                            "age": 23,
                                            "income": 2000,
                                            "birthplace": "munich"
                                        }, {
                                            "_key": "Bert",
                                            "age": 22,
                                            "income": 2100,
                                            "birthplace": "munich-passing"
                                        }, {
                                            "_key": "Bernd",
                                            "age": 24,
                                            "income": 2100,
                                            "birthplace": "berlin"
                                        }, {
                                            "_key": "Cindy",
                                            "age": 31,
                                            "income": 2000,
                                            "birthplace": "cologne"
                                        }, {
                                            "_key": "Cinderella",
                                            "age": 30,
                                            "income": 2000,
                                            "birthplace": "munich"
                                        }, {
                                            "_key": "Emil",
                                            "age": 29,
                                            "income": 2100,
                                            "birthplace": "munich"
                                        }, {
                                            "_key": "Kurt",
                                            "age": 29,
                                            "income": 2900,
                                            "birthplace": "cologne"
                                        }];
                                        db.import.importJSONData("SkiptListcollection", data, function(err, ret, message) {
                                            db.index.createSkipListIndex("SkiptListcollection", ["age"], false, function(err, ret, message) {
                                                db.index.createFulltextIndex("SkiptListcollection", ["birthplace"], function(err, ret, message) {
                                                    db = arango.Connection({
                                                        _name: "newDatabase",
                                                        _server: {
                                                            hostname: "localhost"
                                                        },
                                                        _collection: "SkiptListcollection"
                                                    });
                                                    done();
                                                });
                                            });
                                        });
                                    });
                                });

                        });
                    });
                });
            });
        });

    })

    describe("simple Queries", function() {

        it('list all documents', function(done) {
            this.timeout(30000);
            db.simple.skip(1).limit(2).list(function(err, ret, message) {
                check(done, function() {
                    ret.error.should.equal(false);
                    ret.result.length.should.equal(2);
                    message.status.should.equal(201);
                });
            });
        })
        it('list all documents, we tests that passing skip and limit in the function beats the global setting', function(done) {
            var opt = {
                "skip": 0,
                "limit": 4
            }
            db.simple.list(opt, function(err, ret, message) {
                check(done, function() {
                    ret.error.should.equal(false);
                    ret.result.length.should.equal(4);
                    message.status.should.equal(201);
                });
            });
        })

        it('get random document', function(done) {
            db.simple.any(function(err, ret, message) {
                check(done, function() {
                    ret.should.have.property("document");
                    ret.error.should.equal(false);
                    message.status.should.equal(200);
                });
            });
        })

        it('list all documents matching an example, we tests that passing skip and limit in the function beats the global setting', function(done) {
            var opt = {
                "skip": 0,
                "limit": 4
            }
            db.simple.skip(1).limit(2).example({
                "income": 2100
            }, opt, function(err, ret, message) {
                check(done, function() {
                    ret.error.should.equal(false);
                    ret.result.length.should.equal(3);
                    message.status.should.equal(201);
                });
            });
        })
        it('list all documents matching an example, without options', function(done) {
            db.simple.skip(1).limit(2).example({
                "income": 2100
            }, function(err, ret, message) {
                check(done, function() {
                    ret.error.should.equal(false);
                    ret.result.length.should.equal(2);
                    message.status.should.equal(201);
                });
            });
        })
        it('remove all documents matching an example.', function(done) {
            var opt = {
                "waitForSync": true,
                "limit": 1
            }
            db.simple.removeByExample({
                "income": 2900
            }, opt, function(err, ret, message) {
                check(done, function() {
                    ret.error.should.equal(false);
                    ret.deleted.should.equal(1);
                    message.status.should.equal(200);
                });
            });
        })
        it('remove all documents matching an example.', function(done) {
            db.simple.removeByExample({
                "income": 2900
            }, function(err, ret, message) {
                check(done, function() {
                    ret.error.should.equal(false);
                    ret.deleted.should.equal(0);
                    message.status.should.equal(200);
                });
            });
        })
        it('replace all documents matching an example.', function(done) {
            var opt = {
                "waitForSync": true,
                "limit": 1
            }
            db.simple.replaceByExample({
                "age": 30
            }, {
                "age": 31,
                "married": true
            }, opt, function(err, ret, message) {
                check(done, function() {
                    ret.error.should.equal(false);
                    ret.replaced.should.equal(1);
                    message.status.should.equal(200);
                });
            });
        })
        it('replace all documents matching an example, without options', function(done) {
            db.simple.replaceByExample({
                "age": 30
            }, {
                "age": 31,
                "married": true
            }, function(err, ret, message) {
                check(done, function() {
                    ret.error.should.equal(false);
                    ret.replaced.should.equal(0);
                    message.status.should.equal(200);
                });
            });
        })

        it('update all documents matching an example.', function(done) {
            var opt = {
                "waitForSync": true
            }
            db.simple.updateByExample({
                "age": 31
            }, {
                "married": false
            }, opt, function(err, ret, message) {
                check(done, function() {
                    ret.error.should.equal(false);
                    ret.updated.should.equal(2);
                    message.status.should.equal(200);
                });
            });
        })
        it('update all documents matching an example, without options', function(done) {
            this.timeout(30000);
            db.simple.updateByExample({
                "age": 31
            }, {
                "married": false
            }, function(err, ret, message) {
                check(done, function() {
                    ret.error.should.equal(false);
                    ret.updated.should.equal(2);
                    message.status.should.equal(200);
                });
            });
        })


        it('return the first documents matching a given example.', function(done) {
            var opt = {
                "skip": 0,
                "limit": 4
            }
            db.simple.firstByExample({
                "income": 2100
            }, opt, function(err, ret, message) {
                check(done, function() {
                    ret.error.should.equal(false);
                    ret.should.have.property("document");
                    message.status.should.equal(200);
                });
            });
        })
        it('return the first documents matching a given example, without options', function(done) {
            db.simple.firstByExample({
                "income": 2100
            }, function(err, ret, message) {
                check(done, function() {
                    ret.error.should.equal(false);
                    ret.should.have.property("document");
                    message.status.should.equal(200);
                });
            });
        })


        it('return the first documents from the collection', function(done) {
            db.simple.first(3, function(err, ret, message) {
                check(done, function() {
                    ret.error.should.equal(false);
                    ret.result.length.should.equal(3);
                    message.status.should.equal(200);
                });
            });
        })
        it('return the last documents from the collection', function(done) {
            db.simple.last(3, function(err, ret, message) {
                check(done, function() {
                    ret.error.should.equal(false);
                    ret.result.length.should.equal(3);
                    message.status.should.equal(200);
                });
            });
        })
        it('return the first documents from the collection, without count', function(done) {
            db.simple.first(function(err, ret, message) {
                check(done, function() {
                    ret.error.should.equal(false);
                    message.status.should.equal(200);
                });
            });
        })
        it('return the last documents from the collection, without count', function(done) {
            db.simple.last(function(err, ret, message) {
                check(done, function() {
                    ret.error.should.equal(false);
                    message.status.should.equal(200);
                });
            });
        })


        it('use the skip list index for a range query', function(done) {
            db.simple.range("SkiptListcollection", "age", 23, 29, {
                closed: true
            }, function(err, ret, message) {
                check(done, function() {
                    ret.error.should.equal(false);
                    ret.result.length.should.equal(2);
                    message.status.should.equal(201);
                });
            });
        })
        it('use the skip list index for an open range query', function(done) {
            db.simple.range("SkiptListcollection", "age", 23, 29, function(err, ret, message) {
                check(done, function() {
                    ret.error.should.equal(false);
                    ret.result.length.should.equal(1);
                    message.status.should.equal(201);
                });
            });
        })

        it('use the skip list index for a range query', function(done) {
            db.simple.range("age", 23, 29, {
                closed: true
            }, function(err, ret, message) {
                check(done, function() {
                    ret.error.should.equal(false);
                    ret.result.length.should.equal(2);
                    message.status.should.equal(201);
                });
            });
        })
        it('use the skip list index for an open range query, without options', function(done) {
            db.simple.range("age", 23, 29, function(err, ret, message) {
                check(done, function() {
                    ret.error.should.equal(false);
                    ret.result.length.should.equal(1);
                    message.status.should.equal(201);
                });
            });
        })


        it('list all we created so far', function(done) {
            db.index.list(function(err, ret, message) {
                check(done, function() {
                    indices.SkiptListcollection = ret.indexes;
                    ret.error.should.equal(false);
                    message.status.should.equal(200);
                });
            });
        })
        it('use the fulltext index for a fulltext query', function(done) {
            db.simple.limit(4).skip(0).fulltext("birthplace", "munich", function(err, ret, message) {
                check(done, function() {
                    ret.error.should.equal(false);
                    ret.result.length.should.equal(3);
                    message.status.should.equal(201);
                });
            });
        })

        it('use the fulltext index for a fulltext query with options', function(done) {
            db.simple.fulltext("birthplace", "munich", {
                "limit": 2
            }, function(err, ret, message) {
                check(done, function() {
                    ret.error.should.equal(false);
                    ret.result.length.should.equal(2);
                    message.status.should.equal(201);
                });
            });
        })


        it('list all we created so far', function(done) {
            db = arango.Connection({
                _name: "newDatabase",
                _server: {
                    hostname: "localhost"
                },
                _collection: "GeoCollection"
            });
            db.index.list(function(err, ret, message) {
                check(done, function() {
                    indices.GeoCollection = ret.indexes;
                    ret.error.should.equal(false);
                    message.status.should.equal(200);
                });
            });
        })

        it('use the geo index for a near query on location', function(done) {
            var index = getIndexByType("GeoCollection", "geo1");
            db.simple.skip(undefined).limit(undefined).near(15, 15, {
                geo: index,
                distance: "distance"
            }, function(err, ret, message) {
                check(done, function() {
                    ret.error.should.equal(false);
                    ret.result.length.should.equal(4);
                    message.status.should.equal(201);
                });
            });
        })
        it('use the geo index for a near query on longitude and latitude', function(done) {
            var index = getIndexByType("GeoCollection", "geo2");
            db.simple.skip(undefined).limit(undefined).near(15, 15, {
                geo: index,
                distance: "distance"
            }, function(err, ret, message) {
                check(done, function() {
                    ret.error.should.equal(false);
                    ret.result.length.should.equal(4);
                    message.status.should.equal(201);
                });
            });
        })
        it('use the geo index for a within query on location', function(done) {
            var index = getIndexByType("GeoCollection", "geo1");
            db.simple.within(15, 15, 787593, {
                geo: index,
                distance: "distance"
            }, function(err, ret, message) {
                check(done, function() {
                    ret.error.should.equal(false);
                    ret.result.length.should.equal(3);
                    message.status.should.equal(201);
                });
            });
        })
        it('use the geo index for a within query on longitude and latitude', function(done) {
            var index = getIndexByType("GeoCollection", "geo2");
            db.simple.within(15, 15, 787593, {
                geo: index,
                distance: "distance"
            }, function(err, ret, message) {
                check(done, function() {
                    ret.error.should.equal(false);
                    ret.result.length.should.equal(2);
                    message.status.should.equal(201);
                });
            });
        })

        it('use the geo index for a within query on location', function(done) {
            var index = getIndexByType("GeoCollection", "geo1");
            db.simple.within(15, 15, 787593, {
                geo: index,
                distance: "distance"
            }, function(err, ret, message) {
                check(done, function() {
                    ret.error.should.equal(false);
                    ret.result.length.should.equal(3);
                    message.status.should.equal(201);
                });
            });
        })


        it('delete an index ', function(done) {
            db.index.delete(getIndexByType("GeoCollection", "geo1"), function(err, ret, message) {
                check(done, function() {
                    ret.error.should.equal(false);
                    message.status.should.equal(200);
                });
            });
        })

        it('use the geo index for a near query on longitude and latitude, without options', function(done) {
            db.simple.skip(undefined).limit(undefined).near(15, 15, function(err, ret, message) {
                check(done, function() {
                    ret.error.should.equal(false);
                    ret.result.length.should.equal(4);
                    message.status.should.equal(201);
                });
            });
        })
        it('use the geo index for a within query on longitude and latitude, without options', function(done) {
            db.simple.within(15, 15, 787593, function(err, ret, message) {
                check(done, function() {
                    ret.error.should.equal(false);
                    ret.result.length.should.equal(2);
                    message.status.should.equal(201);
                });
            });
        })


    })
})

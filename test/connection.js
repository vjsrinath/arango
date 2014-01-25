var arango;

try{ arango = require('arango') } catch (e){ arango = require('..') }

describe("Connection()",function(){
    it('should have a Connection method',function(){
        arango.should.have.ownProperty('Connection');
    })

    it('should have default connection to http://127.0.0.1:8529',function(){
        var db = new arango.Connection;

        db.should.have.property('_server');

        db._server.should.eql({protocol:"http",hostname:"127.0.0.1",port:8529});
    })

    it('should be able to parse a Connection string',function(){
        var db = new arango.Connection("https://user:pass@hostname:8529/database");

        var headers = {authorization:'Basic ' + arango.base64.encode(db._server.username + ':' + db._server.password) };

        db._server.should.eql({
            protocol:'https',
            username:'user',
            password:'pass',
            hostname:'hostname',
            port:8529,
            headers: headers
        })

        db._name.should.eql('database');

        db._collection.should.eql('');
    })

    it('should be able to parse a Connection string with database and collection name',function(){
        var db = new arango.Connection("https://user:pass@hostname:8529/database:collection");

        var headers = {authorization:'Basic ' + arango.base64.encode(db._server.username + ':' + db._server.password) };

        db._server.should.eql({
            protocol:'https',
            username:'user',
            password:'pass',
            hostname:'hostname',
            port:8529,
            headers: headers
        })

        db._name.should.eql('database');

        db._collection.should.eql('collection');
    })

    it('should be able to parse a Connection string with only a collection name',function(){
        var db = new arango.Connection("https://user:pass@hostname:8529/:collection");

        var headers = {authorization:'Basic ' + arango.base64.encode(db._server.username + ':' + db._server.password) };

        db._server.should.eql({
            protocol:'https',
            username:'user',
            password:'pass',
            hostname:'hostname',
            port:8529,
            headers: headers
        })

        db._collection.should.eql('collection');
    })

    it('should be able to parse a Connection object',function(){
        db = new arango.Connection({_name:"database",_collection:"collection",_server:{hostname:"test.host"}});
        db._server.should.eql({
            protocol:'http',
            hostname:'test.host',
            port:8529,
        })
        db._name.should.eql("database");
        db._collection.should.eql("collection");
    })

    it('should be able to parse a Connection string with object',function(){
        db = new arango.Connection("https://username:password@test.com",
            {_name:"database",_collection:"collection"}
            );

        var headers = {authorization:'Basic ' + arango.base64.encode('username' + ':' + 'password') };

        db._server.should.eql({
            protocol:'https',
            hostname:'test.com',
            username:'username',
            password:'password',
            headers: headers,
            port:8529,
        })
        db._name.should.eql("database");
        db._collection.should.eql("collection");
    })

    it('should be able to parse a Connection string with object containing username password',function(){
        db = new arango.Connection("https://test.com",
            {_server:{username:"username", password:"password"}}
            );

        var headers = {authorization:'Basic ' + arango.base64.encode('username' + ':' + 'password') };

        db._server.should.eql({
            protocol:'https',
            hostname:'test.com',
            username:'username',
            password:'password',
            headers: headers,
            port:8529,
        })
    })
})

describe('use()',function(){
    it('should have a use method',function(){
        var db = new arango.Connection;

        db.use.should.be.a.Function;
    })  

    it('should be able to switch collection',function(){
        var db1 = new arango.Connection;

        var db2 = db1.use(":collection");

        db1._collection.should.eql('');
        db2._collection.should.eql('collection');
    })

    it('should be able to switch database',function(){
        var db1 = new arango.Connection('/db1');

        var db2 = db1.use('/db2');

        db1._name.should.eql('db1');
        db2._name.should.eql('db2');
    })

    it('should be able to switch database & collection',function(){
        var db1 = new arango.Connection('/db1:col1');

        var db2 = db1.use('/db2:col2');

        db1._name.should.eql('db1');
        db1._collection.should.eql('col1');
        db2._name.should.eql('db2');
        db2._collection.should.eql('col2');
    })

    it('should be able to switch host',function(){
        var db1 = new arango.Connection;

        var db2 = db1.use('another.server.test');

        db1._server.should.eql({protocol:"http",hostname:"127.0.0.1",port:8529});
        db2._server.should.eql({protocol:"http",hostname:"another.server.test",port:8529});
    })

    it('should be able to switch host, protocol & port',function(){
        var db1 = new arango.Connection;

        var db2 = db1.use('https://another.server.test:1234');

        db1._server.should.eql({protocol:"http",hostname:"127.0.0.1",port:8529});
        db2._server.should.eql({protocol:"https",hostname:"another.server.test",port:1234});
    })

    it('should be able to inherit settings',function(){
        var db1 = new arango.Connection('/db1:col1');
        var db2 = db1.use(':col2');
        
        db1._name.should.eql('db1');
        db1._collection.should.eql('col1');
        db2._name.should.eql('db1');
        db2._collection.should.eql('col2'); 
    })
})

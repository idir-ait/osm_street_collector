https://github.com/osmcode/node-osmium/blob/master/demo/spatialite-output/index.js

var sqlite3 = require('spatialite');

var db = new sqlite3.Database('dbTest.db');
db.serialize();
db.spatialite();
db.run("PRAGMA synchronous = OFF;"); // otherwise it is very slow


db.run("SELECT InitSpatialMetaData('WGS84');");

db.run("CREATE TABLE points (osm_id INT, name TEXT);");

db.run("SELECT AddGeometryColumn('points', 'geom', 4326, 'POINT', 2);");


for (var i = 0; i < 1000000 ; i++) 
{
	db.run("INSERT INTO points (osm_id, name, geom) VALUES ("+i+", 'second point',GeomFromText('POINT(2.02 3.03)', 4326));");
	console.log(i);

}

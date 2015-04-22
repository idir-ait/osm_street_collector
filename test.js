//Code d'extraction des routes. 
//https://www.npmjs.com/package/openstreetmap-stream
var i = 0;
var osm = require('openstreetmap-stream'),
    through = require('through2');
 
osm.createReadStream( 'ile-de-france-latest.osm.pbf' )
  .pipe( through.obj( function( data, enc, next ){
	
var typeOfRoads = ["motorway", "trunk", "primary", "secondary", "tertiary", "unclassified", "residential", "service"];
/*
	if(data.type = "way" && typeof(data.tags.highway) != "undefined" && typeof(data.tags.name)!= "undefined" && typeOfRoads.indexOf(data.tags.highway)!= -1)
	{	
    		console.log("Nom de rue = "+ data.tags.name );
		console.log("type de rue = "+ data.tags.highway);
	}
    	next();
*/
if(data.type = "relation" )
	{	
		if(typeof(data.tags.type) != "undefined" && data.tags.type == "associatedStreet")
		{
		    		console.log(data);
				i++;
				console.log(i);
		}
	}
    	next();

  }));



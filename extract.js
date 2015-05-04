


var osmium = require('osmium');

var reader = new osmium.Reader("franche-comte-latest.osm.pbf", { node:false, relation : true, way:false});
//var reader = new osmium.Reader("ile-de-france-latest.osm.pbf", { relation : true});
var handler = new osmium.Handler();
var location_handler = new osmium.LocationHandler();

var relations = {};
var roadsIDF = [];
var typeOfRoads = ["motorway", "trunk", "primary", "secondary", "tertiary", "unclassified", "residential", "service"];
var ways = [];

/*
handler.on('way', function(way) 
	{


		//console.log(way.tags('highway'));
		if( typeOfRoads.indexOf(way.tags('highway')) != -1)
		{
			
			//console.log(way.tags('name'));
			//console.log(way.tags());
			//console.log(way);


			console.log(way.geojson());

			ways.push(ways);    		

		}
	});
//*/
//*
handler.on('relation', function(relation) 
	{


		if(relation.tags('type') =='associatedStreet' )
		{
			var members = relation.members();
			console.log(" # members "+relation.members_count);
			console.log(relation.tags());
			for(var i = 0; i < relation.members_count; i++) {
				var member = relation.members(i);
				console.log(member);
			}

			//console.log(relation.tags());

			//roadsIDF.push(relation);
			++relations;
			

		}
	});
//*/

/*
handler.on('node', function(node) 
	{


		
			console.log(node.geojson());


   		

		
	});
//*/

 osmium.apply(reader, location_handler,handler);
//osmium.apply(reader, handler);

console.log(relations);

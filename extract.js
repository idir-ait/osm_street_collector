


var osmium = require('osmium');

var reader = new osmium.Reader("ile-de-france-latest.osm.pbf", { relation : true});
var handler = new osmium.Handler();

var relations = 0;
var roadsIDF = [];

handler.on('relation', function(relation) 
	{

		if(relation.tags('associatedStreet') != "undefined" )
		{
		
			console.log(relation.tags("name"));

			roadsIDF.push(relation);
			++relations;
		}
	});

osmium.apply(reader, handler);

console.log(relations);

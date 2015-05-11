
var osmium = require('osmium');

var reader = new osmium.Reader("franche-comte-latest.osm.pbf", { node:true, relation : true, way:true});
//var reader = new osmium.Reader("ile-de-france-latest.osm.pbf", { node:true, relation : false, way:true});
var handler = new osmium.Handler();
var location_handler = new osmium.LocationHandler();



var typeOfRoads = ["motorway", "trunk", "primary", "secondary", "tertiary", "unclassified", "residential", "service"];

//Utilisation module hashes -> https://www.npmjs.com/package/hashes
var hashes = require('hashes');
var hashTableOfNodes = new hashes.HashTable();			//Hashtable qui va contenire les nodes des ways afin de retrouver les nodes d'intersections.
var hashTableOfWays = new hashes.HashTable();			//Hashtable qui va contenire les Ways.
var hashTableOfRelation = new hashes.HashTable();		//Hashtable qui va contenire les Relations.



//Utilisation du module spatialite Utilisation https://github.com/osmcode/node-osmium/blob/master/demo/spatialite-output/index.js

var sqlite3 = require('spatialite');

var db = new sqlite3.Database('dbTest.db');
db.serialize();
db.spatialite();
//db.run("PRAGMA synchronous = OFF;"); // otherwise it is very slow



/* Traitement des Ways
handler.on('way', function(way) 
	{

		//*
		
		if( typeOfRoads.indexOf(way.tags('highway')) != -1)
		{
			
			//Structure d'un way
			var tmpWay = 
			{

    			id_osm : 		way.id,						//Identifiant OSM.
    			name :   		way.tags('name'),			//Nom du Way.
    			tab_ids_nodes : way.node_refs(),			//Identifiants des nodes qui compose le Way.
    			coordinates : 	way.geojson().coordinates,	//Les les coordonnées des nodes.
    			intersections: [ ]							//Les ?????

			};
			
			
			hashTableOfWays.add(tmpWay.id_osm, tmpWay);
			

			//Insertion des nodes dans hashTableOfNodes
			var id_osm = tmpWay.id_osm;
			var nodes  = tmpWay.tab_ids_nodes;
			for(var i = 0; i < nodes.length; i++)
			{

				//Si le node exist déja ajouter le nouveau way.
				if(hashTableOfNodes.contains(nodes[i]))
				{
					var value = hashTableOfNodes.get(nodes[i]).value;
					if(value.lastIndexOf(id_osm) == -1)
					{
						value.push(id_osm);
						hashTableOfNodes.add(nodes[i], value);
					}
				}
				else
				{
					var value = [id_osm];
					hashTableOfNodes.add(nodes[i], value);
				}
			}


		}
		
	});

//*/

handler.on('relation', function(relation) 
{
		
	if(relation.tags('type') =='associatedStreet' )
	{
		var tmpWay = [];
		var members = relation.members();
		console.log(" # members "+relation.members_count);

		console.log(relation.tags());
		for(var i = 0; i < relation.members_count; i++) 
		{
			if(relation.members(i).type == "w")
			{
				tmpWay.push(relation.members(i).ref);
			}
		}

		hashTableOfRelations.add(relation.id, tmpWay);
			
	}

		
});


/*
handler.on('node', function(node) 
	{

   		console.log(node.wkb());
		
	});
//*/

osmium.apply(reader, location_handler,handler);
//osmium.apply(reader, handler);

/*
//Suppression des node contenant qu'un Way. 
var tmpArray = hashTableOfNodes.getKeyValuePairs(); 
for (var i = 0; i < tmpArray.length; i++) 
{
	 
	 if(tmpArray[i].value.length  <= 1)
	 {
	 	hashTableOfNodes.remove(tmpArray[i].key)
	 }
	 
}
//*/

/*
//Affichage des nodes.
var tmpArray = hashTableOfNodes.getKeyValuePairs(); 
for (var i = 0; i < tmpArray.length; i++) 
{

	console.log(tmpArray[i].key);
	console.log(tmpArray[i].value);
 
}
*/

//addIntersections (hashTableOfNodes, hashTableOfWays);


//console.log(hashTableOfWays.count());

//saveIntersectionPoints(hashTableOfWays);

/*
//Affichage des ways.
var tmpArray = hashTableOfWays.getKeyValuePairs(); 
for (var i = 0; i < tmpArray.length; i++) 
{

	console.log(tmpArray[i].key);
	console.log(tmpArray[i].value);
 
}
*/
//console.log(hashTableOfWays.count());

 //db.close();
 //console.log("fin");


//Function qui va ajouter les nodes d'intersection a la structure des Ways.
//Les deux arrgumment nodes et way sont de type HashTable. 
//ATTETION : Cette fonction est trop gourmande en resource a revoire dé que possible. 
/*
function addIntersections (hashNodes, ways)
{

	
	var nodes = hashNodes.getKeyValuePairs();	//Convertion en array.

	for (var n = 0; n < nodes.length; n++) 
	{
		var node = nodes[n].key;			//Id du node d'intersection.
		var ids_Ways = nodes[n].value;		//Id des ways qui s'intersectes au niveau de node.

		//console.log(ids_Ways);
	 	
	 	//Parcourir chaque way pour ajouter les intersection.
	 	for (var i = 0; i < ids_Ways.length; i++) 
	 	{
	 		var currentWay = ways.get(ids_Ways[i]).value; 

	 		for (var j = 0; j < ids_Ways.length; j++) 
	 		{
	 			var targetWay = ways.get(ids_Ways[j]).value;
	 			

	 			if(currentWay.id_osm != targetWay.id_osm) //Le way actuel doit étre différent que le way cible.
	 			{
	 				var intersection = [];

	 				intersection.push(targetWay.id_osm);
	 				
	 				var tmpTab = currentWay.tab_ids_nodes;
	 				var index = tmpTab.indexOf(node);
	 				intersection.push(index);
	 				
	 				tmpTab = targetWay.tab_ids_nodes;
	 				

	 				index = tmpTab.indexOf(node);
	 				intersection.push(index);

	 				currentWay.intersections.push(intersection);

	 			}

	 		}

	 	};
	}; 
}
*/

/*
function saveIntersectionPoints(hashWays)
{

	db.run("SELECT InitSpatialMetaData('WGS84');");

	db.run("CREATE TABLE points (osm_id INT);");
	db.run("SELECT AddGeometryColumn('points', 'geom', 4326, 'POINT', 2);");

	var ways = hashWays.getKeyValuePairs();	//Convertion en array.

	var cpt =0;
	for (var i = 0; i < ways.length; i++) 
	{
		var rqt = "INSERT INTO points (osm_id, geom) VALUES"; 
		var way = ways[i].value;
		for (var j = 0; j < way.intersections.length; j++) 
		{
			var indexNode = way.intersections[j][1];
			var id = way.tab_ids_nodes[indexNode];
			var x = way.coordinates[indexNode][0];
			var y =way.coordinates[indexNode][1];
			
			
			rqt = rqt + "("+id+",GeomFromText('POINT("+x+" "+y+")', 4326)),";

			//db.run("INSERT INTO points (osm_id, geom) VALUES ("+id+",GeomFromText('POINT("+x+" "+y+")', 4326));");
			
			rqt = rqt + "("+1+",GeomFromText('POINT("+5+" "+2+")', 4326));";
			console.log(cpt);
			cpt++;
		};

		db.run(rqt);

	};	

}
*/



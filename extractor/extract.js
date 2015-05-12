
var osmium = require('osmium');

//var reader = new osmium.Reader("../data/franche-comte-latest.osm.pbf", { node:true, relation : true, way:true});
var reader = new osmium.Reader("../data/ile-de-france-latest.osm.pbf", { node:true, relation : false, way:true});
var handler = new osmium.Handler();
var location_handler = new osmium.LocationHandler();



var typeOfRoads = ["motorway", "trunk", "primary", "secondary", "tertiary", "unclassified", "residential", "service"];

//Utilisation module hashes -> https://www.npmjs.com/package/hashes
var hashes = require('hashes');
var hashTableOfNodes = new hashes.HashTable();			//Hashtable qui va contenire les nodes des ways afin de retrouver les nodes d'intersections.
var hashTableOfWays = new hashes.HashTable();			//Hashtable qui va contenire les Ways.
var hashTableOfRelations = new hashes.HashTable();		//Hashtable qui va contenire les Relations.


/* A Modifier par une connection a postgreSQL
//Utilisation du module spatialite Utilisation https://github.com/osmcode/node-osmium/blob/master/demo/spatialite-output/index.js

var sqlite3 = require('spatialite');

var db = new sqlite3.Database('dbTest.db');
db.serialize();
db.spatialite();
//db.run("PRAGMA synchronous = OFF;"); // otherwise it is very slow
//*/

var nbrwaysInRelations = 0;


//* Traitement des Ways
handler.on('way', function(way) 
	{

		
		
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


handler.on('relation', function(relation) 
{
		
	if(relation.tags('type') =='associatedStreet' )
	{
		var tmpWay = [];
		var members = relation.members();
		
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


/* Pas Besion
handler.on('node', function(node) 
	{
   		console.log(node.wkb());
		
	});
//*/


//Scan du fichier PBF.
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


//saveIntersectionPoints(hashTableOfWays);

/*
//Affichage des ways.
var tmpArray = hashTableOfWays.getKeyValuePairs(); 
for (var i = 0; i < tmpArray.length; i++) 
{
	console.log(tmpArray[i].key);
	console.log(tmpArray[i].value);
}
//*/


var listeGeoJSON = getGeoJsonListOfRoads(hashTableOfWays, hashTableOfRelations);

//Affichage des GeoJSON
for (var i = 0; i < listeGeoJSON.length; i++) {

	//if(listeGeoJSON[i].name == "Avenue de Paris")
	console.log(JSON.stringify(listeGeoJSON[i]));
};

console.log("fin");


//Function qui va ajouter les nodes d'intersection a la structure des Ways.
//Les deux arrgumment nodes et way sont de type HashTable. 
//ATTETION : Cette fonction est trop gourmande en resource a revoire dé que possible. 

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


//A modifier par une fonction qui utilise la Base PostgreSQL/PostGis
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


//Renvoie une liste des GéoJSON des rue qui ont le même nom.
function getGeoJsonListOfRoads(hashTableOfWays, hashTableOfRelations)
{

	//La table qui contiendra les resultats finaux.
	tabGeoJson = [];


	//traitement des relations
	var arrayOfWays = [];
	var relations = hashTableOfRelations.getKeyValuePairs();

	for (var i = 0; i < relations.length; i++) {

		arrayOfWays = [];

		ids_osm_way = relations[i].value;

		if(ids_osm_way.length != 0)
		{

			
			for(var j = 0; j < ids_osm_way.length; j++)
			{
				if(hashTableOfWays.contains(ids_osm_way[j]))
				{
					nbrwaysInRelations++;
					arrayOfWays.push(hashTableOfWays.get(ids_osm_way[j]).value.coordinates);
					//Supprimer de la table des ways qui on déja étés inserer
					hashTableOfWays.remove(ids_osm_way[j]);
				}

			}
		}
		
		var geo = geojsonMultiline(arrayOfWays);
	

		tabGeoJson.push({name : relations[i].name, geoJson : geo});

	};

	delete relations;

	//Traitement des way avec un name a null

	var ways = hashTableOfWays.getKeyValuePairs();

	for (var i = 0; i < ways.length; i++) {
		var way = ways[i].value

		if(way.name == null)
		{
			//console.log(way);
			//console.log(JSON.stringify(geojsonMultiline([way.coordinates])));

			tabGeoJson.push({name : null , geoJson : geojsonMultiline([way.coordinates])});
			
			//Supprimer de la table des ways qui on déja étés inserer
			hashTableOfWays.remove(way.id_osm);

		}
	};

	//Traitement du rest des ways
	var ways = hashTableOfWays.getKeyValuePairs();
	var tabTmp = new hashes.HashTable();

	for (var i = 0; i < ways.length; i++) 
	{
		if(!tabTmp.contains(ways[i].value.name))
		{
			//transformer en multiLine
			var value = ways[i].value.coordinates = [ways[i].value.coordinates];
			tabTmp.add(ways[i].value.name, ways[i].value);

		}
		else
		{
			
			var oldWay = tabTmp.get(ways[i].value.name);

			var newWay = oldWay;

			var newCoordinates = oldWay.value.coordinates;
			newCoordinates.push(ways[i].value.coordinates)

			newWay.value.coordinates = newCoordinates; //<---
			newWay.value.isMultiline = true;

			
			tabTmp.add(newWay.key, newWay.value);


		}
	}


	var ways = tabTmp.getKeyValuePairs();
	for (var i = 0; i < ways.length; i++) 
	{
		//console.log(ways[i].value);
		//console.log(ways[i].value.isMultiline);
		if(ways[i].value.isMultiline != undefined)
		{
			tabGeoJson.push({name : ways[i].key , geoJson : geojsonMultiline(ways[i].value.coordinates)});
			//console.log(JSON.stringify(geojsonMultiline(ways[i].value.coordinates)));

		}
		else
		{
			tabGeoJson.push({name : ways[i].key , geoJson : geojsonMultiline(ways[i].value.coordinates)});
			//console.log(JSON.stringify(geojsonMultiline(ways[i].value.coordinates)));
		}

	}
	
	return tabGeoJson;
	
}


//Reçoit une liste de line et renvoi un geoJSON multiline
function geojsonMultiline(arrayOfLines)
{

	var multiLine = JSON.parse('{ "type": "MultiLineString","coordinates": []}');
	multiLine.coordinates = arrayOfLines;
	return multiLine;

}

var lib = require('../lib/myLibGeoJSON.js');

exports.arrayOfDistinctStreet = arrayOfDistinctStreet;

function arrayOfDistinctStreet(arrayMultiLine)
{
	result = [];

	for (var i = 0; i < arrayMultiLine.length; i++) 
	{

		var multiLine = arrayMultiLine[i].geoJson;
		var listOfLine = distinctStreet(multiLine);

		for (var j = 0; j < listOfLine.length; j++) 
		{
			
			var tmp = {name:arrayMultiLine[i].name, geoJson:listOfLine[j]};
			result.push(tmp);
		};

	};

	return result;
}

//Renvoie les rues en les distinguant si elle sont éloignés de plus 1 km.     
function distinctStreet(multiLineGeoJson)  
{

	
	var lines = multiLineGeoJson.coordinates; 	//Tableau qui contient toutes les lignes de notre geoJSON.
	var listeOfMultiLines = []; 				//Contiendra les dif multilines des dif rues selon un critére . 
	var multiLine = [];							//Variable tmp qui contiendra les lines d'une rues.
	var result = [];

	while(lines.length > 0)
	{
		multiLine = [];
		var line = lines.shift();
		line = line.slice()						//Copie par valeur.
		multiLine.push(line);

		var  i = 0;
		while(i < multiLine.length)
		{
			var j = 0;
			while(j<lines.length)
		 	{	
		 	 	
		 		if(lib.minDistance2lines(multiLine[i], lines[j]) < 1 )
		 		{
		 			var lineTmp = lines.splice(j,1);
		 			multiLine.push(lineTmp[0]);
		 			
		 		}
		 		j++;
		 	}
		 	i++;
		}
		listeOfMultiLines.push(multiLine);
	}


	for (var i = 0; i < listeOfMultiLines.length; i++) 
	{
		var tmp = 	{ 	type: "MultiLineString",
	    				coordinates: listeOfMultiLines[i]
	    			};
	    result.push(tmp);
	}	
	return result;
}
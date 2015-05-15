//Tests unitaires

exports.noSerializeable = noSerializeable;
exports.indexOfDisjointMultiLine = indexOfDisjointMultiLine;

//Utilisation du module "geojson-validation" --> https://www.npmjs.com/package/geojson-validation
var GJV = require("geojson-validation");

//Utilisation de la lib MyLibGeoJSON
var MGJ = require('./myLibGeoJSON.js');


//Function qui reçoit un tableau de geoJson et qui renvoie les indexes des geoJSON non valide. 
function noSerializeable(arrayGgeoJSON)
{
	noValid = [];
	for(var i = 0; i< arrayGgeoJSON.length; i++)
	{
		if(!GJV.valid(arrayGgeoJSON[i]))
		{
			noValid.push(i);
		}
	}
	return noValid;

}

//Fonction qui reçoit un tableau de geoJson de type "MultiLineString" et qui renvoie les indexes des géoJson qui sont disjoints.
function indexOfDisjointMultiLine(arrayGgeoJSON)
{
	disjoint = [];
	for(var i = 0; i< arrayGgeoJSON.length; i++)
	{
		if(disjointMultiLine(arrayGgeoJSON[i]))
		{
			disjoint.push(i);
		}
	}
	return disjoint;

}

//Function qui verifie si un geoJSON de type "MultiLineString" a des Lines disjointes.
function disjointMultiLine(multiLine)
{
	var lines = multiLine.coordinates.slice();

	var stack = [];

	stack.push(lines[0]);
	lines.splice(0,1);

	var i = 0;
	while(i<stack.length)
	{
		var focusLine = stack[i];
		var j = 0;

		while(j<lines.length) 
		{

			if( MGJ.minDistance2lines(focusLine, lines[j]) == 0 )
			{
				stack.push(lines.splice(j,1)[0]);
				
			}
			else
			{
				j++;
			}
		};
		i++;
	};

	if(lines.length > 0)
		return false;
	else 
		return true;
}






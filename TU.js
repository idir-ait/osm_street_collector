//Tests unitaires

exports.noSerializeable = noSerializeable;

//Utilisation du module "geojson-validation" --> https://www.npmjs.com/package/geojson-validation
var GJV = require("geojson-validation");


//Function qui reçoit un tableau de geoJson et qui renvoi les indexes des geoJSON non valide. 
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





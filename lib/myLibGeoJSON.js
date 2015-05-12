//myLibGeoJSON

exports.mergeSegments = mergeSegments;
exports.minDistance2lines = minDistance2lines;



/**
 * Comble comble les discontinuités d'une MultiLineString (type geoJson) .
 *
 * @param  {JSON} multiLines
 * @return {JSON} 
 */

function mergeSegments(multiLines)
{
var tab = multiLines .coordinates;
//var tab = [	[[2.1869688,48.80070179999999],[2.1867974,48.80075469999999],[2.1859708,48.80099299999999],[2.1857654,48.80103379999999],[2.1856704,48.8010497],[2.1854973,48.8010606],[2.1850778,48.80101679999999],[2.1848632,48.8009861],[2.184142,48.80088179999999],[2.1833542,48.8007603],[2.182815,48.80065669999999],[2.1826458,48.80063969999999],[2.1825328,48.8005799],[2.1816802,48.80041049999999],[2.1815165,48.80036789999999]],[[2.1810089,48.8000708],[2.1808081,48.8000903],[2.18,48.80025839999999],[2.1798435,48.8002868],[2.1796821,48.80026749999999],[2.1774822,48.79997259999999],[2.1769365,48.79990519999999],[2.1766047,48.7998625],[2.1755881,48.7997116],[2.1748269,48.79960959999999],[2.1738248,48.79947539999999],[2.1737366,48.79946449999999],[2.173494,48.7994385],[2.1732601,48.7994482],[2.1730672,48.7994828]],[[2.1826458,48.80063969999999],[2.1825231,48.8006681],[2.1824598,48.80067079999999],[2.1822174,48.8006376],[2.1820324,48.800611],[2.1813365,48.8005056],[2.1810628,48.800449]]];

/*
var tab_debut_fin = [];
for(var i=0; i < tab.length; i++)
{
	tab_debut_fin[i]=[tab[i][0], tab[i][tab[i].length-1]];

}
*/
//console.log(tab_debut_fin[2]);

var newtab = [];
while(tab.length > 1)
{
	var line1  = tab.shift();

	var minDist = Infinity;
	for(var i =0; i< tab.length; i++)
	{
		var dist = minDistance2lines(line1, tab[i]);

		if(dist < minDist)
		{
			var line2 = tab[i];
		}
	}


	pairepoints = minPoint2lines(line1, line2);


	var dist = distance2points(pairepoints[0],pairepoints[1]);
	//Dist > 0,01  < 0.1
	if(dist > 0.01 && dist < 1)
	{
		//Point du début
		
		if(samePoints(pairepoints[0],line1[0]))
		{
			//Ajouter pairepoints[1] au début du line1 
			var tmp = line1;
			line1 = [];
			line1.push(pairepoints[1]);  
			for(var i =0; i<tmp.length; i++)
			{
				line1.push(tmp[i]);  
			}

		}
		else
		{
			line1.push(pairepoints[1]);  
		}
		
	}

	newtab.push(line1);
}
newtab.push(tab.shift());
multiLines .coordinates = newtab;
return multiLines;
}


/**
 * Renvoie la distance minimale entre deux lines géographique.
 *
 * @param  {array} line1
 * @param  {array} line2
 * @return {int} 
 */
function minDistance2lines(line1, line2)
{
	var distMin = Infinity;

	for (var i = 0; i<line1.length; i++)
	{
		for (var j = 0; j<line2.length; j++)
		{
			var dist = distance2points(line1[i],line2[j]);
			if(distMin > dist)
			{
				distMin = dist;
			}

		}

	}
	return distMin;
}

/**
 * Renvoie les coordonnées géographique des deux points les plus proche de deux line.
 *
 * @param  {array} line1
 * @param  {array} line2
 * @return {array} 
 */

function minPoint2lines(line1, line2)
{
	var distMin = Infinity;
	var points = [];

	for (var i = 0; i<line1.length; i++)
	{
		for (var j = 0; j<line2.length; j++)
		{
			var dist = distance2points(line1[i],line2[j]);
			if(distMin > dist)
			{
				distMin = dist;
				points[0] = line1[i];
				points[1] = line2[j];
			}

		}

	}
	return points;
}

/**
 * Renvoie la distance en Km entre deux coordonnées géographiques.
 *
 * @param  {array} p1
 * @param  {array} p2
 * @return {int} 
 */
function distance2points(p1,p2) 
{
	var lat1 = p1[0];
	var lon1 = p1[1];

	var lat2 = p2[0];
	var lon2 = p2[1];

 	var R = 6371; // Radius of the earth in km
  	var dLat = deg2rad(lat2-lat1);  // deg2rad below
  	var dLon = deg2rad(lon2-lon1); 
  	var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  	var d = R * c; // Distance in km
  	return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}

/**
 * Test si les coordonnées de deux points géographiques sont les méme.
 *
 * @param  {array} p1
 * @param  {array} p2
 * @return {bool} 
 */

function samePoints(p1, p2)
{
	return (p1[0]==p2[0] && p1[1]==p2[1]);
}
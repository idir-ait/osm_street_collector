var sqlite = require('spatialite');

var db = new sqlite.Database('IDF.db');

var query = "SELECT name, AsGeoJSON(geom) as geojson from minor_roads;";



var i =0;

var rues = [];



var gju = require('geojson-utils');



console.log(t);

db.spatialite( function(err){

    db.all(query, function(err, row)
    {

    	var geojson;
        var j = 0;

	    for(i=0; i< row.length; i++)
	    {

	    	if( !(row[i].name == null) )
	    	{
		    	geojson = JSON.parse(row[i].geojson);
		    	geojson.name = row[i].name;
		    	rues[j] = geojson;
		    	j++;
		    }
	    }

        for(i=0; i< rues.length; i++)
	    {
	    	console.log(rues[i].name);
	    } 




	    var name = "Avenue Jean Moulin";
	    name = "Rue Toussaint Louverture";

	    var rst = getarray (rues, name);

		for(i=0; i< rst.length; i++)
	    {
	    	console.log(rst[i].name);
	    }


	     console.log(JSON.stringify(line2multiline (rst)));


        
    });
});


function line2multiline (arrayOfLine)
{
  var multiLine = JSON.parse('{ "type": "MultiLineString","coordinates": []}');

  for (i = 0; i < arrayOfLine.length; i++) 
  {

    multiLine.coordinates.push(arrayOfLine[i].coordinates);
  }

  return multiLine;
 
}

function getarray (array, name)
{

	var rest = [];
	for (i = 0; i < array.length; i++) 
  	{
  		if(array[i].name == name)
  		{
  			rest.push(array[i]);
  		}
  	}

	return rest;
}

function isthesameline(array)
{

 console.log 

}

function distline(line1, line2)
{
	loc1 = line1.coordinates ;

	loc2 = line2.coordinates ;

	var distMin = 3000000;
	var dist;

	for(int i ; i< line1.coordinates.length, i++)
	{
		for(int j; j< line2.coordinates.length, j++)
		{
			dist = distpoint(line1.coordinates[i], line2.coordinates[j]);
			if( dist < distMin)
			{
				distMin = dist;
			}
		}
	}


}


function distpoint(p1 , p2)
{
	return gju.pointDistance(	{type: 'Point', coordinates:[p[1], p[2]]},
                  				{type: 'Point', coordinates:[p[1], p[2]]});
}


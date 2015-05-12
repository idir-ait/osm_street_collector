var sqlite = require('spatialite');

var db = new sqlite.Database('IDF.db');

var elasticsearch = require('elasticsearch');

var client = new elasticsearch.Client(
{
  host: 'localhost:9200',
  log: 'trace',
  requestTimeout : 3600000,
  deadTimeout : 3600000,

});


var query = "SELECT id, name, AsGeoJSON(geom) as geojson from major_roads UNION SELECT id, name, AsGeoJSON(geom) as geojson from minor_roads;";



db.spatialite( function(err)
{
    db.all(query, function(err, row)
    {
            var doc;
            var data = [];
            for(var i =0; i<row.length; i++)
            {
            	doc = {index: 'tmpdb',type: 'roads', body : {}};
            	doc.body.name = row[i].name;
                doc.body.location = JSON.parse(row[i].geojson);
                data.push(doc);
                console.log(row[i].id + " " +data[i].body.name);
            }
            
            insert(data);  
    });
});



function insert(A)
{
	
 client.index(	A.shift()
 				, function (error, response) 
              	{
 
                	if(error)
                	{
                    	console.log(error);
                	}
                	else
                	{
                  	if(A.length > 0)
                  	{
                    	insert(A);
                  	}
                }
             	});

}
//Map serveur
var http = require('http');
var fs = require('fs'); 
var elasticsearch = require('elasticsearch');

var geo = require('./myLibGeoJSON.js');


var server = http.createServer(function(req, res) {
    fs.readFile('pagMap.html', 'utf-8', function(error, content) {
        res.writeHead(200, {"Content-Type": "text/html"});
        res.end(content);
    });
}); 


// Chargement de socket.io
var io = require('socket.io').listen(server);
// Quand on client se connecte, on le note dans la console
io.sockets.on('connection', function (socket) {
    

    socket.on('message', function (message) 
    {
        console.log('Adresse client: ' + message);
       


		var client = new elasticsearch.Client(
		{
		  host: 'localhost:9200',
		  //log: 'trace',
		  requestTimeout : 3600000,
		  deadTimeout : 3600000,

		});

        client.search(
        {
            index: 'tmpdb',
            type: 'roads',
            size : 1000000,
            body: {
					query : {
					    filtered : {
					        filter : {
					            term : {
					            name: message
					             }
					            }
					        }
					    }
					}

            }, function (error, response) 
            {
            	if(message !='undefined')
              	{

                	var arrayOfLine = [];
              
                	for (i = 0; i < response.hits.hits.length; i++) 
                	{
                  		arrayOfLine.push(response.hits.hits[i]._source);
                  		
                	}


                	var multiLine = line2multiline (arrayOfLine);

                	//console.log(JSON.stringify(multiLine));

                	//multiLine = geo.mergeSegments(multiLine);
                	
                	socket.emit('message', multiLine);
              	}
              		
         });
            
    });  
}); 
server.listen(8080); 


function line2multiline (arrayOfLine)
{
  var multiLine = JSON.parse('{ "type": "MultiLineString","coordinates": []}');

  for (i = 0; i < arrayOfLine.length; i++) 
  {

    multiLine.coordinates.push(arrayOfLine[i].location.coordinates);

  }

  return multiLine; 
}
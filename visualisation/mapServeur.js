//Map serveur
var http = require('http');
var fs = require('fs'); 
var elasticsearch = require('elasticsearch');
var io = require('socket.io').listen(server);


var server = http.createServer(function(req, res) {
    fs.readFile('pagMap.html', 'utf-8', function(error, content) {
        res.writeHead(200, {"Content-Type": "text/html"});
        res.end(content);
    });
}); 



// Quand un client se connecte, on le note dans la console
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
                    fuzzy_like_this_field : {
                    name : {
                    like_text : message,
                    max_query_terms : 10
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
                  		arrayOfLine.push(response.hits.hits[i]._source.geo);
                  		
                	}

                  console.log(arrayOfLine);
                	socket.emit('message', arrayOfLine);
              	}
              		
         });
            
    });  
}); 
server.listen(8080); 


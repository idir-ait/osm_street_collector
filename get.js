
var elasticsearch = require('elasticsearch');
var http = require('http');
var url = require('url');
var querystring = require('querystring');


var client = new elasticsearch.Client(
{
  host: 'localhost:9200',
  //log: 'trace',
  requestTimeout : 3600000,
  deadTimeout : 3600000,

});

    
var server = http.createServer(function(req, res) {

        var params = querystring.parse(url.parse(req.url).query);
        res.writeHead(200);


       
              client.search(
                  {
                    index: 'e42',
                    type: 'roads',
                    body: {
    "query" : {
        "filtered" : {
            "filter" : {
                "term" : {
                    "name" :  "Avenue Gaston Boissier"
                }
            }
        }
    }
}


                  }, function (error, response) 
                  {
                    if(typeof params['adr'] !='undefined')
                    {

                      var arrayOfLine = [];

                      for (i = 0; i < response.hits.hits.length; i++) 
                      {
                        arrayOfLine.push(response.hits.hits[i]._source);
                      }

                      var multiLine = line2multiline (arrayOfLine);

                      //console.log(JSON.stringify(multiLine));
                    }
                      res.end(mapPage1+JSON.stringify(multiLine)+mapPage2);
                    
                  });
            


    });
    server.listen(8080); 



function line2multiline (arrayOfLine)
{
  var multiLine = JSON.parse('{ "type": "MultiLineString","coordinates": []}');

  for (i = 0; i < arrayOfLine.length; i++) 
  {

    multiLine.coordinates.push(arrayOfLine[i].coordinates);
  }

  return multiLine;
 
}



var mapPage1 = '<!DOCTYPE html>'+
'<html>'+
'<head>'+
'  <title>Resultat</title>'+
' <meta charset="utf-8" />'+
'  <link rel="stylesheet" href="http://cdn.leafletjs.com/leaflet-0.7.3/leaflet.css" />'+
'</head>'+
'<body>'+
'  <div id="map" style="width: 1280px; height: 610px"></div>'+
'  <script src="sample-geojson.js" type="text/javascript"></script>'+
'  <script src="http://cdn.leafletjs.com/leaflet-0.7.3/leaflet.js"></script>'+
'  <script>'+
'  /*http://leafletjs.com/examples/quick-start.html*/'+
'    var map = L.map(\'map\').setView([48.8534100, 2.3488000], 10);'+
'   L.tileLayer(\'https://{s}.tiles.mapbox.com/v3/{id}/{z}/{x}/{y}.png\', {'+
'      maxZoom: 18,'+
'      attribution: \'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, \' +'+
'        \'<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, \' +'+
'        \'Imagery © <a href="http://mapbox.com">Mapbox</a>\','+
'      id: \'examples.map-20v6611k\''+
'    }).addTo(map);'+
'    var baseballIcon = L.icon({'+
'      iconUrl: \'baseball-marker.png\','+
'      iconSize: [32, 37],'+
'      iconAnchor: [16, 37],'+
'      popupAnchor: [0, -28]'+
'    });'+
'    var myLines = [';
var mapPage2 ='];'+
'    var myStyle = {'+
'        "color": "#0000FF",'+
'        "weight": 3,'+
'        "opacity": 0.85'+
'    };'+
'    L.geoJson(myLines, {'+
'      style: myStyle'+
'    }).addTo(map);'+
'  </script>'+
'</body>'+
'</html>';

/*



{
                    query: {
                      match: 
                            {
                                name: params['adr']
                            }
                          }
                          }
                          */
var http = require('http');

var server = http.createServer(function(req, res) {
  res.writeHead(200);
  res.end('Serveur nodeJS Entreprise 42 ;)');
});

server.on('close', function() { // On écoute l'évènement close
    console.log('Bye bye !');
})


server.listen(8080);

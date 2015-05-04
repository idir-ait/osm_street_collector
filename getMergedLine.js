var Set = require("collections/set");
var set = new Set();
 

set.add('bar');
set.add('bar');
set.add('badfdr');
console.log(set.toArray());
set.add(23);
set.add(23);

for (var i = 0; i < 300000; i++) {
	set.add("sqdqsdqsdqsdqsdqsfregvfdvsqsqfsqsdaz"+i);
};

console.log("fin");
//console.log(set.toArray());


'use strict';

self.onmessage = function(e) {
	
}

var r = [];
for(var i = 0; i < 32; ++i) {
	r.push((Math.random()*256)|0);
}

var z = H(w, r), y0 = z, y = [];

for(var i = 0; ; ++i) {
	if(respond) {
		respond(H(y0, z), r, H(z, r));
		clearInterval(calc);
		return;
	}
	
	++i;
	
	y.push(z);
	for(var q = 0; q < Q; ++q) {
		z = H(z, y[bigmod(z, i)]);
	}
}

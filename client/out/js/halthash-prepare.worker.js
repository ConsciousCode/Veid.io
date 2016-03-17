'use strict';

importScripts("halthash-util.js");

var r = new Array(32);
for(var i = 0; i < 32; ++i) {
	r[i]=(Math.random()*256)|0;
}

self.onmessage = function(e) {
	H(e.data, r, function(z) {
		var y0 = z, y = [], i = 0;
		
		(function loop(z) {
			y.push(z);
			
			(function memtime(q, z) {
				H(z, y[bigmod(z, i)], function(z) {
					if(q < Q) {
						memtime(q + 1, z);
					}
					else {
						loop(z);
					}
				});
			})(0, z);
		})(z);
	var z = H(e.data, r), y0 = z, y = [];
	for(var i = 0; ; ++i) {
		y.push(z);
		for(var q = 0; q < Q; ++q) {
			z = H(z, y[bigmod(z, i)]);
		}
		
		postMessage(y0, z, r);
	}
}

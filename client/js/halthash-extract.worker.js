'use strict';

importScripts("halthash-util.js");

self.onmessage = function(e) {
	var r = e.data.r, h = e.data.h, z = H(e.data.w, r),
		y = [], y0 = z, i = 0;
	
	iter: for(var i = 0; ; ++i) {
		y.push(z);
		for(var q = 0; q < Q; ++q) {
			z = H(z, y[bigmod(z, i)]);
		}
		
		var ih = H(y0, z);
		for(var j = 0; j < ih.length; ++j) {
			if(ih[j] != h[j]) {
				continue iter;
			}
		}
		
		postMessage(H(z, r));
		close();
		return;
	}
}

//http://usenix.org/legacy/events/sec07/tech/full_papers/boyen/boyen.pdf
var halthash = (function() {
	'use strict';
	
	function H(a, b) {
		if(typeof a == "string") {
			a = util.str2arr(a);
		}
		if(typeof b == "string") {
			b = util.str2arr(b);
		}
		
		var d = forge.md.sha256.create().update(a.concat(b)).digest().data, v = [];
		for(var i = 0; i < d.length; ++i) {
			v.push(d.charCodeAt(i));
		}
		
		return v;
	}

	function bigmod(big, m) {
		var base = 1, lhs = 0;
		for(var i = 0; i < big.length; ++i) {
			lhs += (big[i]*base)%m;
			base = (base*(256%m))%m;
		}
		
		return lhs%m;
	}

	var Q = 10;

	function prepare(w) {
		var r = [];
		for(var i = 0; i < 32; ++i) {
			r.push((Math.random()*256)|0);
		}
		
		var z = H(w, r), y0 = z, y = [], i = 0, done = null;
		
		var calc = setInterval(function() {
			if(done) {
				clearInterval(calc);
				done(H(y0, z), r, H(z, r));
				return;
			}
			
			++i;
			
			y.push(z);
			for(var q = 0; q < Q; ++q) {
				z = H(z, y[bigmod(z, i)]);
			}
			
			//Check hash, nonce, XOR key
			expose(y0, z, r);
		}, 0);
		
		return function(func) {
			done = func;
		}
	}
	
	function extract(w, h, r, expose) {
		var z = H(w, r), y = [], y0 = z, i = 0;
		
		var calc = setInterval(function() {
			++i;
			
			y.push(z);
			for(var q = 0; q < Q; ++q) {
				z = H(z, y[bigmod(z, i)]);
			}
			
			var ih = H(y0, z);
			for(var j = 0; j < ih.length; ++j) {
				if(ih[j] != h[j]) {
					return;
				}
			}
			
			expose(H(z, r));
		}, 0);
		
		return function() {
			clearInterval(calc);
		}
	}
	
	return {
		prepare: prepare,
		extract: extract,
		H: H
	};
})();

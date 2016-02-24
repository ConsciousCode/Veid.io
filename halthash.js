//http://usenix.org/legacy/events/sec07/tech/full_papers/boyen/boyen.pdf

var utf8_encode = (function() {
	/** monsur.hossa.in/2012/07/20/utf-8-in-javascript.html **/
	if(TextEncoder) {
		return function(s) {
			return Array.from(new TextEncoder("utf-8").encode(s));
		}
	}
	else {
		return function(s) {
			var v = [], es = unescape(encodeURIComponent(s));
			for(var i = 0; i < es.length; ++es) {
				v.push(es.charCodeAt(i));
			}
			return v;
		};
	}
})();

function H(a, b) {
	if(typeof a == "string") {
		a = utf8_encode(a);
	}
	if(typeof b == "string") {
		b = utf8_encode(b);
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

function prepare(w, t) {
	var r = [];
	for(var i = 0; i < 32; ++i) {
		r.push(i);//(Math.random()*256)|0);
	}
	
	var z = H(w, r), y = [];
	
	for(var i = 0; i < t; ++i) {
		y.push(z);
		for(var q = 0; q < Q; ++q) {
			z = H(z, y[bigmod(z, i+1)]);
		}
	}
	
	return {
		h: H(y[0], z),
		r: r,
		key: H(z, r)
	};
}

function extract(w, v, t) {
	var h = v.h, r = v.r, z = H(w, r), y = [];
	for(var i = 0; i < t; ++i) {
		y.push(z);
		for(var q = 0; q < Q; ++q) {
			z = H(z, y[bigmod(z, i+1)]);
			
			var ih = H(y[0], z);
			for(var j = 0; j < ih.length; ++j) {
				if(ih[j] != h[j]) {
					break;
				}
			}
			
			if(j == ih.length) {
				return H(z, r);
			}
		}
	}
	
	throw new Error("Failed to terminate");
}

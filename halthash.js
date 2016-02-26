//http://usenix.org/legacy/events/sec07/tech/full_papers/boyen/boyen.pdf

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
	
	var z = H(w, r), y0 = z, y = [], i = 0, respond;
	
	var calc = setInterval(function() {
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
	}, 0);
	
	return function(ret) {
		respond = ret;
	}
}

function extract(w, h, r, fulfill) {
	var z = H(w, r), y = [], y0 = z, i = 0;
	
	var calc = setInterval(function() {
		++i;
		
		y.push(z);
		iter: for(var q = 0; q < Q; ++q) {
			z = H(z, y[bigmod(z, i)]);
			
			var ih = H(y0, z);
			for(var j = 0; j < ih.length; ++j) {
				if(ih[j] != h[j]) {
					continue iter;
				}
			}
			
			fulfill(H(z, r));
		}
	}, 0);
	
	return function() {
		clearInterval(calc);
	}
}

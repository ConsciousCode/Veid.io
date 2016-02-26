'use strict';

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

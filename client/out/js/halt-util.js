'use strict';

function H(a, b, next) {
	if(crypto) {
		crypto.subtle.digest("SHA-256", a.concat(b)).then(next);
	}
	else {
		throw new Error("Haven't implemented H for browsers without crypto");
	}
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

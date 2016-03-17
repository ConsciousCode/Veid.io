importScripts(
	"js/jsbn.js",
	"js/jsbn2.js",
	"js/prng.js",
	"js/rng.js",
	"js/rsa.js",
	"js/rsa2.js"
);

var rsa = new RSAKey();
rsa.generate(2048, "10001");

postMessage(rsa);
close();

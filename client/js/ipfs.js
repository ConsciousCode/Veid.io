var ipfs = (function() {
	'use strict';
	
	return {
		ipfs: function(mh) {
			return "http://ipfs.io/ipfs/"+mh;
		}
	};
})();

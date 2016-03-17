var util = (function() {
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
	
	return {
		arr2str: function(arr) {
			var s = "";
			for(var i = 0; i < arr.length; ++i) {
				s += String.fromCharCode(arr[i]);
			}
			
			return s;
		},
		str2arr: utf8_encode
	};
})();

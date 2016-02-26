var consensus=(function() {
	'use strict';
	
	return {
		init: function(){},
		register: function(name, pass, ok) {
			var xhr = new XMLHttpRequest(),
				params = "name="+escape(name)+"&pass="+
					escape(btoa(util.arr2str(pass)));
			xhr.addEventListener("load", function() {
				ok();
			});
			
			xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
			xhr.setRequestHeader("Content-length", params.length);
			xhr.setRequestHeader("Connection", "close");
			
			xhr.open("POST", "http://veid.io/register!");
			xhr.send(params);
		},
		login: function(name, pass, ok) {
			var xhr = new XMLHttpRequest(),
				params = "name="+escape(name);
			xhr.addEventListener("load", function() {
				ok();
			});
			
			xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
			xhr.setRequestHeader("Content-length", params.length);
			xhr.setRequestHeader("Connection", "close");
			
			xhr.open("POST", "http://veid.io/login!");
			xhr.send(params);
		},
		recommend: function(root, pref, ok) {
			var xhr = new XMLHttpRequest(),
				params = "root="+escape(root);
			
			xhr.addEventListener("load", function() {
				ok(JSON.parse(this.responseText));
			});
			
			xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
			xhr.setRequestHeader("Content-length", params.length);
			xhr.setRequestHeader("Connection", "close");
			
			xhr.open("GET", "http://veid.io/query!");
			xhr.send(params);
		},
		unbox: function(id, root, ok) {
			var xhr = new XMLHttpRequest(),
				params = "id="+escape(id)+"&root="+escape(root);
			
			xhr.addEventListener("load", function() {
				ok(JSON.parse(this.responseText));
			});
			
			xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
			xhr.setRequestHeader("Content-length", params.length);
			xhr.setRequestHeader("Connection", "close");
			
			xhr.open("GET", "http://veid.io/unbox!");
			xhr.send(params);
		}
	};
})();

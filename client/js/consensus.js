//http://www-cs-students.stanford.edu/~tjw/jsbn/ (JS encryption)
var consensus=(function() {
	'use strict';
	
	function User(d) {
		this.name = d.name;
		this.keys = d.keys;
		this.pref = d.pref;
		this.favs = d.favs;
		this.vids = d.vids;
		this.prefs = d.prefs;
	}
	User.prototype.toJSON = function() {
		return JSON.toString({
			name: this.name,
			keys: {
				n: this.keys.n.toString(32),
				e: this.keys.e.toString(32),
				d: this.keys.d.toString(32),
				p: this.keys.p.toString(32),
				q: this.keys.q.toString(32),
				dmp1: this.keys.dmp1.toString(32),
				dmq1: this.keys.dmq1.toString(32),
				coeff: this.keys.coeff.toString(32)
			},
			pref: this.pref,
			favs: this.favs,
			vids: this.vids,
			prefs: this.prefs
		});
	}
	User.fromJSON = function(json) {
		var d = JSON.parse(json), keys = new RSAKey();
		
		keys.n = new BigInteger(d.keys.n, 32);
		keys.e = 0x10001;
		keys.d = new BigInteger(d.keys.d, 32);
		keys.p = new BigInteger(d.keys.p, 32);
		keys.q = new BigInteger(d.keys.q, 32);
		keys.dmp1 = new BigInteger(d.keys.dmp1, 32);
		keys.dmq1 = new BigInteger(d.keys.dmq1, 32);
		keys.coeff = new BigInteger(d.keys.coeff, 32);
		
		return new User({
			name: d.name,
			keys: keys,
			pref: d.pref,
			favs: d.favs,
			vids: d.vids,
			prefs: d.prefs
		});
	}
	
	var gname,gpayload;
	
	return {
		User: User,
		init: function(){},
		register: function(name, payload, ok) {
			gname = name;
			gpayload = payload;
			ok();
			return;
			
			var xhr = new XMLHttpRequest(),
				params = "name="+escape(name)+"&payload="+
					escape(btoa(util.arr2str(payload)));
			xhr.addEventListener("load", function() {
				ok();
			});
			
			xhr.open("POST", "http://veid.io/register!");
			
			xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
			
			xhr.send(params);
		},
		login: function(name, ok) {
			if(name == gname) {
				ok(gpayload);
				return;
			}
			ok("");
			return;
			
			var xhr = new XMLHttpRequest();
			xhr.addEventListener("load", function() {
				ok(e.responseText);
			});
			
			xhr.open("GET", "http://veid.io/login!?name="+escape(name));
			xhr.send();
		},
		recommend: function(root, query, pref, ok) {
			var xhr = new XMLHttpRequest(),
				params = "root="+escape(root)+
					"&query="+escape(query)+
					"&as="+escape(btoa(pref));
			
			xhr.addEventListener("load", function() {
				ok(JSON.parse(this.responseText));
			});
			
			xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
			
			xhr.open("GET", "http://veid.io/query!");
			xhr.send(params);
		},
		unbox: function(id,  ok) {
			var xhr = new XMLHttpRequest(),
				params = "id="+escape(id);
			
			xhr.addEventListener("load", function() {
				ok(JSON.parse(this.responseText));
			});
			
			xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
			
			xhr.open("GET", "http://veid.io/unbox!");
			xhr.send(params);
		}
	};
})();

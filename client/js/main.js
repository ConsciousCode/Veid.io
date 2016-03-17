'use strict';

//Format the given number in seconds to an HH: MM: SS.mm timestamp
function format_time(time){
	var h,m,s;
	h=(time/360)|0;time%=360;
	m=(time/60)|0;time%=60;
	s=time|0;
	
	return (h?h+":": "")+(m>=10?m: "0"+m)+":"+(s>=10?s: "0"+s);
}

var quality={
	SIZE: 32,
	random: function(){
		var vec=new Uint8Array(this.SIZE);
		for(var i=0;i<this.SIZE;++i){
			vec[i]=Math.random()*256;
		}
		
		return vec;
	},
	merge: function(swirls){
		var dump_x=new Array(this.SIZE),dump_y=new Array(this.SIZE);
		
		for(var i=0;i<swirls.length;++i){
			for(var d=0;d<this.SIZE;++d){
				dump_x[d]+=Math.cos(swirls[i]*Math.PI/(180*256));
				dump_y[d]+=Math.sin(swirls[i]*Math.PI/(180*256));
			}
		}
		
		var vec=new Uint8Array(this.SIZE),n=swirls.length;
		for(var d=0;d<this.SIZE;++d){
			vec[d]=Math.atan2(dump_y[d]/n,dump_x[d]/n);
		}
		
		return vec;
	},
	point_dist: function(a,b){
		var d=Math.abs(a-b)%128;
		
		return d*d;
	},
	distance: function(a,b){
		var dist=0;
		for(var i=0;i<64;++i){
			dist+=this.point_dist(a[i],b[i]);
		}
		
		return dist;
	},
	step: function(from,to,by){
		for(var i=0;i<64;++i){
			from[i]+=Math.min(by,quality_point_distance(from[i],to[i]))*
				(Math.abs(from[i]-to[i])>128?1: -1)*
				(from[i]>to[i]?1: -1);
		}
	},
	stringify: function(pref) {
		var s = "";
		for(var i = 0; i < pref.length; ++i) {
			s += String.fromCharCode(pref[i]);
		}
		
		return s;
	}
};

var user = (function() {
	if(localStorage.user) {
		return User.fromJSON(localStorage.user);
	}
	else if(sessionStorage.user) {
		return User.fromJSON(sessionStorage.user);
	}
	else {
		try{
			var worker = new Worker("js/make-user-keys.worker.js");
			worker.onmessage = function(e) {
				user.keys = e.data;
				
				sessionStorage.user = user.toJSON();
			}
		}
		catch(e) {}
		
		return new consensus.User({
			name: null,
			keys: null,
			favs: [],
			vids: [],
			prefs: {}
		});
	}
})();

$(document).ready(function() {
	function activateTab(name) {
		$(".tabs li, #omnipanel section").removeClass("active");
		$("#"+name).addClass("active");
	}
	
	$(".tabs li").click(function(){
		activateTab(this.id);
	});
	
	var $searchbar=$("#search input");
	
	///Non-player buttons

	$("#subscribe").click(function(){
		$(this).toggleClass("fa-star-o fa-star");
	});
	
	$("#dislike").click(function(){
		$(this).toggleClass("fa-minus fa-minus-circle");
	});

	$("#like").click(function(){
		$(this).toggleClass("fa-plus fa-plus-circle");
	});

	$("#favorite").click(function(){
		$(this).toggleClass("fa-heart-o fa-heart");
	});
	
	var $searchbar=$("#search input");
	function add_search(text){
		if($searchbar[0].value){
			$searchbar[0].value+=" "+text;
		}
		else{
			$searchbar[0].value=text;
		}
	}
	
	var search_display_mode = "grid",
		$results = $("#search-results"),
		default_thumb = "QmfKWwF1jiGcMGczYq11D2phrE9PMSM1QNbfrm96DyyNdY",
		search_data = [
			{
				thumb: default_thumb,
				length: 210,
				title: "Care a Day (remix)",
				author: "Z Sefnes",
				views: 108492,
				tips: 2301,
				norm: 50238,
				id: "WJE9802jEDFjmvsEWF7822"
			},{
				thumb: default_thumb,
				length: 210,
				title: "Care a Day (remix)",
				author: "Z Sefnes",
				views: 108492,
				tips: 2301,
				norm: 50238,
				id: "WJE9802jEDFjmvsEWF7822"
			}
		];
	function update_search_results(data) {
		if(data) {
			var tpl = $("#"+search_display_mode+"-preview-tpl")[0].content;
			search_data = data;
			
			$results.html("");
			
			for(var i = 0; i < data.length; ++i) {
				var d = data[i];
				
				var $node = $(document.importNode(tpl, true));
				$node.find(".thumb-container").attr('href', "#!?id=" + d.id);
				$node.find(".thumb").attr('src',
					ipfs.ipfs(d.thumb || default_thumb)
				);
				$node.find(".video-length").text(format_time(d.length));
				$node.find(".title").text(d.title);
				$node.find(".author").text(d.author);
				$node.find(".views").text(d.views.toLocaleString());
				
				$node.find(".tips").css('flex', d.tips);
				$node.find(".norm").css('flex', d.norm);
				
				$results.append($node);
			}
		}
	}
	$("#search-grid").click(function() {
		search_display_mode = "grid";
		update_search_results(search_data);
	});
	$("#search-list").click(function() {
		search_display_mode = "list";
		update_search_results(search_data);
	});
	
	function do_search(text){
		consensus.recommend(
			0, text, quality.stringify(user.prefs), update_search_results
		);
	}
	
	$("#search-popular").click(function(){
		add_search("#popular");
	});
	
	$("#search-hot").click(function(){
		add_search("#hot");
	});
	
	$("#search-random").click(function(){
		add_search("#random");
	});
	
	$("#search-global").click(function(){
		add_search("#global");
	});
	
	var u32 = new Struct("5"), profile = new Struct("51"),
		login_stop, login_timer;
	
	$("#login-username").blur(function() {
		consensus.login(this.value, function(data) {
			if(data) {
				user.pending = data;
				$("#login-button").prop('disabled', false);
			}
			else {
				$(this).addClass("error");
			}
		});
	}).keydown(function() {
		$("#login-button").prop('disabled', true);
		$(this).removeClass("error");
	});
	
	var register_playable = new Conditional(
		['username', 'password', 'confirm'],
		function() {
			$("#register-button").prop('disabled', true);
		},
		function() {
			$("#register-button").prop('disabled', false);			
		}
	);
	$("#register-username").blur(function() {
		var self = this;
		consensus.login(this.value, function(data) {
			if(data) {
				$(self).addClass("error");
				register_playable.set('username', false);
			}
			else {
				register_playable.set('username', true);
			}
		});
	}).keydown(function() {
		register_playable.set('username', false);
		$(this).removeClass("error");
	});
	$("#register-password").blur(function() {
		register_playable.set('password', true);
	}).keydown(function() {
		register_playable.set('password', false);
	});
	$("#register-confirm").keydown(function() {
		if($(this).val() == $("#register-password").val()) {
			register_playable.set('confirm', true);
		}
		else {
			register_playable.set('confirm', false);
		}
	});
	
	$("#login-button").click(function() {
		$(this).toggleClass("fa-play fa-stop");
		
		if(login_stop) {
			login_stop();
			login_stop = null;
			
			clearInterval(login_timer);
		}
		else {
			var n = 0;
			login_timer = setInterval(function() {
				n += 0.1;
				$("#login-time").text(n.toFixed(1) + " s");
			}, 100);
			
			login_stop = halthash.extract(
				$("#set-password").val(),
				function(pass) {
					var cipher = forge.cipher.createDecipher(
							"AES-GCM", u32.pack([pass])
						);
					
					decipher.start({iv: iv});
					decipher.update(forge.util.createBuffer(
						profile.pack([rsa.d, '\x00\x00'])
					));
					decipher.finish();
					
					var keys = new RSAKey(), p = profile.unpack();
					keys.setPrivateEx();
					
					user.name = $("login-username").val();
					user.keys = 
					consensus.register(
						$("#set-username").val(),
						cipher.output.data,
						function() {}
					);
				}
			);
		}
	});
	$("#register-button").click(function() {
		$(this).toggleClass("fa-play fa-stop");
		
		if(login_callback) {
			login_callback();
			login_callback = null;
			
			clearInterval(timer);
			
			var h = halthash.H(y0, z), x = halthash.H(z, r), rsa = new RSAKey();
			rsa.generate(2048, "10001");
			
			var cipher = forge.cipher.createCipher(
					"AES-GCM", u32.pack([x])
				),
				iv = forge.random.getBytesSync(32);
			
			cipher.start({iv: iv});
			cipher.update(forge.util.createBuffer(
				profile.pack([rsa.d, '\x00\x00'])
			));
			cipher.finish();
			
			consensus.register(
				$("#set-username").val(),
				cipher.output.data,
				function() {}
			);
		}
		else {
			var n = 0;
			timer = setInterval(function() {
				n += 0.1;
				$("#login-time").text(n.toFixed(1) + " s");
			}, 100);
			
			login_callback = halthash.prepare(
				$("#set-password").val(),
				function(a, b, c) {
					y0 = a;
					z = b;
					r = c;
				}
			);
		}
	});
	
	function process_url(url) {
		var m;
		switch(url) {
			case "":
			case "#":
				break;
			case "#about":
				activateTab("site-info");
				break;
			case "#profile":
				activateTab("profile");
				break;
			case "#search":
				activateTab("search");
				break;
			default:
				if(m = /#!search\?(.+)?$/.exec(url)) {
					activateTab("search");
					if(m[1]) {
						if(m = /[A-Za-z\d+-]+_*/.exec(m[1])) {
							var query = "#"+m[0];
							$("#search input").val(query);
							do_search(query);
						}
						else if(m[1][0]=="?") {
							var query = decodeURIComponent(m[1].slice(1)).
								replace(/\+/g, " ");
							$("#search input").val(query);
							do_search(query);
						}
					}
				}
				else if(m = /#!([1-9A-HJ-NP-Za-km-z]+)/.exec(url)) {
					consensus.unbox(m[1], function(data) {
						var $vid = $("#player video").html("");
						for(var mime in data) {
							$vid.append($("<source>").attr({
								src: ipfs.ipfs(data[mime]),
								type: mime
							}));
						}
					});
				}
				break;
		}
	}

	addEventListener("hashchange", function() {
		process_url(location.hash);
	});
	
	///These should be executed last
	process_url(location.hash);
});

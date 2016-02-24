var byzathen = (function() {
	'use strict';
	
	function pack_uint(x, bytes) {
		var data = [];
		while(x > 0 && data.length < bytes) {
			data.push(x & 0xff);
			x >>= 8;
		}
		
		return data;
	}
	
	function Block(config) {
		this.version = config.version || 0;
		this.last = config.last;
		this.transactions = config.transactions || [];
		this.goods = config.goods || [];
		this.newcomers = config.newcomers || [];
		this.cheaters = config.cheaters || [];
		this.petty = config.petty || [];
		this.signatures = config.signatures || [];
	}
	Block.prototype.serializeBody = function() {
		var data = [0x56, 0x45, 0x49, 0x44]; // Magic number, VEID
		data.push(this.version & 0xff);
		data = data.concat(this.last.serialize());
		
		data.push(pack_uint(this.transactions.length, 2));
		for(var i = 0; i < this.transactions.length; ++i) {
			data = data.concat(this.transactions[i].serialize());
		}
		
		data.push(pack_uint(this.goods.length, 2));
		for(var i = 0; i < this.goods.length; ++i) {
			data = data.concat(this.goods[i].serialize());
		}
		
		data.push(pack_uint(this.newcomers.length, 2));
		for(var i = 0; i < this.newcomers.length; ++i) {
			data = data.concat(this.newcomers[i].serialize());
		}
		
		data.push(pack_uint(this.cheats.length, 2));
		for(var i = 0; i < this.cheats.length; ++i) {
			data = data.concat(this.cheats[i].serialize());
		}
		
		data.push(pack_uint(this.petty.length, 2));
		for(var i = 0; i < this.petty.length; ++i) {
			data = data.concat(this.petty[i].serialize());
		}
		
		return data;
	}
	Block.prototype.serializeFinal = function() {
		var data = this.serializeBody();
		
		data.push(pack_uint(this.signatures.length, 2));
		for(var i = 0; i < this.signatures.length; ++i) {
			data = data.concat(this.signatures[i].serialize());
		}
		
		return data;
	}
	Block.prototype.bodyHash = function() {
		var d = "", body = this.serializeBody();
		
		for(var i = 0; i < body.length; ++i) {
			d += String.fromCharCode(body[i]);
		}
		
		return sha256(d);
	}
	Block.prototype.finalHash = function() {
		var d = "", final = this.serializeFinal();
		
		for(var i = 0; i < final.length; ++i) {
			d += String.fromCharCode(final[i]);
		}
		
		return sha256(d);
	}
	
	function decrypt(key, msg) {
		var raw;
		switch(msg.charCodeAt(0)) {
			case 0:
				switch(msg.charCodeAt(1)) {
					case 0:
						raw = key.decrypt(msg.slice(2));
						break;
					
					default:
						return null;
				}
				break;
			default:
				return null;
		}
		
		var code = raw.charCodeAt(0),
			len = raw.charCodeAt(1),
			hash = raw.slice(2, len + 2),
			rd = raw.slice(len + 2);
		
		switch(raw.charCodeAt(0)) {
			case 0x12:
				if(hash != hex2b85(sha256(rd))) {
					return null;
				}
				break;
			default:
				return null;
		}
		
		try {
			var data = JSON.parse(rd);
			
			if(data.version != msg.charCodeAt(0)) {
				return null;
			}
			
			return data;
		}
		catch(e) {
			return null;
		}
	}
	
	function Connection(p2p) {
		this.handlers = [];
		this.p2p = p2p;
		
		var self = this;
		p2p.onMessage = function(data) {
			self._handleRawMessage(data);
		}
	}
	Connection.prototype._handleRawMessage = function(peer, msg) {
		var data = decrypt(peer.key, msg);
		if(!data) {
			return false;
		}
		
		if(data.version == 0) {
			var msgs = ["init","peers","block","suggest","videos","watch","cheat"];
			
			var handler = this.handlers[msgs[data.msg]];
			if(handler) {
				for(var i = 0; i < handler.length; ++i) {
					handler[i](data.payload);
				}
				
				return true;
			}
			else {
				return false;
			}
		}
		else {
			return false;
		}
	}
	Connection.prototype.on = function(
	
	function StandardSwarm(conn) {
		
	}
	
	return {
		Block: Block,
		Connection: Connection
	};
})();

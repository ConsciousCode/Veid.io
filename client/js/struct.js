//Based loosely on Python's struct module
var Struct = (function() {
	'use strict'; 
	
	/**
	 * Abstract structure definition, used for interacting with binary data.
	**/
	function Struct(defs, names) {
		var off = 0, sizes = [], offs = [], i = 0;
		
		if(defs[0] == "<") {
			this.endian = false;
			++i;
		}
		else if(defs[0] == ">") {
			this.endian = true;
			++i;
		}
		else {
			this.endian = false;
		}
		
		var DEF = /(?:(\d+):)?([cb?hilf])|%([\da-f])|(\*)/gi, def = [], m;
		while(m = DEF.exec(defs)) {
			if(m[2]) {
				var c = m[2], r = c;
				for(var i = 0; i < (m[1]|0) - 1; ++i) {
					r += c;
				}
				def.push(r);
			}
			else if(m[3]) {
				def.push(1<<parseInt(m[3], 16));
			}
			else {
				def.push("*");
				break;
			}
		}
		
		this.def = def;
		this.names = names;
	}
	/**
	 * Convert an object to a serialized array
	**/
	Struct.prototype._serialize = function(data) {
		var serial = [];
		for(var i = 0; i < this.names.length; ++i) {
			serial.push(data[this.names[i]]);
		}
		
		return serial;
	}
	/**
	 * Convert a serialized array to an unstructured object
	**/
	Struct.prototype._deserialize = function(data) {
		var deserial = {};
		for(var i = 0; i < this.names.length; ++i) {
			deserial[this.names[i]] = data[i];
		}
		
		return deserial;
	}
	/**
	 * Just dump all the bytes in a lil-endian byte array, pack them later
	**/
	Struct.prototype._raw_data = function(n, t) {
		t = {
			'c':1, "b":1, "B":1, "h":2, "H":2, "i":4, "I":4
		}[t] || t;
		
		var data = new Uint8Array(t);
		
		if(typeof n == "number") {
			for(var i = 0; i < t && n; ++i) {
				data[i] = n%256;
				n /= 256;
			}
		}
		else if(n instanceof BigInteger) {
			var ba = n.toByteArray();
			
			for(var j = 0; j < ba.length && ba[j] == 0; ++j) {}
			
			for(var i = 0; i < t && j < ba.length; ++i) {
				data[i] = ba[i + j];
			}
		}
		else if(typeof n == "string") {
			for(var i = 0; i < t && i < n.length; ++i) {
				data[i] = n.charCodeAt(i);
			}
		}
		else if(typeof n.length != "undefined") {
			for(var i = 0; i < t && i < n.length; ++i) {
				data[i] = n[i];
			}
		}
		else {
			throw new Error("Bad data type");
		}
		
		return data;
	}
	/**
	 * Convert the data into a byte array to be assembled into the string type.
	**/
	Struct.prototype._prepack = function(inp) {
		inp = this._serialize(inp);
		
		if(inp.length != this.def.length) {
			throw new Error("Struct data length mismatch");
		}
		
		var out = [];
		
		for(var i = 0; i < inp.length && i < this.def.length; ++i) {
			if(this.def[i] == "*") {
				out.push(inp[i++]);
				break;
			}
			
			var data = this._raw_data(inp[i], this.def[i]);
			
			switch(this.def[i]) {
				case 'c':
				case 'b':
				case "B":
					out.push(data[0]);
					break;
				case 'h':
				case "H":
					if(this.endian) {
						out.push(data[1], data[0]);
					}
					else {
						out.push(data[0], data[1]);
					}
					break;
				case 'i':
				case "I":
					if(this.endian) {
						out.push(data[3], data[2], data[1], data[0]);
					}
					else {
						out.push(data[0], data[1], data[2], data[3]);
					}
					break;
				default:
					if(typeof this.def[i] == "number") {
						//Big
						if(this.endian) {
							for(var j = this.def[i]; j > 0;) {
								out.push(data[--j]);
							}
						}
						else {
							for(var j = 0; j < this.def[i]; ++j) {
								out.push(data[j]);
							}
						}
					}
			}
		}
		
		for(;i < this.def.length; ++i) {
			out.push(0);
		}
		
		return out;
	}
	/**
	 * Pack the data in JS's native string type.
	**/
	Struct.prototype.ucs2pack = function(data) {
		var pack = this._prepack(data), out = "";
		
		for(var i = 0; i < pack.length; i += 2) {
			if(this.def[i] == "*") {
				out += pack[i];
				break;
			}
			out += String.fromCharCode((pack[i]<<8) | pack[i + 1]);
		}
		
		return out;
	}
	Struct.prototype.pack = function(data) {
		var pack = this._prepack(data), out = "";
		
		if(this.def[this.def.length - 1] == "*") {
			for(var i = 0; i < pack.length - 1; ++i) {
				out += String.fromCharCode(pack[i]);
			}
			
			out += pack[i];
		}
		else {
			for(var i = 0; i < pack.length; ++i) {
				out += String.fromCharCode(pack[i]);
			}
		}
		
		return out;
	}
	Struct.prototype._preunpack = function(data) {
		var out = [];
		for(var i = 0, off = 0; i < this.def.length && off < data.length; ++i, ++off) {
			switch(this.def[i]) {
				case 'c':
					out.push(String.fromCharCode(data[off]));
					break;
				case 'b':
					out.push((data[off] + 128)%256 - 128);
					break;
				case "B":
					out.push(data[off]);
					break;
				case 'h':
					var a = data[off], b = data[++off];
					//Big
					if(this.endian) {
						out.push((((a<<8) | b) + 32768)%65536 - 32768);
					}
					else {
						out.push((((b<<8) | a) + 32768)%65536 - 32768);
					}
					break;
				case "H":
					var a = data[off], b = data[++off];
					//Big
					if(this.endian) {
						out.push((a<<8) | b);
					}
					else {
						out.push((b<<8) | a);
					}
					break;
				case 'i':
					var
						a = data[off], b = data[++off],
						c = data[++off], d = data[++off];
					//Big
					if(this.endian) {
						out.push(
							((
								(((((a<<8) | b)<<8) | c)<<8) | d
							) + 32768)%65536 - 32768
						);
					}
					else {
						out.push(
							((
								(((((d<<8) | c)<<8) | b)<<8) | a
							) + 32768)%65536 - 32768
						);
					}
					break;
				case "I":
					var
						a = data[off], b = data[++off],
						c = data[++off], d = data[++off];
					//Big
					if(this.endian) {
						out.push((((((d<<8) | c)<<8) | b)<<8) | a);
					}
					else {
						out.push((((((a<<8) | b)<<8) | c)<<8) | d);
					}
					break;
				case "*":
					var rest = "";
					for(;off < data.length; ++off) {
						rest += String.fromCharCode(data[off]);
					}
					out.push(rest);
					break;
				default:
					if(typeof this.def[i] == 'number') {
						var s = [];
						//Big
						if(this.endian) {
							for(var j = this.def[i] - 1; j >= 0; --j) {
								s.push(data[off + j]);
							}
						}
						else {
							for(var j = 0; j < this.def[i]; ++j) {
								s.push(data[off + j]);
							}
						}
						
						out.push(new BigInteger(s));
						off += this.def[i] - 1;
					}
					break;
			}
		}
		
		return this._deserialize(out);
	}
	Struct.prototype.ucs2unpack = function(data) {
		var codes = [];
		for(var i = 0; i < data.length; ++i) {
			var code = data.charCodeAt(i);
			codes.push(code>>8);
			codes.push(code&0xff);
		}
		
		return this._preunpack(codes);
	}
	Struct.prototype.unpack = function(data) {
		var codes = [];
		for(var i = 0; i < data.length; ++i) {
			codes.push(data.charCodeAt(i)&0xff);
		}
		
		return this._preunpack(codes);
	}
	
	return Struct;
})();

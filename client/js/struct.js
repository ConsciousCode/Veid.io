//Based loosely on Python's struct module
var Struct = (function() {
	'use strict';
	
	//Just dump all the bytes in a lil-endian byte array, pack them later
	function Struct_raw_data(v, t) {
		var data = new Uint8(8);
		
		if(typeof n == "number") {
			//val = (-1)^sign * (1 + sum(d_i*2^-i)*2^(e - 127)
			if(t == 'f') {
				var sign = (n < 0), exp = 0, frac = 0, bits = 0;
				n = Math.abs(n);
				
				if(n > 2) {
					frac = ((n|0) - 1)&((1<<23) - 1);
					bits = exp = Math.log(frac)/Math.LN2;
					n -= n<<1;
				}
				
				while(n < 2 && bits < 23) {
					frac <<= 1;
					n *= 2;
					frac |= n%2;
					--exp;
					++bits;
				}
				
				exp += 127;
				
				data[0] = (sign << 7) | (exp >> 1);
				data[1] = ((exp & 1) << 7) | (frac >> 16);
				data[2] = (frac >> 8) & 0xff;
				data[3] = frac & 0xff;
			}
			else if(t == 'd') {
				var
					sign = (n < 0),
					exp = 0,
					frac = 0,
					bits = 12,
					byte = 2;
				n = Math.abs(n);
				
				while(n > 2) {
					n /= 2;
					++exp;
				}
				
				while(n) {
					n *= 2;
					frac <<= 1;
					frac |= n%2;
					n -= n%2;
					--exp;
					
					if(++bits == 12) {
						data[byte++] = frac & 0xff;
						frac >>= 8;
						bits -= 8;
					}
				}
				
				exp += 1023;
				
				data[0] = (sign << 7) | (exp >> 4);
				data[1] = (exp & 0xf) | frac;
			}
		}
		else if(typeof n == "string") {
			for(var j = size; j > n.length; --j) {
				s += '\0';
			}
			
			s += n;
		}
		else if(typeof n.length != "undefined") {
			for(var j = size; j > n.length; --j) {
				s += '\0';
			}
			
			for(var k = 0; k < j; ++k) {
				s += String.fromCharCode(data[k]);
			}
		}
		else {
			throw new Error("Bad data type");
		}
	}
	
	/**
	 * Abstract structure definition, used for interacting with binary data.
	**/
	function Struct(defs) {
		var off = 0, sizes = [], offs = [], i = 0;
		
		if(defs[0] == "<") {
			this.endian = 0;
			++i;
		}
		else if(defs[0] == ">") {
			this.endian = 1;
			++i;
		}
		else {
			this.endian = 0;
		}
		
		this.def = defs.slice(i).replace(
			/(\d+)?([cbB?hHiIlLfd])/g,
			function($0, $1, $2) {
				return repeat($2, +$1);
			}
		).replace(/[^xcbB?hHiIlLqQfd]/g, "");
	}
	
	/**
	 * Pack the data in JS's native string type.
	**/
	Struct.prototype.ucs2pack = function(data) {
		if(data.length != this.def.length) {
			throw new Error("Struct data length mismatch");
		}
		
		var s = "", code = 0, aligned = true;
		
		for(var i = 0; i < data.length; ++i) {
			var n = data[i];
			
			var size = {
				c: 1,
				b: 1,
				B: 1,
				"?": 1
				h: 2,
				H: 2,
				i: 4,
				I: 4,
				l: 8,
				L: 8
			}[this.def[i]];
			
			
		}
		
		return s;
	}
	Struct.prototype.pack = function(data) {
		if(data.length != this.def.length) {
			throw new Error("Struct data length mismatch");
		}
		
		var s = "";
		
		for(var i = 0; i < data.length; ++i) {
			var n = data[i];
			
			if(typeof n == "number") {
				var stack = [];
				for(var j = this.sizes[i]; j > 0; --j) {
					stack.push(n & 0xff);
					n >>= 8;
				}
				
				while(stack.length) {
					s += String.fromCharCode(stack.pop());
				}
			}
			else if(typeof n == "string") {
				s += n;
			}
			else if(n instanceof BigInteger) {
				var data = n.toByteArray();
				
				for(var j = this.sizes[i]; j > data.length; --j) {
					s += '\0';
				}
				
				for(var j = Math.max(0, this.sizes[i] - data.length); j < data.length; ++j) {
					s += String.fromCharCode(data[j]);
				}
			}
			else if(typeof n.length != "undefined") {
				for(var j = this.sizes[i]; j > n.length; --j) {
					s += '\0';
				}
				
				for(var k = 0; k < j; ++k) {
					s += String.fromCharCode(data[k]);
				}
			}
			else {
				throw new Error("Bad data type");
			}
		}
		
		return s;
	}
	Struct.prototype.unpack = function(data) {
		var out = [];
		for(var i = 0; i < this.offs.length; ++i) {
			var off = this.offs[i];
			
			if(this.sizes[i] > 4) {
				var num = new BigInteger(0);
				
				for(var j = 0; j < this.sizes[i]; ++j) {
					num.bitwiseTo(data.charCodeAt(off + j), op_or, num);
					num.lShiftTo(8, num);
				}
			}
			else{
				var num = 0;
				
				for(var j = 0; j < this.sizes[i]; ++j) {
					num |= data.charCodeAt(off + j);
					num <<= 8;
				}
			}
			
			out.push(num);
		}
		
		if(i < data.length) {
			out.push(data.slice(i));
		}
		
		return out;
	}
	
	return Struct;
})();

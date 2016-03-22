var Stream = (function() {
	'use strict';
	
	function Stream() {
		this.cache = "";
		this.todo = [];
		this.onerror = function() {};
		this.data = null;
	}
	Stream.prototype._update = function() {
		var otodo = this.todo;
		
		while(this.cache.length >= otodo[0].bytes) {
			var
				todo = otodo.unshift(),
				nb = this.cache.slice(0, todo.bytes);
			
			this.cache = this.cache.slice(todo.bytes);
			this.todo = [];
			
			this.data = todo.next.call(this, nb);
			
			otodo.splice(0, 0, this.todo);
		}
		
		this.todo = otodo;
	}
	Stream.prototype.next = function(bytes, next) {
		this.todo.push({bytes: bytes, next: next});
		
		this._update();
		
		return this;
	}
	Stream.prototype.push = function(bytes) {
		this.cache += bytes;
		
		this._update();
		
		return this;
	}
	Stream.prototype.fail = function(fail) {
		this.onerror = fail;
		
		return this;
	}
	Stream.prototype.promise = function() {
		return new Promise(function(resolve, reject) {
			this.
				next(0, function(x, y, data) {
					resolve(data);
				}).
				fail(reject);
		});
	}
	
	return Stream;
})();

/**
 * Utility class for managing convoluted state dependencies. Calls fulfilled
 *  when all the conditions are met, and broken when it was previously
 *  fulfilled but invalidated.
**/
var Conditional = (function() {
	'use strict';
	
	function Conditional(conds, fulfilled, broken) {
		var cond = {};
		for(var i = 0; i < conds.length; ++i) {
			cond[conds[i]] = false;
		}
		this.cond = cond;
		this.fulfilled = fulfilled;
		this.broken = broken;
		this.done = false;
	}
	Conditional.prototype.set = function(cond, on) {
		this.cond[cond] = on;
		if(this.done && !on) {
			this.broken();
			return;
		}
		
		for(var c in cond) {
			if(!cond[c]) {
				return;
			}
		}
		
		this.done = true;
		this.fulfilled();
	}
	
	return Conditional;
})();

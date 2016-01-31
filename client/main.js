var player=(function(){
	'use strict';
	
	$(document).ready(function(){
		player.video=$("#player video")[0];
		player.volumeIcon=$("#mute")[0];
		player.volumeFill=$("#volume-fill")[0];
		player.watchedTime=$(".time #watched-time")[0];
		player.durationTime=$(".time #duration-time")[0];
		player.playButton=$("#controls #play")[0];
		player.timeBar=$("progress#timebar")[0];
		player.manualProgress=$("#timebar #progress")[0];
		
		player.timeBar.max=1;
		
		var vid=player.video;
		
		vid.addEventListener("timeupdate",function(){
			player.seek(this.currentTime/vid.duration);
		});
		
		vid.addEventListener("loadedmetadata",function(){
			player.durationTime.textContent=format_time(this.duration);
		});
		
		vid.addEventListener("ended",function(){
			player.videoDone();
		});
		
		player.rawSeek();
		
		$(".tabs li").click(function(){
			$(".tabs li, #omnipanel section").removeClass("active");
			this.className="active";
			$("#omnipanel #"+this.id+"-panel").addClass("active");
		});
	});
	
	function start_animating(self){
		requestAnimationFrame(function do_frame(){
			self.rawSeek();
			
			if(!self.video.paused){
				requestAnimationFrame(do_frame);
			}
		});
	}
	
	//Format the given number in seconds to an HH:MM:SS.mm timestamp
	function format_time(time){
		var h,m,s;
		h=(time/360)|0;time%=360;
		m=(time/60)|0;time%=60;
		s=time|0;
		
		return (h?h+":":"")+(m>=10?m:"0"+m)+":"+(s>=10?s:"0"+s);
	}
	
	return {
		seeking:0,
		video:null,
		volumeIcon:null,
		volumeFill:null,
		manualProgress:null,
		timeBar:null,
		playButton:null,
		debug:{
			format_time:format_time
		},
		getVolumeIcon(){
			if(this.video.volume<1/16 || this.video.muted){
				return "glyphicon glyphicon-volume-off";
			}
			
			if(this.video.volume<1/2){
				return "glyphicon glyphicon-volume-down";
			}
			
			return "glyphicon glyphicon-volume-up";
		},
		prev:function(){
		},
		rewind:function(){
		},
		pauseplay:function(){
			if(this.video.paused){
				this.video.play();
				start_animating(this);
				this.playButton.className="glyphicon glyphicon-pause";
			}
			else{
				this.video.pause();
				this.playButton.className="glyphicon glyphicon-play";
			}
		},
		videoDone:function(){
			this.playButton.className="glyphicon glyphicon-repeat";
		},
		fast:function(){
		},
		next:function(){
		},
		htmlSeek:function(e,self){
			this.seek(e.offsetX/self.clientWidth);
		},
		//Used to prevent layout thrashing by buffering seekbar animations to
		// animation frames
		rawSeek:function(){
			this.timeBar.value=this.seeking;
			this.manualProgress.style.width=(this.seeking*100).toFixed(2)+"%";
			this.watchedTime.textContent=format_time(this.seeking*this.video.duration);
		},
		seek:function(to){
			this.seeking=to;
		},
		mute:function(){
			if(this.video.muted=!this.video.muted){
				this.volumeFill.setAttribute("fill","url(#desat)");
			}
			else{
				this.volumeFill.setAttribute("fill","url(#color)");
			}
			this.volumeIcon.className=this.getVolumeIcon();
		},
		volume:function(self,e,click){
			if((e.buttons&1) || click){
				var vol=e.offsetX/self.clientWidth;
				if(vol<0){
					vol=0;
				}
				else if(vol>1){
					vol=1;
				}
				
				this.video.volume=vol;
				this.volumeFill.setAttribute("d","M 0,1 L "+2*vol+",1 L "+2*vol+","+(1-vol)+" z")
				
				this.volumeIcon.className=this.getVolumeIcon();
			}
		},
		fullscreen:function(){
			var video=this.video;
			if(video.requestFullscreen){
				video.requestFullscreen();
			}
			else if(video.mozRequestFullScreen){
				video.mozRequestFullScreen();
			}
			else if(video.webkitRequestFullscreen){
				video.webkitRequestFullscreen();
			}
		}
	};
})();

function dislike(btn){
	$(btn).toggleClass("glyphicon-minus glyphicon-minus-sign");
}

function like(btn){
	$(btn).toggleClass("glyphicon-plus glyphicon-plus-sign");
}

function favorite(btn){
	$(btn).toggleClass("glyphicon-heart-empty glyphicon-heart");
}

function swirly_merge(swirls){
	var total=0,dump_x=new Array(64),dump_y=new Array(64);
	for(var i=0;i<weights.length;++i){
		total+=weights[i];
	}
	
	for(var i=0;i<swirls.length;++i){
		for(var d=0;d<64;++d){
			dump_x[d]+=Math.cos(swirls[i]*Math.PI/(180*256));
			dump_y[d]+=Math.sin(swirls[i]*Math.PI/(180*256));
		}
	}
	
	var vec=new Uint8Array(64),n=swirls.length;
	for(var d=0;d<64;++d){
		vec[d]=Math.atan2(dump_y[d]/n,dump_x[d]/n);
	}
	
	return vec;
}

function swirly_step(from,to,by){
	
}

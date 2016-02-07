//Format the given number in seconds to an HH:MM:SS.mm timestamp
function format_time(time){
	var h,m,s;
	h=(time/360)|0;time%=360;
	m=(time/60)|0;time%=60;
	s=time|0;
	
	return (h?h+":":"")+(m>=10?m:"0"+m)+":"+(s>=10?s:"0"+s);
}

var quality={
	SIZE:32,
	random:function(){
		var vec=new Uint8Array(this.SIZE);
		for(var i=0;i<this.SIZE;++i){
			vec[i]=Math.random()*256;
		}
		
		return vec;
	},
	merge:function(swirls){
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
	point_dist:function(a,b){
		var d=Math.abs(a-b)%128;
		
		return d*d;
	},
	distance:function(a,b){
		var dist=0;
		for(var i=0;i<64;++i){
			dist+=this.point_dist(a[i],b[i]);
		}
		
		return dist;
	},
	step:function(from,to,by){
		for(var i=0;i<64;++i){
			from[i]+=Math.min(by,quality_point_distance(from[i],to[i]))*
				(Math.abs(from[i]-to[i])>128?1:-1)*
				(from[i]>to[i]?1:-1);
		}
	}
};

$(document).ready(function(){
	///Player code
	requestAnimationFrame(function eternal_animate(){
		if(volume_updated){
			redraw_volume();
			volume_updated=false;
		}
		
		if(time_previewing){
			var tbw=$timeBar.width(),left=time_preview*tbw;
			
			$seekTime.text(format_time(time_preview*$video[0].duration));
			
			var seekw=$seekTime.width();
			if(left<seekw/2+5){
				left=0;
			}
			else if(left>tbw-seekw/2-2){
				left=tbw-seekw-5;
			}
			else{
				left-=seekw/2+3;
			}
			
			$seekTime.css("left",left+"px");
		}
		
		requestAnimationFrame(eternal_animate);
	});
	
	var $timeBarContainer=$("#timebar"),
		$timeBar=$("#timebar progress"),
		$manualTimeBar=$("#timebar #progress"),
		$seekTime=$("#seektime"),
		manseeking=false,
		manseek_oldstate=false,
		time_previewing=false,
		time_preview=0;
	$timeBarContainer.
		click(function(e){
			$video[0].currentTime=e.offsetX/this.clientWidth*$video[0].duration;
			start_animation();
			if($("#play").hasClass("glyphicon-repeat")){
				$("#play").toggleClass("glyphicon-repeat glyphicon-play");
			}
		}).
		mousedown(function(e){
			manseeking=true;
			manseek_oldstate=!$video[0].paused;
			$video[0].pause();
			$player.addClass("config-control-lock");
			document.body.className="no-select";
			start_animation();
			
			if($("#play").hasClass("glyphicon-repeat")){
				$("#play").toggleClass("glyphicon-repeat glyphicon-play");
			}
		}).
		mousemove(function(e){
			time_preview=(e.clientX-$(this).offset().left)/$(this).width();
		}).
		mouseover(function(){
			time_previewing=true;
		}).
		mouseout(function(){
			time_previewing=false;
		});
	
	var $watchedTime=$("#time-text #watched-time"),
		$durationTime=$("#time-text #duration-time"),
		$volume=$("#volume canvas"),
		$player=$("#player"),
		volume_updated=false;
	function start_animation(){
		var timestamp=0;
		requestAnimationFrame(function animate(now){
			var cur=$video[0].currentTime,seeking=cur/$video[0].duration;
			$timeBar.val(seeking);
			$manualTimeBar.css('width',seeking*100+"%");
			
			if(now-timestamp>1000){
				$watchedTime.text(format_time(cur));
				timestamp=now-(now-timestamp)%1000;
			}
			
			if(!$video[0].paused || manseeking){
				requestAnimationFrame(animate);
			}
		});
	}
	
	var $video=$("#player video").
		on('loadedmetadata',function(){
			$watchedTime.text(format_time(0));
			$durationTime.text(format_time(this.duration));
		}).
		on('ended',function(){
			$("#play").attr('class',"glyphicon glyphicon-repeat");
		});
	
	var $mute=$("#mute").click(function(){
		$video[0].muted=!$video[0].muted;
		volume_updated=true;
	});
	
	function redraw_volume(){
		var w=36,h=18,vid=$video[0],
			muted_style='rgba(100,100,100,0.8)',
			unmuted_style='rgba(197,204,215,0.8)';
			neg_space='rgba(10,10,10,0.8)';
		
		var vol=vid.volume,
			ctx=$volume[0].getContext("2d"),
			gradient=ctx.createLinearGradient(0,0,w*vol,0);
		
		ctx.clearRect(0,0,w,h);
		ctx.fillStyle=$video[0].muted?muted_style:unmuted_style;
		
		var bars=6,spacing=1,barw=w/bars-spacing,vpb=1/bars;
		for(var b=0;b<bars;++b){
			var x=b*(barw+spacing);
			if(vol<vpb){
				var barh=(x+barw)*vol*3;
				ctx.fillRect(x,h-barh,barw,barh);
				
				ctx.fillStyle=neg_space;
				ctx.fillRect(x,h-(x+barw)/2,barw,(x+barw)/2-barh);
				break;
			}
			else{
				ctx.fillRect(x,h-((x+barw)>>1),barw,(x+barw)/2);
				vol-=1/bars;
			}
		}
		
		for(++b;b<bars;++b){
			var x=b*(barw+spacing);
			ctx.fillRect(x,h-(x+barw)/2,barw,(x+barw)/2);
		}
		
		if(vid.volume==0 || vid.muted){
			$mute.attr('class',"glyphicon glyphicon-volume-off");
		}
		else if(vid.volume<1/2){
			$mute.attr('class',"glyphicon glyphicon-volume-down");
		}
		else{
			$mute.attr('class',"glyphicon glyphicon-volume-up");
		}
	}
	
	function handle_volume(e){
		var vol=(e.clientX-$volume.offset().left)/$volume.width();
		if(vol<0){
			vol=0;
		}
		else if(vol>1){
			vol=1;
		}
		
		$video[0].volume=vol;
		volume_updated=true;
	}
	
	var changing_volume=false;
	$("#volume canvas").
		click(function(e){
			handle_volume(e);
		}).
		mousedown(function(e){
			if(e.buttons&1){
				changing_volume=true;
				$player.addClass("config-control-lock");
			}
		}).
		mousemove(function(e){
			if(e.buttons&1){
				handle_volume(e);
			}
		});
	
	$(document).
		mousemove(function(e){
			if(changing_volume){
				handle_volume(e);
			}
			
			if(manseeking){
				var seek=(e.clientX-$timeBar.offset().left)/$timeBar.width();
				if(seek<0){
					seek=0;
				}
				else if(seek>1){
					seek=1;
				}
				
				$video[0].currentTime=seek*$video[0].duration;
			}
		}).
		mouseup(function(e){
			if(e.button==0){
				changing_volume=false;
				
				if(manseeking){
					manseeking=false;
					if(manseek_oldstate){
						$video[0].play();
					}
				}
				
				document.body.className="";
				$player.removeClass("config-control-lock");
			}
		});
	
	$("#play, video").click(function(){
		var vid=$video[0];
		if(vid.ended){
			$("#play").toggleClass("glyphicon-pause glyphicon-repeat");
			vid.currentTime=0;
			vid.play();
			start_animation();
		}
		else{
			var $play=$("#play").
				removeClass("glyphicon-repeat glyphicon-pause glyphicon-play");
				 
			if(vid.paused){
				vid.play();
				start_animation();
				$play.toggleClass("glyphicon-pause");
			}
			else{
				vid.pause();
				$play.toggleClass("glyphicon-play");
			}
		}
	});
	
	$("#fullscreen").click(function(){
		var vid=$video[0];
		
		if(vid.requestFullscreen){
			vid.requestFullscreen();
		}
		else if(vid.msRequestFullscreen){
			vid.msRequestFullscreen();
		}
		else if(vid.mozRequestFullScreen){
			vid.mozRequestFullScreen();
		}
		else if(vid.webkitRequestFullscreen){
			vid.webkitRequestFullscreen();
		}
	});
	
	$(".tabs li").click(function(){
		$(".tabs li, #omnipanel section").removeClass("active");
		this.className="active";
		$("#omnipanel #"+this.id+"-panel").addClass("active");
	});
	
	var $searchbar=$("#search input");
	
	///Non-player buttons

	$("#subscribe").click(function(){
		$(this).toggleClass("glyphicon-star-empty glyphicon-star");
	});
	
	$("#dislike").click(function(){
		$(this).toggleClass("glyphicon-minus glyphicon-minus-sign");
	});

	$("#like").click(function(){
		$(this).toggleClass("glyphicon-plus glyphicon-plus-sign");
	});

	$("#favorite").click(function(){
		$(this).toggleClass("glyphicon-heart-empty glyphicon-heart");
	});
	
	var $searchbar=$("#search input");
	function addSearch(text){
		if($searchbar[0].value){
			$searchbar[0].value+=" "+text;
		}
		else{
			$searchbar[0].value=text;
		}
	}
	
	function doSearch(text){
		
	}
	
	$("#search-current").click(function(){
		addSearch("#current");
	});
	
	$("#search-mine").click(function(){
		addSearch("#mine");
	});
	
	$("#search-trending").click(function(){
		addSearch("#trending");
	});
	
	$("#search-hot").click(function(){
		addSearch("#hot");
	});
	
	$("#search-liked").click(function(){
		addSearch("#liked");
	});
	
	$("#search-random").click(function(){
		addSearch("#random");
	});
	
	///This should be executed last
	redraw_volume();
	
	var vid=$video[0];
	if(!(vid.requestFullscreen || vid.msRequestFullscreen || vid.mozRequestFullScreen || vid.webkitRequestFullscreen)){
		$("#fullscreen").css('display','none');
	}
});

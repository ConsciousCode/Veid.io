(function(defs, root) {
	'use strict';
	var
		buffer = document.createElement("canvas"),
		PHTT = new Uint8Array(256),
		zero;
	
	PHTT[zero = (Math.random()*256)|0] = 0;
	for(var n = 0; n < 256; ++n) {
		var i = (Math.random()*256)|0;
		for(;PHTT[i] || i == zero; i = (i + 1)%256) {}
		
		PHTT[i] = n;
	}
	
	//Perform an insecure but fast hash to compare frames (Pearson)
	function summarize_frame(vid) {
		var
			w = buffer.width = vid.videoWidth,
			h = buffer.height = vid.videoHeight,
			ctx = buffer.getContext("2d");
		
		ctx.drawImage(vid, 0, 0, w, h);
		var
			px = ctx.getImageData(0, 0, w, h).data,
			summary = 0;
		
		for(var j = 0; j < 4; ++j) {
			for (var h = j, i = 0; i < px.length; ++i) {
				h = PHTT[h ^ px[i]];
			}
			summary = (summary<<8) | h;
		}
		
		return summary;
	}
	
	function tag(name, attrs, content) {
		var e = document.createElement(name);
		for(var attr in attrs) {
			e.setAttribute(attr, attrs[attr]);
		}
		for(var i = 0; i < content.length; ++i) {
			if(typeof content[i] == "string") {
				e.appendChild(document.createTextNode(content[i]));
			}
			else {
				e.appendChild(content[i]);
			}
		}
		
		return e;
	}
	
	function div(klass, attrs, content) {
		if(klass) {
			attrs["class"] = klass;
		}
		
		return tag("div", attrs, content);
	}
	
	/** @const **/
	var volw = 36, volh = 18,
		volbars = 6, volspacing = 1,
		muted_style = 'rgba(100,100,100,0.8)',
		unmuted_style = 'rgba(197,204,215,0.8)',
		neg_space = 'rgba(10,10,10,0.8)';
	
	var video, mute, timebar_container, timebar, manual_timebar, seektime,
		volume, volume_canvas, watched_time, duration_time, play, fullscreen,
		player = tag('div', {class: "player"}, [
			tag('style', {}, [
				'@import "css/font-awesome.min.css";'+
				'@import "css/util.css";'+
				'@import "css/player.css";'
			]),
			tag('noscript', {}, [
				tag('h3', {}, ["This player requires JavaScript to be enabled."])
			]),
			video = tag('video', {
				preload: "metadata",
				crossorigin:"anonymous"
			}, []),
			div('controls no-select', {}, [
				timebar_container = div('timebar', {}, [
					timebar = tag('progress', {max: 1}, [
						manual_timebar = div('progress', {}, [])
					]),
					seektime = div('seektime', {}, [])
				]),
				div('control-buttons flex-between', {}, [
					div('flex-around', {}, [
						div('time-text flex-around', {}, [
							watched_time = tag(
								'span', {class: "watched-time"}, ["00:00"]
							),
							" / ",
							duration_time = tag(
								'span', {class: "duration-time"}, ["00:00"]
							)
						]),
						play = tag('button',
							{class: "play fa fa-fw fa-play"}, []
						)
					]),
					div('flex-around', {}, [
						mute = tag('button',
							{class: "mute fa fa-fw fa-volume-up"}, []
						),
						volume = tag('button', {class: "volume"}, [
							volume_canvas =
								tag('canvas', {width: volw, height: volh}, [])
						]),
						fullscreen = tag('button', {
							class: "fullscreen fa fa-fw fa-arrows-alt"
						}, [])
					])
				])
			])
		]);
	
	var changing_volume = false,
		manseeking = false,
		manseek_oldstate = false,
		hover = false;
	
	mute.addEventListener("click", function() {
		video.muted = !video.muted;
		redraw_volume();
	});
	
	function redraw_volume(){
		if(!hover) {
			return;
		}
		
		var vol = video.volume,
			ctx = volume_canvas.getContext("2d"),
			gradient = ctx.createLinearGradient(0, 0, volw*vol, 0);
		
		ctx.clearRect(0, 0, volw, volh);
		ctx.fillStyle=video.muted?muted_style:unmuted_style;
		
		var barw = volw/volbars - volspacing, vpb = 1/volbars;
		for(var b = 0; b < volbars; ++b){
			var x = b*(barw + volspacing);
			if(vol < vpb){
				var barh=(x + barw)*vol*3;
				ctx.fillRect(x, volh - barh, barw, barh);
				
				ctx.fillStyle = neg_space;
				ctx.fillRect(
					x, volh - (x + barw)/2, barw, (x + barw)/2 - barh
				);
				break;
			}
			else{
				ctx.fillRect(x, volh - ((x + barw)>>1), barw, (x + barw)/2);
				vol -= 1/volbars;
			}
		}
		
		for(++b; b < volbars; ++b){
			var x = b*(barw + volspacing);
			ctx.fillRect(x, volh - (x + barw)/2, barw, (x + barw)/2);
		}
		
		if(video.volume == 0 || video.muted){
			mute.className = "fa fa-fw fa-volume-off";
		}
		else if(video.volume < 1/2){
			mute.className = "fa fa-fw fa-volume-down";
		}
		else{
			mute.className = "fa fa-fw fa-volume-up";
		}
	}
	
	function offset_left(e) {
		return e.getBoundingClientRect().left +
			window.pageXOffset - document.documentElement.clientLeft;
	}
	
	timebar_container.addEventListener("click", function(e) {
		if(e.button == 0) {
			video.currentTime =
				(e.clientX - offset_left(this))/this.clientWidth*video.duration;
			play_animation();
			if(video.ended) {
				play.className = "play fa fa-fw fa-play";
			}
		}
	});
	timebar_container.addEventListener("mousedown", function(e) {
		if(e.button == 0) {
			manseeking = true;
			manseek_oldstate = !video.paused;
			video.pause();
			player.className = "player control-lock";
			document.body.className = "no-select";
			play_animation();
			
			play.className = "play fa fa-fw fa-play";
		}
	});
	timebar_container.addEventListener("mousemove", function(e) {
		var
			time_preview = (e.clientX - offset_left(this))/this.clientWidth,
			tbw = timebar.offsetWidth,
			left = time_preview*tbw,
			seekw = seektime.offsetWidth;
		
		if(left < seekw/2 - 6) {
			left = 0;
		}
		else if(left > tbw - seekw/2 - 6) {
			left = tbw - seekw;
		}
		else {
			left -= seekw/2 + 1;
		}
		
		left = (Math.round(left)|0) + "px";
		
		//DOM writes are expensive, make sure they're needed
		if(seektime.style.left != left) {
			seektime.style.left = left;
			seektime.textContent =
				format_time(time_preview*video.duration);
		}
	});
	timebar_container.addEventListener("mouseover", function(e) {
		redraw_volume();
	});
	
	function play_animation(){
		var timestamp = 0;
		requestAnimationFrame(function animate(now){
			var cur = video.currentTime, seeking = cur/video.duration;
			timebar.value = seeking;
			manual_timebar.style.width = seeking*100 + "%";
			
			if(now - timestamp > 1000){
				watched_time.textContent = format_time(cur);
				timestamp = now - (now - timestamp)%1000;
			}
			
			if(!video.paused || manseeking){
				requestAnimationFrame(animate);
			}
		});
	}
	
	video.addEventListener("loadedmetadata", function() {
		watched_time.textContent = format_time(0);
		duration_time.textContent = format_time(this.duration);
	});
	
	var testing_frame = false, last_frame_summary, skip;
	function skip_frames(lskip) {
		video.pause();
		if(!testing_frame) {
			testing_frame = true;
			last_frame_summary = summarize_frame(video);
			skip = lskip;
			video.currentTime += lskip/60;
		}
	}
	video.addEventListener("mouseover", function() {
		hover = true;
		redraw_volume();
	});
	video.addEventListener("mouseout", function() {
		hover = false;
	});
	video.addEventListener("timeupdate", function() {
		if(testing_frame) {
			var  cur = summarize_frame(video);
			
			if(last_frame_summary == cur) {
				last_frame_summary = cur;
				video.currentTime += skip/60;
			}
			else {
				testing_frame = false;
			}
		}
	});
	video.addEventListener("ended", function() {
		play.className = "fa fa-fw fa-repeat";
	});
	
	function handle_volume(e){
		var vol = (e.clientX - offset_left(volume))/volume.clientWidth;
		if(vol < 0) {
			vol = 0;
		}
		else if(vol > 1) {
			vol = 1;
		}
		
		video.volume = vol;
		redraw_volume();
	}
	
	volume_canvas.addEventListener("click", function(e) {
		handle_volume(e);
	});
	volume_canvas.addEventListener("mousedown", function(e) {
		if(e.buttons&1){
			changing_volume = true;
			player.className = "player control-lock";
		}
	});
	volume_canvas.addEventListener("mousemove", function(e) {
		if(!manseeking && (e.buttons&1)){
			handle_volume(e);
		}
	});
	
	document.addEventListener("mousemove", function(e) {
		if(changing_volume){
			handle_volume(e);
		}
		
		if(manseeking){
			var seek = (e.clientX - offset_left(timebar))/timebar.clientWidth;
			if(seek < 0){
				seek = 0;
			}
			else if(seek > 1){
				seek = 1;
			}
			
			video.currentTime = seek*video.duration;
		}
	})
	document.addEventListener("mouseup", function(e) {
		if(e.button == 0){
			changing_volume = false;
			
			if(manseeking){
				manseeking = false;
				if(manseek_oldstate){
					video.play();
				}
			}
			
			document.body.className="";
			player.className = "player";
			play.className = "play fa fa-fw fa-p" +
				(video.paused?"lay":"ause");
		}
	});
	
	document.addEventListener("keydown", function(e) {
		switch(e.keyCode) {
			//Left
			case 37:
				skip_frames(-1);
				break;
			//Right
			case 39:
				skip_frames(1);
				break;
			//Up
			case 38:
				try {
					video.volume += 1/50;
				}
				catch(e) {}
				break;
			//Down
			case 40:
				try {
					video.volume -= 1/50;
				}
				catch(e) {}
				break;
			default:
				return false;
		}
		
		e.preventDefault();
		return true;
	}, true);
	
	function toggle_video(){
		if(video.paused || video.ended){
			play.className = "play fa fa-fw fa-pause";
			video.play();
			play_animation();
		}
		else{
			play.className = "play fa fa-fw fa-play";
			video.pause();
		}
	}
	
	play.addEventListener("click", toggle_video);
	video.addEventListener("click", toggle_video);
	
	var requestFullscreen = (function() {
		if(video.requestFullscreen){
			return function(vid) {
				vid.requestFullscreen();
			}
		}
		else if(video.msRequestFullscreen){
			return function(vid) {
				vid.msRequestFullscreen();
			}
		}
		else if(video.mozRequestFullScreen){
			return function(vid) {
				vid.mozRequestFullScreen();
			}
		}
		else if(video.webkitRequestFullscreen){
			return function(vid) {
				vid.webkitRequestFullscreen();
			}
		}
		else {
			fullscreen.style.display = "none";
		}
	})();
	
	fullscreen.addEventListener("click", function() {
		requestFullscreen(this);
	});
	
	redraw_volume();
	
	for(var type in defs) {
		video.appendChild(tag('source', {
			src: defs[type],
			type: type
		}, []));
	}
	
	var object = div("", {id: "player"}, []), shadow;
	if(object.createShadowRoot && (shadow = object.createShadowRoot())) {
		shadow.appendChild(player);
	}
	else {
		object.appendChild(player);
	}
	
	root.appendChild(object);
	
	window.vid = video;
})({
	"video/mp4": "http://vjs.zencdn.net/v/oceans.mp4",
	"video/webm": "http://vjs.zencdn.net/v/oceans.webm"
}, document.body);

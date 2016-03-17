var tdoc = "";

process.stdin.setEncoding('utf8');

process.stdin.on('readable', function() {
	var chunk = process.stdin.read();
	if (chunk !== null) {
		doc += chunk;
	}
});

function container(tag, ctx) {
	for(var i = 1; i < tag.pos.length; + + i) {
		inner += '<div>' + tag.pos[i].visit(ctx) + '</div>';
	}
	
	return '<div' + attrs(tag, {
		class: "-crs-" + tag.get(0).toLowerCase()
	}) + '>' + inner + '</div>';
}

function htmlify(text) {
	return text.replace(/<&>'"/g, function($0) {
		return {
			"<": "&lt;",
			"&": "&amp;",
			">": "&gt;",
			"'": "&apos;",
			'"': "&quot;"
		}[$0];
	});
}

var ts = {
	image: new snow.Tagdef(["src", "alt"]),
	script: new snow.Tagdef(["src"]),
	button: new snow.Tagdef(["..."]),
	input: new snow.Tagdef(["placeholder"]),
	list: new snow.Tagdef(),
	link: new snow.Tagdef(["src", "..."]),
	p: new snow.Tagdef(["..."]),
	line: new snow.Tagdef(),
	noscript: new snow.Tagdef(["..."])
};

function make_tag(tag, ctx) {
	switch(tag.get(0).toLowerCase()) {
		case "rows":
		case "cols":
		case "overlay":
		case "span":
			return container(tag, ctx);
		case "image":
			return '<img src="' + tag.get("src").visit(ctx) + '"' +
				attrs(tag) + '/>';
		case "script":
			return '<script src="' + tag.get("src").visit(ctx) + '"></script>';
		case "button":
			return '<button' + attrs(tag) + '>' + tag.get('...').visit(ctx) +
				'</button>';
		case "list":
			return '<ul' + attrs(tag) + '>' + tag.pos.slice(1).map(function(v) {
				return "<li>" + v.visit(ctx) + "</li>";
			}).join("") + "</ul>";
		case "link":
			return '<a href="' + tag.get("src").visit(ctx) + '"' +
				attrs(tag) + '>' + tag.get('...').visit(ctx) + '</a>';
		case "p":
			return '<p' + attrs(tag) + '>' + tag.get("...").visit(ctx) + '</p>';
		case "line":
			return '<br/>';
		case "noscript":
			return '<noscript>' + tag.get('...').visit(ctx) + "</noscript>";
		
		default:
			return "ERROR";
	}
}

process.stdin.on('end', function() {
	var
		normal = {
			visit_doc: function(doc) {
				var styles = doc.get("styles"),
					scripts = doc.get("scripts"),
					title = doc.get("title");
				
				var html = '<!DOCTYPE html><html><head>' +
					'<meta http-equiv="Content-Type" ' +
					'content="text/html; charset=UTF-8"/>' +
					'<script>var dyn = {}</script>';
				
				if(title) {
					html += "<title>" + title.visit(this) + "</title>";
				}
				
				for(var style of styles) {
					html += '<link rel="stylesheet" href="'+
						style.visit(this) + '"/>';
				}
				
				for(var script of scripts) {
					html += '<script src="' + script.visit(this) + '"/>';
				}
				
				return html + '</body></html>';
			},
			visit_tag: function(tag) {
				return ref(make_tag(tag, this), tag);
			},
			visit_text: function(text) {
				return htmlify(text);
			},
			visit_section: function(sec) {
				var content = "";
				for(var e of sec) {
					if(e
					content += sec.visit(this);
				}
				
				return content;
			}
		},
		sec_ctx: {
			visit_tag: function(tag) {
				if(is_content(tag.get(0))) {
					return normal.visit_tag(tag);
				}
				else {
					return "ERROR";
				}
			},
			visit_text: function(text) {
				return htmlify(text);
			}
		};
	
	process.stdout.write(new snow.Parser(ts).parse(tdoc).visit(normal));
});


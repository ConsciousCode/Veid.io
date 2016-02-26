'use strict';

var express = require("express"),
	mysql = require("mysql"),
	multipart = require("connect-multiparty");

var app = express(),
	sql = mysql.createConnection({
		host: 'localhost',
		user: 'root',
		password: 'PIrates314',
		database: 'veidio'
	});

app.get("/login!", function(req, res) {
	sql.connect();
	sql.query("SELECT * FROM users WHERE username=?",
		[req.query.username],
		function(err, rows) {
			if(rows.length) {
				res.send(JSON.stringify({
					username: rows[0].username,
					public: btoa(rows[0].public),
					nonce: btoa(rows[0].nonce),
					private: btoa(rows[0].private)
				}));
			}
			else {
				res.send();
			}
		}
	);
	sql.end();
});

app.get("/register!", function(req, res) {
	sql.connect();
	sql.query("UPDATE SELECT * FROM users WHERE username=?",
		[req.query.username],
		function(err, rows) {
			if(rows.length) {
				res.send(JSON.stringify({
					username: rows[0].username,
					public: btoa(rows[0].public),
					nonce: btoa(rows[0].nonce),
					private: btoa(rows[0].private)
				}));
			}
			else {
				res.send();
			}
		}
	);
	sql.end();
});

app.get("/user!", function(req, res) {
	
});

app.get("/get!", function(req, res) {
	sql.connect();
	sql.query("SELECT * FROM files WHERE id=?", [req.query.id],
		function(err, rows) {
			res.end(JSON.stringify(rows[0].id));
		}
	);
	sql.end();
});

app.post("/put!", multipart(), function(req, res) {
	new mmm.Magic(mmm.MAGIC_MIME_TYPE).detectFile(req.files[0],
		function(err, mime) {
			if(mime.startsWith("video")) {
				child_process.exec(req.files[0]);
			}
		}
	);
});

var server = app.listen(8080);

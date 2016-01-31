var mysql = require('mysql');
var http = require("http");
var fs = require("fs");

var debug = {
    debug_mode : true,
    log : function () {
        if (this.debug_mode) {
            console.log.apply(console, arguments);
        }
    },
}

/**************************/
/* Initial Setup & Config */
/**************************/
console.log("Loading config");
var config = require('./config.json');

if (typeof config !== "undefined" && typeof config.database === "object") {
    console.log("config loaded");
    debug.debug_mode = config.debug||false;
    debug.log("config: ", config);

    var connection = mysql.createConnection(config.database);
    connection.connect();

    connection.query('SELECT 1 + 1 AS solution', function(err, rows, fields) {
        console.log("Testing database");
        if (err) {
            throw err;
            process.exit();
        }
        if (rows[0].solution == 2) {
            console.log("Connected to database successfully");
        } else {
            console.log("Connected to database ");
            process.exit();
        }
    });
    connection.end();
} else {
    console.log("Error: not configured");
    process.exit();
}

/**************************/
/* Server Page Controlls  */
/**************************/
http.createServer(function (request, response, fd) {
    console.log(request.url);

    var url = request.url;
    if (url == "/")
        url = "/index.html";

    // Load any files that match the request URL
    fs.readFile("static" + url,  function (err, data) {
        debug.log("err: ", err, "\ndata: ", data);
        if (typeof data !== "undefined") {
            response.writeHead(200, {"Content-Type": "text/html"});
            response.write(data);
            response.end();
        } else {
            // 404
            response.writeHead(200, {"Content-Type": "text/html"});
            response.write("<html>\n" +
	            "<head>\n" +
	            "  <title>404 - Page not found</title>\n" +
	            "  <meta charset=\"utf-8\" />\n" +
	            "</head>\n" +
	            "<body>\n" +
	            "  <h2>404 - Page not found</h2>\n" +
	            "</body>\n" +
	            "</html>");
            response.end();
        }
    });
}).listen(8125);


/*********************************/
/* Backend Interaction Contracts */
/*********************************/
// Query a video-agnostic list of the videos with the closest feature vectors to the provided user preference vector
// TODO: implement the actual logic to do this
function queryFromRecommended(preference, number, success, failure) {
    var connection = mysql.createConnection(config.database);
    connection.connect();
    connection.query('SELECT * FROM video', function(err, rows, fields) {
        if (err) {
            failure(err);
        } else {
            success(rows, fields);
        }
    });
    connection.end();
}

// Query the next video of a sequence
// TODO: implement the actual logic to do this
function queryNextVideo(video_id, success, failure) {
    var connection = mysql.createConnection(config.database);
    connection.connect();
    connection.query('SELECT * FROM video', function(err, rows, fields) {
        if (err) {
            failure(err);
        } else {
            success(rows, fields);
        }
    });
    connection.end();
}

// A list of the videos (etc) using the current video as a starting node
// TODO: implement the actual logic to do this
function queryFromRelated(preference, number, current, success, failure) {
    var connection = mysql.createConnection(config.database);
    connection.connect();
    connection.query('SELECT * FROM video', function(err, rows, fields) {
        if (err) {
            failure(err);
        } else {
            success(rows, fields);
        }
    });
    connection.end();
}

// Query a list of videos which match the provided tag automata (??)
// TODO: implement the actual logic to do this
function queryFromTags(preference, number, tags, success, failure) {
    var connection = mysql.createConnection(config.database);
    connection.connect();
    connection.query(
        'SELECT * '
        +'FROM video v, tag t '
        +'WHERE t.tag_id in (' + /* tags + */ ') '
        +'AND v.tag_id = t.id',
        function(err, rows, fields) {
            if (err) {
                failure(err);
            } else {
                success(rows, fields);
            }
        }
    );
    connection.end();
}

// Query the average user preference vector
// TODO: implement the actual logic to do this
function queryAveragePreference(success, failure) {
    var connection = mysql.createConnection(config.database);
    connection.connect();
    connection.query('SELECT * FROM preference', function(err, rows, fields) {
        if (err) {
            failure(err);
        } else {
            success(rows, fields);
        }
    });
    connection.end();
}

// Query the metadata of the provided video, including comments
// TODO: implement the actual logic to do this
function queryMetadata(video_id, success, failure) {
    var connection = mysql.createConnection(config.database);
    connection.connect();
    connection.query('SELECT * FROM metadata', function(err, rows, fields) {
        if (err) {
            failure(err);
        } else {
            success(rows, fields);
        }
    });
    connection.end();
}

// Request a chore for the computer to do which will reward money
//  This is necessary because later on the virtual server will need people to interact with the outside world for it
// TODO: implement the actual logic to do this
function reqChore() {
    return {};
}

// "Uploads" a file (only metadata) - user preference is used to initialize the video’s feature vector
// TODO: implement the actual logic to do this
function uploadFile(preference, video_ipfs_hash, block_hashes, metadata) {
}

//Add a comment
// TODO: implement the actual logic to do this
function addComment(video_id, markdown, user_id, reply_id, success, failure) {
    var connection = mysql.createConnection(config.database);
    connection.connect();
    var post  = {"video_id": video_id, "user_id": user_id, "markdown": markdown, "reply_id": reply_id};
    connection.query('INSERT INTO comment SET ?', post, function(err, rows, fields) {
        if (err) {
            failure(err);
        } else {
            success(rows, fields);
        }
    });
    connection.end();
}


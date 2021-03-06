/*jslint node:true*/
var port = (process.env.VCAP_APP_PORT || 3000);
var express = require("express");
var sentiment = require('sentiment');
var twitter = require('ntwitter');

// make Stream globally visible so we can clean up better
var stream;

var DEFAULT_TOPIC = "Justin Bieber";

// defensiveness against errors parsing request bodies...
process.on('uncaughtException', function (err) {
    console.error('Caught exception: ' + err.stack);
});
process.on("exit", function(code) {
    console.log("exiting with code: " + code);
});

var app = express();
// Configure the app web container
app.configure(function() {
	app.use(express.bodyParser());
    app.use(express.static(__dirname + '/public'));
});

// Sample keys for demo and article - you must get your own keys if you clone this application!
// Create your own app at: https://dev.twitter.com/apps
// See instructions HERE:  https://hub.jazz.net/project/srich/Sentiment%20Analysis%20App/overview
// Look for "To get your own Twitter Application Keys" in the readme.md document
var keys = [
  {
      consumer_key: 'ATsgaOHWl8YseMUyCLt0ZdKK0',
      consumer_secret: 'lNfHnbS4bh68HRYJNcnRLOCg33AbFFAYVdn3twGwXDcJZs7hAA',
      access_token_key: '704702721341988865-nhMjBF7jq0XHIUgVLzkx3OnFKK19KmZ',
      access_token_secret: 'YDodTOKvM4RM11Cw3VNVK7E80VcVyD3dLmNLdTgzIVoWd'
  },
  {
      consumer_key: 'i57UN28xgyIrnjD76AJRk9VDl',
      consumer_secret: 'mN8MbSyht26kKk2fPuZqxaIL9CpXPineafQzhGaAOubQJbfPZY',
      access_token_key: '705115581482008576-7Ve2ThO5nmdT1mgu3SQTI4e7UbpUGRg',
      access_token_secret: 'Xxuv7vgCfBH2J4EwT4BTPTsNUN846Wxri7t3Gb9WZ7P3D'
  },
  {
      consumer_key: 'RFu54Go4kE4zsDspz7QABNmUO',
      consumer_secret: 'r1QNGZbtH2kl2I0ARk4FiSCRFziF5DjykfkCwa5ZuLBLGNoWSZ',
      access_token_key: '705110217504264193-JMRhnOc3ccSmlGkHV9okl4sS1r9ssnM',
      access_token_secret: 'nNxEEMYt59qGz8gKABnIA96Vp0d5ElHioYXavAwMy05v6'
  },
  {
      consumer_key: 'butgdsd1kCPj1ziG1a0JIBREB',
      consumer_secret: 'nQcdYuV95tBYa23BgFmKlUMMbtHCeph9oJaElJiKuErbyfGUf3',
      access_token_key: '705057698140672000-53Qo8AxOvndToxlHhOCbcgouaLshcwM',
      access_token_secret: 'JksMiuz31M2wckglJSMlOPrLSkOJjKHGvT1zLLpwTM0j4'
  },
  {
      consumer_key: 'Kc5XnMicisw1uIUxa3dFPX02o',
      consumer_secret: 'X1bomTxzNgzMrAYwhBcZJtaH8UyhKktMcdcUEIgLi72wIMjE5S',
      access_token_key: '706918075132682240-oOCmLoVBctKYAP0BKpqRHpO6WLEG4EY',
      access_token_secret: 'PdJeg770CFvD8OdQqpfxFGUPnei1IwYN3rrdfmzCUkUjN'
  }
];

var tweeters = [];

for (var i=0; i < keys.length; i++) {
  tweeters.push(new twitter(keys[i]));
}

app.get('/twitterCheck', function (req, res) {
    tweeters[getRandomKeyIndex()].verifyCredentials(function (error, data) {
        res.send("Hello, " + data.name + ".  I am in your twitters.");
    });
});

var tweetCount = 0;
var tweetTotalSentiment = 0;
var monitoringPhrase;

app.get('/sentiment', function (req, res) {
    res.json({monitoring: (monitoringPhrase != null),
    	monitoringPhrase: monitoringPhrase,
    	tweetCount: tweetCount,
    	tweetTotalSentiment: tweetTotalSentiment,
    	sentimentImageURL: sentimentImage()});
});

app.post('/sentiment', function (req, res) {
	try {
		if (req.body.phrase) {
	    	beginMonitoring(req.body.phrase);
			res.send(200);
		} else {
			res.status(400).send('Invalid request: send {"phrase": "bieber"}');
		}
	} catch (exception) {
		res.status(400).send('Invalid request: send {"phrase": "bieber"}');
	}
});

function getRandomKeyIndex() {
  return Math.floor(Math.random() * keys.length);
}

function resetMonitoring() {
	if (stream) {
		var tempStream = stream;
	    stream = null;  // signal to event handlers to ignore end/destroy
		tempStream.destroySilent();
	}
    monitoringPhrase = "";
}

function beginMonitoring(phrase) {
    // cleanup if we're re-setting the monitoring
    if (monitoringPhrase) {
        resetMonitoring();
    }
    monitoringPhrase = phrase;
    tweetCount = 0;
    tweetTotalSentiment = 0;
    var keyIndex = getRandomKeyIndex();
    console.log('keyIndex for monitoring: ' + keyIndex);
    var tweeter = tweeters[keyIndex];
    tweeter.verifyCredentials(function (error, data) {
        if (error) {
        	resetMonitoring();
            console.error("Error connecting to Twitter: " + error);
            if (error.statusCode === 401)  {
	            console.error("Authorization failure.  Check your API keys.");
            }
        } else {
            tweeter.stream('statuses/filter', {
                'track': monitoringPhrase
            }, function (inStream) {
            	// remember the stream so we can destroy it when we create a new one.
            	// if we leak streams, we end up hitting the Twitter API limit.
            	stream = inStream;
                console.log("Monitoring Twitter for " + monitoringPhrase);
                stream.on('data', function (data) {
                    // only evaluate the sentiment of English-language tweets
                    if (data.lang === 'en') {
                      console.log('English data received');
                        sentiment(data.text, function (err, result) {
                            tweetCount++;
                            tweetTotalSentiment += result.score;
                        });
                    }
                    else {
                      console.log('Non-English data received');
                    }
                });
                stream.on('error', function (error, code) {
	                console.error("Error received from tweet stream: " + code);
		            if (code === 420)  {
	    		        console.error("API limit hit, are you using your own keys?");
            		}
	                resetMonitoring();
                });
				stream.on('end', function (response) {
					if (stream) { // if we're not in the middle of a reset already
					    // Handle a disconnection
		                console.error("Stream ended unexpectedly, resetting monitoring.");
		                resetMonitoring();
	                }
				});
				stream.on('destroy', function (response) {
				    // Handle a 'silent' disconnection from Twitter, no end/error event fired
	                console.error("Stream destroyed unexpectedly, resetting monitoring.");
	                resetMonitoring();
				});
            });
            return stream;
        }
    });
}

function sentimentImage() {
    var avg = tweetTotalSentiment / tweetCount;
    if (avg > 0.5) { // happy
        return "/images/excited.png";
    }
    if (avg < -0.5) { // angry
        return "/images/angry.png";
    }
    // neutral
    return "/images/content.png";
}

app.get('/',
    function (req, res) {
        var welcomeResponse = "<HEAD>" +
            "<title>Twitter Sentiment Analysis</title>\n" +
            "</HEAD>\n" +
            "<BODY>\n" +
            "<P>\n" +
            "Welcome to the Twitter Sentiment Analysis app.<br>\n" +
            "What would you like to monitor?\n" +
            "</P>\n" +
            "<FORM action=\"/monitor\" method=\"get\">\n" +
            "<P>\n" +
            "<INPUT type=\"text\" name=\"phrase\" value=\"" + DEFAULT_TOPIC + "\"><br><br>\n" +
            "<INPUT type=\"submit\" value=\"Go\">\n" +
            "</P>\n" + "</FORM>\n" + "</BODY>";
        if (!monitoringPhrase) {
            res.send(welcomeResponse);
        } else {
            var monitoringResponse = "<HEAD>" +
                "<META http-equiv=\"refresh\" content=\"5; URL=http://" +
                req.headers.host +
                "/\">\n" +
                "<title>Twitter Sentiment Analysis</title>\n" +
                "</HEAD>\n" +
                "<BODY>\n" +
                "<P>\n" +
                "The Twittersphere is feeling<br>\n" +
                "<IMG align=\"middle\" src=\"" + sentimentImage() + "\"/><br>\n" +
                "about " + monitoringPhrase + ".<br><br>" +
                "Analyzed " + tweetCount + " tweets...<br>" +
                "</P>\n" +
                "<A href=\"/reset\">Monitor another phrase</A>\n" +
                "</BODY>";
            res.send(monitoringResponse);
        }
    });

app.get('/testSentiment',
    function (req, res) {
        var response = "<HEAD>" +
            "<title>Twitter Sentiment Analysis</title>\n" +
            "</HEAD>\n" +
            "<BODY>\n" +
            "<P>\n" +
            "Welcome to the Twitter Sentiment Analysis app.  What phrase would you like to analzye?\n" +
            "</P>\n" +
            "<FORM action=\"/testSentiment\" method=\"get\">\n" +
            "<P>\n" +
            "Enter a phrase to evaluate: <INPUT type=\"text\" name=\"phrase\"><BR>\n" +
            "<INPUT type=\"submit\" value=\"Send\">\n" +
            "</P>\n" +
            "</FORM>\n" +
            "</BODY>";
        var phrase = req.query.phrase;
        if (!phrase) {
            res.send(response);
        } else {
            sentiment(phrase, function (err, result) {
                response = 'sentiment(' + phrase + ') === ' + result.score;
                res.send(response);
            });
        }
    });

app.get('/monitor', function (req, res) {
    beginMonitoring(req.query.phrase);
    res.redirect(302, '/');
});

app.get('/reset', function (req, res) {
    resetMonitoring();
    res.redirect(302, '/');
});

app.get('/hello', function (req, res) {
    res.send("Hello world.");
});

app.get('/watchTwitter', function (req, res) {
    var stream;
    var testTweetCount = 0;
    var phrase = 'bieber';
    // var phrase = 'ice cream';
    var keyIndex = getRandomKeyIndex();
    console.log('keyIndex for watchTwitter: ' + keyIndex);
    var tweeter = tweeters[keyIndex];
    tweeter.verifyCredentials(function (error, data) {
        if (error) {
            res.send("Error connecting to Twitter: " + error);
        }
        stream = tweeter.stream('statuses/filter', {
            'track': phrase
        }, function (stream) {
            res.send("Monitoring Twitter for \'" + phrase + "\'...  Logging Twitter traffic.");
            stream.on('data', function (data) {
                testTweetCount++;
                // Update the console every 50 analyzed tweets
                if (testTweetCount % 50 === 0) {
                    console.log("Tweet #" + testTweetCount + ":  " + data.text);
                }
            });
        });
    });
});

app.listen(port);
console.log("Server listening on port " + port);

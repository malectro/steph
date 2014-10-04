var _ = require(__dirname + '/../util/wonderscore.js');
var mongoose = require('mongoose');

var UserAuth = exports;
UserAuth.Schemas = {};


var Twitter = UserAuth.Schemas.AuthTwitter = mongoose.Schema({
  user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  twitter_id: Number,
  username: String,
  display_name: String,
  image_url: String,
});

Twitter.index({twitter_id: 1}, {unique: true});
Twitter.index({user: 1});


var Local = UserAuth.Schemas.AuthLocal = mongoose.Schema({
  user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  password: String,
});

Local.index({user: 1}, {unique: true});


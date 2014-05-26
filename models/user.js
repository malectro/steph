var _ = require(__dirname + '/../util/wonderscore.js');
var mongoose = require('mongoose');
var crypto = require('crypto');


var User = exports;


var Schema = User.Schema = mongoose.Schema({
  twitter_id: Number,
  username: String,
  name: String,
  email: String,
  image_url: String,
  token: String,
  token_ts: Date,
  ability: {type: Number, default: 9}
});

Schema.index({username: 1}, {unique: true});
Schema.index({token: 1});

_.extend(Schema.statics, {
  // constants
  TOKEN_EXPIRE_TIME: new Date(6 * 60 * 60 * 1000), // 6 hours
  ABILTIES: {
    '1': 'admin',
    '2': 'alpha'
  },

  // the user will not be returned if the token is expired.
  findByToken: function (token, id, callback) {
    this.findOne({
      token: token,
      _id: id,
      token_ts: {$gt: Date.now() - this.TOKEN_EXPIRE_TIME}
    }, function (error, user) {
      callback(error, user);
    });
  },

  findByTwitterId: function (twitterId, callback) {
    return this.findOne({twitter_id: twitterId}, callback);
  },

  // if the user is successfully authed with a token, a new token is generated.
  // any user of this method should update sessions/cookies accordingly.
  authWithParams: function (params, callback) {
    this.findByToken(params.token, params.uid, function (error, user) {
      if (user) {
        user.generateToken(null, function (err) {
          callback(err, user);
        });
      } else {
        callback(error, user);
      }
    });
  }
});

_.extend(Schema.methods, {
  // generates a pretty-much unique session token.
  generateToken: function (passport, callback) {
    var attrs;
    var hash = crypto.createHash('sha1');

    hash.update('' + Date.now() + Math.random() + this.id);
    attrs = {token: hash.digest('hex'), token_ts: new Date};

    if (passport && passport.photos.length) {
      attrs.image_url = passport._json.profile_image_url;
    }

    this.update(attrs, callback);
  },

  tokenParams: function () {
    return JSON.stringify({token: this.token, uid: this.id});
  },

  can: function () {
    return this.ability < 3;
  },

  updateAttributes: function (attributes, callback) {
    // filter by modifiable attibrutes
    attributes = _.pick(attributes, 'email');

    this.update(attributes, callback);
  }
});


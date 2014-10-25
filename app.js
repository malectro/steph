'use strict';

var App = {};

// requirements
var _ = require(__dirname + '/util/wonderscore.js');

var express = require('express');
var mongoose = require('mongoose');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;
var assetManager = require('connect-assetmanager');
var fs = require('fs');

var session = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');


// constants
if (_.isUndefined(process) || !process.env) {
  var env = require(__dirname + '/env.js');
  var process = {env: env};
}
var PORT = process.env.PORT || 3000;
var TITLE = 'Steph';

var Model = require(__dirname + '/models/models.js');


// app
var mongoUri = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/' + TITLE.toLowerCase();
var db = mongoose.createConnection(mongoUri);
var app = express();


// app methods
App.init = function () {

  // use variable namespace for quicker rendering
  _.templateSettings.variable = 't';

  // compile templates
  App.compileTemplateDir('');

  app.set('title', TITLE).

    // template engine
    engine('html', App.templateEngine).
    set('view engine', 'html').

    // index folder
    set('views', __dirname + '/client/tmpl').

    // static files
    use('/ux', express.static(__dirname + '/ux')).
    use('/util', express.static(__dirname + '/util')).
    use('/less', express.static(__dirname + '/client/less')).
    use('/img', express.static(__dirname + '/client/img'));

    // set template minifier.
    app.use('/tmpl', assetManager({
      js: {
        route: /tmpl.js\.*/,
        path: App.TMPL_ROOT + '/',
        dataType: 'javascript',
        files: ['*'],
        preManipulate: {
          '^': function (file, path, index, isLast, callback) {
            var name = path.replace(App.TMPL_ROOT + '/', '').split('.')[0];
            callback(null, "Tmpl['" + name + "'] = " + App._tmpls[name].source + ";\n");
          }
        },
        postManipulate: {
          '^': function (file, path, index, isLast, callback) {
            callback(null, 'window.Tmpl=window.Tmpl||{};' + file);
          }
        }
      },
      adminJs: {
        route: /admin.js\.*/,
        path: App.TMPL_ROOT + '/admin/',
        dataType: 'javascript',
        files: ['*'],
        preManipulate: {
          '^': function (file, path, index, isLast, callback) {
            var name = path.replace(App.TMPL_ROOT + '/', '').split('.')[0];
            callback(null, "Tmpl['" + name + "'] = " + App._tmpls[name].source + ";\n");
          }
        },
        postManipulate: {
          '^': function (file, path, index, isLast, callback) {
            callback(null, 'window.Tmpl=window.Tmpl||{};' + file);
          }
        }
      }
    }), express.static(__dirname + '/client/tmpl'));

  Model.init(db);
  this.setUpAuth();
  this.middleware();
  this.routes();
};


// auth setup
App.setUpAuth = function () {

  // creates a User in the db with info from twitter.
  function addTwitterUser(twitterUser, done) {
    done = done || _.noop;
    return addUser({
      username: twitterUser.username,
      name: twitterUser.displayName,
      image_url: twitterUser._json.profile_image_url,
      ability: 9
    }, function (err, user) {
      if (err) {
        return done(err);
      }
      var twitterAuth = new Model.AuthTwitter({
        twitter_id: twitterUser.id,
        username: twitterUser.username,
        display_name: twitterUser.displayName,
        image_url: twitterUser._json.profile_image_url,
        user: user,
      });
      twitterAuth.save(done);
    });
  }

  function addUser(userParams, done) {
    done = done || _.noop;
    var newUser = new Model.User(userParams);
    newUser.save(done);
    return newUser;
  }

  // user methods
  passport.serializeUser(function (user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function (id, done) {
    Model.User.findById(id, done);
  });

  // initialize local authentication via passport.
  passport.use(new LocalStrategy(function (username, password, done) {

  }));

  // initialize twitter authentication via passport.
  passport.use(new TwitterStrategy({
      consumerKey: process.env.TWITTER_CONSUMER_KEY,
      consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
      callbackURL: '/auth/twitter/callback'
    },
    function (token, tokenSecret, twitterUser, done) {
      Model.AuthTwitter.findOne({twitter_id: twitterUser.id}).populate('user').exec(function (err, auth) {
        if (err) {
          // Error handling.
          return done(err);
        }

        var user;
        if (!auth) {
          // User with this twitter Id doesn't exist.
          user = addTwitterUser(twitterUser);
        } else {
          user = auth.user;
        }

        user.generateToken(twitterUser, function (error) {
          done(null, user);
        });
      });
    }
  ));

  // set up session storage and cookieParser.
  app.use(bodyParser())
     .use(cookieParser('kyle is the best'))
     .use(session({secret: 'kyle is the best'}))
     .use(passport.initialize())
     .use(passport.session());
};


// middleware
App.middleware = function () {

  // attempt to recover user from auth_token
  app.use(function (req, res, next) {
    if (!req.user && req.cookies.auth_token) {
      var tokenData = JSON.parse(req.cookies.auth_token);

      Model.User.authWithParams(tokenData, function (error, user) {
        if (user) {
          req.user = user;

          // this can possibly be removed
          req.session.auth = req.session.auth || {};
          req.session.auth.userId = user.id;
          req.session.auth.loggedIn = true;

          // but not this
          req.session.passport = req.session.passport || {};
          req.session.passport.user = user.id;
        }

        //req.cookies.auth_token = null;
        res.clearCookie('auth_token');

        next();
      });
    } else {
      next();
    }
  });

  // clean up cookies for logged in users
  app.use(function (req, res, next) {
    if (req.user) {
      if (req.cookies.auth_token) {
        var tokenData = JSON.parse(req.cookies.auth_token);
        if (tokenData.token !== req.user.token) {
          req.cookies.auth_token = null;
        }
      }

      if (!req.cookies.auth_token) {
        res.cookie('auth_token', req.user.tokenParams(), {
          expires: new Date(Date.now() + (Model.User.TOKEN_EXPIRE_TIME - 0)),
          path: '/'
        });
      }
    }
    next();
  });
};


// routes
App.routes = function () {

  app.get('/admin', function (req, res) {
    if (!req.user || !req.user.can('admin')) {
      return res.redirect('/auth/twitter');
    }

    var context = {req: req, env: process.env};
    var done = _.after(2, function () {
      res.render('admin/index', context);
    });

    Model.User.find().exec(function (error, users) {
      context.users = users;
      done();
    });

    Model.Item.find().exec(function (error, items) {
      context.items = items;
      done();
    });
  });

  // home
  app.get('/', function (req, res) {
    var context = {req: req};
    var done = _.after(2, function () {
      res.render('index', context);
    });

    Model.User.find().exec(function (error, users) {
      context.users = _.invoke(users, 'publicJSON');
      done();
    });

    Model.Item.find().exec(function (error, items) {
      context.items = items;
      done();
    });
  });

  // auth
  app.get('/auth/twitter', passport.authenticate('twitter'));
  app.get('/logout', function (req, res) {
    req.logout();
    res.clearCookie('auth_token');
    res.redirect('/');
  });
  app.get('/auth/twitter/callback', passport.authenticate('twitter', {
    successRedirect: '/',
    failureRedirect: '/'
  }));

  // users
  app.route('/users').
    get(function (req, res) {
      Model.User.find().exec(function (error, users) {
        res.json(_.invoke(users, 'publicJSON'));
      });
    });

  // items
  app.route('/items').
    get(function (req, res) {
      Model.Item.find().exec(function (error, items) {
        res.json(items);
      });
    }).
    post(function (req, res) {
      var error;

      if (!req.user || req.user.id !== req.body.user_id || !req.user.can('admin')) {
        error = 'not allowed'
      }

      if (error) {
        res.json(400, {error: error});
      } else {
        var item = new Model.Item({
          user: req.user,
          title: req.body.title,
          writeup: req.body.writeup,
          src: req.body.src,
          medium: req.body.medium,
          embed: req.body.embed,
          createdAt: new Date(),
        });

        item.save(function (error) {
          if (error) {
            res.json(400, {error: error});
          } else {
            res.json(200, item);
          }
        });
      }
    });
  app.route('/items/:id').
    get(function (req, res) {
      Model.Item.findById(req.params.id).exec(function (error, item) {
        if (error) {
          res.json(400, {error: error});
        } else {
          res.json(200, item);
        }
      });
    }).
    put(function (req, res) {
      var error;

      if (!req.user || req.user.id !== req.body.user || !req.user.can('admin')) {
        error = 'not allowed'
      }

      if (error) {
        res.json(400, {error: error});

      } else {
        Model.Item.findById(req.params.id).exec(function (error, item) {
          item.set({
            title: req.body.title,
            writeup: req.body.writeup,
            src: req.body.src,
            medium: req.body.medium,
            embed: req.body.embed,
          });
          item.save(function (error) {
            if (error) {
              res.json(400, {error: error});
            } else {
              res.json(200, item);
            }
          });
        });
      }
    }).
    delete(function (req, res) {
      var error;

      if (!req.user || !req.user.can('admin')) {
        error = 'not allowed'
      }

      if (error) {
        res.json(400, {error: error});

      } else {
        Model.Item.findById(req.params.id).exec(function (error, item) {
          item.remove(function (error) {
            if (error) {
              res.json(400, {error: error});
            } else {
              res.json(200, item);
            }
          });
        });
      }
    });

  // medium
  app.get('/:medium', function (req, res) {
    var context = {req: req};
    var done = _.after(2, function () {
      res.render('index', context);
    });

    Model.User.find().exec(function (error, users) {
      context.users = _.invoke(users, 'publicJSON');
      done();
    });

    Model.Item.find().exec(function (error, items) {
      context.items = items;
      done();
    });
  });

  // item
  app.get('/:medium/:itemId', function (req, res) {
    var context = {req: req};
    var done = _.after(2, function () {
      res.render('index', context);
    });

    Model.User.find().exec(function (error, users) {
      context.users = _.invoke(users, 'publicJSON');
      done();
    });

    Model.Item.find().exec(function (error, items) {
      context.items = items;
      done();
    });
  });
};


// templating
App._tmpls = {};

App.TMPL_ROOT = __dirname + '/client/tmpl';

App.compileTemplateDir = function (templateDir) {

  fs.readdir(App.TMPL_ROOT + templateDir, function (err, files) {
    files.forEach(function (file) {

      var filename = templateDir + '/' + file;

      fs.readFile(App.TMPL_ROOT + filename, function (error, data) {
        if (error) {
          if (error.code === 'EISDIR') {
            App.compileTemplateDir(filename);
          } else {
            console.log('Error compiling template file', filename, error);
          }
        } else {
          App._tmpls[filename.split('.')[0].slice(1)] = _.template(data.toString());
          console.log('Compiled template', filename.split('.')[0].slice(1));
        }
      });

    });
  });

};

App.templateEngine = function (path, options, callback) {
  var name = path.replace(App.TMPL_ROOT + '/', '').split('.')[0];
  callback(null, App._partial(name, options));
};

App._partial = function (name, options) {
  options._partial = App._partial;
  return App._tmpls[name](options);
};


// run server
App.init();
app.listen(PORT);
console.log('Listening on port ' + PORT);


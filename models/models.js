var _ = require(__dirname + '/../util/wonderscore.js');

var Schema = {};
var Model = exports;

var models = [
  'User',
  'UserAuth',
  'Item',
  'Comment',
];

_.each(models, function (model) {
  var module = require(__dirname + '/' + _.snakeCase(model) + '.js');
  var schemas = module.Schemas;

  if (!schemas) {
    Schema[model] = module.Schema;
  } else {
    _.extend(Schema, schemas);
  }
});

Model.init = function (db) {
  for (var name in Schema) {
    Model[name] = db.model(name, Schema[name]);
  }
};


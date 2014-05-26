;

/**
 * require
 * basic require script
 * by malectro
 */

if (typeof require !== 'function') {
  var require = (function () {

    var required = {},
        callbacks = {},
        id = 0;

    function require(paths, ordered, callback) {
      var originalCallback = callback;
      var cutPaths;

      if (typeof paths === 'string') {
        paths = [paths];
      }

      if (ordered && paths.length > 1) {
        cutPaths = paths;
        paths = [paths.shift()];

        callback = function () {
          require(cutPaths, true, originalCallback);
        };
      } else {
        callback = callback || function () {};
      }

      var firstScript = document.getElementsByTagName('script')[0],
          script, path;

      id++;
      callbacks[id] = {count: paths.length, callback: callback};

      for (var i = 0, l = paths.length; i < l; i++) {
        path = paths[i];

        if (typeof path === 'object') {
          script.type = path[1];
          path = path[0];
        }

        if (path.indexOf('.') < 0) {
          path += '.js';
        }

        if (!required[path]) {
          script = document.createElement('script');

          script.src = path;

          script.onload = function () {
            required[path] = true;
            require.loaded(id);
          };

          firstScript.parentNode.insertBefore(script, firstScript);
        } else {
          require.loaded(id);
        }
      }

      return id;
    };

    require.loaded = function (id) {
      if (callbacks[id]) {
        console.log(callbacks[id].count);
        callbacks[id].count--;

        if (callbacks[id].count < 1) {
          callbacks[id].callback();
          callbacks[id] = null;
        }
      }
    };

    return require;
  }());
}


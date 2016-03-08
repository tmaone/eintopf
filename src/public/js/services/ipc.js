(function (ng) {

  const ipcRenderer = require('electron').ipcRenderer;

  var ipcModule = ng.module('eintopf.services.ipc', []);

  ipcModule.factory('ipc', [function () {
    var ipc = {};

    ipc.toKefir = function (eventName) {
      return Kefir.fromEvent(ipcRenderer, eventName, function (event, value) {
        return value;
      })
    };
    ipc.emit = function (eventName, value) {
      if (!eventName) return false;
      if (typeof value === 'object') value = JSON.parse(JSON.stringify(value));
      ipcRenderer.send(eventName, value);
    };

    // use scope.on 'destroy' to dismiss the stream
    ipc.toKefirDestroyable = function(scope, stream) {
      if (typeof stream == 'string') stream = ipc.toKefir(stream);
      var pool = Kefir.pool();

      scope.$on('$destroy', function() {
        pool.unplug(stream);
        delete pool; // cleanup pool?
      });

      pool.plug(stream);
      return pool;
    };

    return ipc;
  }]);

  ipcModule.service('lockService', ['ipc', function (ipc) {
    var model = {};

    model.stream = ipc.toKefir('locks').toProperty();
    model.emit = function () {
      ipc.emit('req:locks');
    };

    return model;
  }]);

  ipcModule.service('ipcGetPattern', ['ipc', function (ipc) {
    return function (id) {
      if (!id) return false;
      ipc.emit('req:pattern', id);
      return ipc.toKefir('pattern:' + id).toProperty();
    }
  }]);

  ipcModule.service('ipcClonePattern', ['ipc', function (ipc) {
    return function (id) {
      if (!id) return false;
      ipc.emit('project:clone', id)
    }
  }]);

  ipcModule.service('ipcCloneResult', ['ipc', function (ipc) {
    return function (id) {
      return ipc.toKefir('project:clone:' + id).toProperty();
    }
  }]);

  ipcModule.factory('clonePatternFactory', ['ipc', 'ipcGetPattern', 'ipcClonePattern', 'ipcCloneResult', function (ipc, ipcGetPattern, ipcClonePattern, ipcCloneResult) {
    var model = {};

    model.emitClone = ipcClonePattern;
    model.getCloneStream = ipcCloneResult;
    model.getPatternStream = function (id) {
      return ipcGetPattern(id)
      .map(function (pattern) {
        var result = {};

        result = pattern;
        result.patternId = pattern.id;
        result.patternName = pattern.name;
        result.patternUrl = pattern.url;
        result.id = '';
        result.name = '';

        return result;
      });
    };

    return model;
  }]);

  ipcModule.service('setupLiveResponse', ['ipc', function (ipc) {
    ipc.emit('req:states');
    return ipc.toKefir('states').toProperty();
  }]);

  ipcModule.service('setupLiveResponse', ['ipc', function (ipc) {
    ipc.emit('req:states');
    return ipc.toKefir('states').toProperty();
  }]);

  ipcModule.service('resProjectsList', ['ipc', 'reqProjectList', function (ipc, reqProjectList) {
    reqProjectList.emit();
    return ipc.toKefir('res:projects:list').toProperty();
  }]);

  ipcModule.service('resProjectsInstall', ['ipc', function (ipc) {
    return ipc.toKefir('res:projects:install');
  }]);

  ipcModule.service('resContainersLog', ['ipc', function (ipc) {
    return ipc.toKefir('res:containers:log');
  }]);

  ipcModule.service('resProjectDelete', ['ipc', function (ipc) {
    return {
      fromProject: function (project) {
        return ipc.toKefir('res:project:delete:' + project);
      }
    }
  }]);

  ipcModule.service('resSettingsList', ['ipc', 'reqSettingsList', function (ipc, reqSettingsList) {
    reqSettingsList.emit();
    return ipc.toKefir('res:settings:list').toProperty();
  }]);

  ipcModule.service('resRecommendationsList', ['ipc', 'reqRecommendationsList', function (ipc, reqRecommendationsList) {
    reqRecommendationsList.emit();
    return ipc.toKefir('res:recommendations:list').toProperty();
  }]);

  ipcModule.service('setupRestart', ['ipc', function (ipc) {
    return {
      emit: function (data) {
        ipc.emit('states:restart', data);
      }
    }
  }]);

  ipcModule.service('reqProjectList', ['ipc', function (ipc) {
    return {
      emit: function () {
        ipc.emit('projects:list');
      }
    }
  }]);

  ipcModule.service('reqProjectsInstall', ['ipc', function (ipc) {
    return {
      emit: function (data) {
        ipc.emit('projects:install', data);
      }
    }
  }]);

  ipcModule.service('reqProjectDetail', ['ipc', function (ipc) {
    return {
      emit: function (data) {
        ipc.emit('project:detail', data);
      }
    }
  }]);

  ipcModule.service('reqProjectStart', ['ipc', function (ipc) {
    return {
      emit: function (data) {
        ipc.emit('project:start', data);
      }
    }
  }]);

  ipcModule.service('reqProjectStop', ['ipc', function (ipc) {
    return {
      emit: function (data) {
        ipc.emit('project:stop', data);
      }
    }
  }]);

  ipcModule.service('reqProjectDelete', ['ipc', function (ipc) {
    return {
      emit: function (data) {
        ipc.emit('project:delete', data);
      }
    }
  }]);

  ipcModule.service('reqProjectUpdate', ['ipc', function (ipc) {
    return {
      emit: function (data) {
        ipc.emit('project:update', data);
      }
    }
  }]);

  ipcModule.service('reqProjectAction', ['ipc', function (ipc) {
    return {
      emit: function (data) {
        ipc.emit('project:action:script', data);
      }
    }
  }]);

  ipcModule.service('reqContainerStart', ['ipc', function (ipc) {
    return {
      emit: function (containerId) {
        ipc.emit('container:start', containerId);
      }
    }
  }]);

  ipcModule.service('reqContainerStop', ['ipc', function (ipc) {
    return {
      emit: function (containerId) {
        ipc.emit('container:stop', containerId);
      }
    }
  }]);

  ipcModule.service('reqContainerRemove', ['ipc', function (ipc) {
    return {
      emit: function (containerId) {
        ipc.emit('container:remove', containerId);
      }
    }
  }]);

  ipcModule.service('reqContainersList', ['ipc', function (ipc) {
    return {
      emit: function (data) {
        ipc.emit('containers:list', data);
      }
    }
  }]);

  ipcModule.service('reqContainersInspect', ['ipc', function (ipc) {
    return {
      emit: function () {
        ipc.emit('containers:inspect');
      }
    }
  }]);

  ipcModule.service('reqRecommendationsList', ['ipc', function (ipc) {
    return {
      emit: function (data) {
        ipc.emit('recommendations:list', data);
      }
    }
  }]);

  ipcModule.factory('reqSettingsList', ['ipc', function (ipc) {
    return {
      emit: function (data) {
        ipc.emit('settings:list', data);
      }
    }
  }]);

  ipcModule.service('reqAppsList', ['ipc', function (ipc) {
    return {
      emit: function (data) {
        ipc.emit('apps:list', data);
      }
    }
  }]);

  ipcModule.service('resContainersList', ['ipc', 'reqContainersList', function (ipc, reqContainersList) {
    reqContainersList.emit();
    return ipc.toKefir('res:containers:list').toProperty();
  }]);

  ipcModule.service('resContainersInspect', ['ipc', 'reqContainersInspect', function (ipc, reqContainersInspect) {
    var containersInspect = ipc.toKefir('res:containers:inspect').toProperty();
    reqContainersInspect.emit();
    containersInspect.onValue(function () {
    });
    return containersInspect;
  }]);

  ipcModule.service('resAppsList', ['ipc', 'reqAppsList', function (ipc, reqAppsList) {
    reqAppsList.emit();
    return ipc.toKefir('res:apps:list')
    .map(function (apps) { // only running apps
      for (var key in apps) {
        if (apps.hasOwnProperty(key) && !apps[key].running) delete apps[key];
      }
      return apps;
    })
    .toProperty();
  }]);

  ipcModule.service('reqContainerActions', ['ipc', function (ipc) {
    return {
      start: function (containerId) {
        ipc.emit('container:start', containerId);
      },
      stop: function (containerId) {
        ipc.emit('container:stop', containerId);
      },
      remove: function (containerId) {
        ipc.emit('container:remove', containerId);
      }
    }
  }]);

  ipcModule.factory('resProjectStart', ['ipc', 'storage', function (ipc, storage) {
    var streams = {};
    return {
      fromProject: function (project) {
        if (streams[project]) {
          return streams[project];
        }

        streams[project] = ipc.toKefir('res:project:start:' + project).onValue(function (value) {
          storage.add("project.log.start." + project, value);
          storage.add("project.log.complete." + project, new Date().toLocaleTimeString() + " - [start] > " + value);
        }).toProperty();

        return streams[project];
      }
    }
  }]);

  ipcModule.factory('resProjectStop', ['ipc', 'storage', function (ipc, storage) {
    var streams = {};
    return {
      fromProject: function (project) {
        if (streams[project]) {
          return streams[project];
        }

        streams[project] = ipc.toKefir('res:project:stop:' + project).onValue(function (value) {
          storage.add("project.log.stop." + project, value);
          storage.add("project.log.complete." + project, new Date().toLocaleTimeString() + " - [stop] > " + value);
        }).toProperty();

        return streams[project];
      }
    }
  }]);

  ipcModule.factory('resProjectUpdate', ['ipc', 'storage', function (ipc, storage) {
    var streams = {};
    return {
      fromProject: function (project) {
        if (streams[project]) {
          return streams[project];
        }

        streams[project] = ipc.toKefir('res:project:update:' + project).onValue(function (value) {
          storage.add("project.log.update." + project, value);
          storage.add("project.log.complete." + project, new Date().toLocaleTimeString() + " - [update] > " + value);
        }).toProperty();

        return streams[project];
      }
    }
  }]);

  ipcModule.factory('resProjectAction', ['ipc', 'storage', function (ipc, storage) {
    var streams = {};
    return {
      fromProject: function (project) {
        if (streams[project]) {
          return streams[project];
        }

        streams[project] = ipc.toKefir('res:project:action:script:' + project).onValue(function (value) {
          storage.add("project.log.action." + project, value);
          storage.add("project.log.complete." + project, new Date().toLocaleTimeString() + " - [action] > " + value);
        }).toProperty();

        return streams[project];
      }
    }
  }]);

  ipcModule.factory('terminalStream', ['ipc', 'storage', function (ipc, storage) {
    var stream = null;

    var emit = function (cmd) {
      ipc.emit('terminal:input', cmd);
    };

    var getStream = function () {
      if (stream) return stream;
      stream = ipc.toKefir('terminal:output')
      //.onValue(function(value) {
      //  //value = value.replace(/\n/ig, "<br>");
      //  storage.add("vagrant.log", new Date().toLocaleTimeString() + " > " + value);
      //})
      .filter(function (val) {
        if (val && val.text) return true;
      })
      .toProperty();
      return stream;
    };

    return {
      emit: emit,
      getStream: getStream
    }
  }]);



})(angular);
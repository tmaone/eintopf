'use strict';

angular.module('eintopf')
  .controller('setupCtrl',
  ['$scope', 'setupLiveResponse', 'setupRestart', '$state',
    function($scope, setupLiveResponse, setupRestart, $state) {
      setupLiveResponse.$assignProperty($scope, 'states');

      $scope.$fromWatch('states')
        .filter(function(val) {
          if (val.newValue && val.newValue.state == 'cooking') return true;
          return null;
        })
        .onValue(function() {
          $state.go('cooking.projects');
        });

      $scope.$fromWatch('states')
        .filter(function(val) {
          if (val.newValue && val.newValue.state == 'first') return true;
          return null;
        })
        .onValue(function() {
          $state.go('first');
        });

      $scope.setupRestart = function() {
        setupRestart.emit();
      }
    }
  ])
  .controller('cookingCtrl',
  ['$scope', 'reqProjectList', 'resProjectsList',
    function($scope, reqProjectsList, resProjectsList) {
      resProjectsList.$assignProperty($scope, 'projects');
    }
  ])
  .controller('containersCtrl',
  ['$scope', 'resContainersList',
    function($scope, resContainersList) {
      resContainersList.$assignProperty($scope, 'containers');
    }
  ])
  .controller('appsCtrl',
  ['$scope', 'resAppsList',
    function($scope, resAppsList) {
      resAppsList.$assignProperty($scope, 'apps');
    }
  ])
  .controller('recipeCtrl',
  ['$scope', '$stateParams', '$state', 'reqProjectDetail', 'resProjectDetail', 'reqProjectStart', 'resProjectStart', 'reqProjectStop', 'resProjectStop', 'reqProjectDelete', 'resProjectDelete', 'reqProjectUpdate', 'resProjectUpdate', 'reqProjectList', 'reqProjectListRefresh', 'currentProject',
    function($scope, $stateParams, $state, reqProjectDetail, resProjectDetail, reqProjectStart, resProjectStart, reqProjectStop, resProjectStop, reqProjectDelete, resProjectDelete, reqProjectUpdate, resProjectUpdate, reqProjectList, reqProjectListRefresh, currentProject) {
      $scope.project = {
        id: $stateParams.id
      };
      $scope.loading = false;

      resProjectStart.fromProject($stateParams.id).$assignProperty($scope, 'log');
      resProjectStop.fromProject($stateParams.id).$assignProperty($scope, 'log');
      resProjectDetail.$assignProperty($scope, 'project');
      reqProjectDetail.emit($stateParams.id);

      $scope.startProject = function(project) {
        $scope.loading = true;
        $scope.result = {};
        reqProjectStart.emit(project);
      };
      $scope.stopProject = function(project) {
        $scope.loading = true;
        $scope.result = {};
        reqProjectStop.emit(project);
      };
      $scope.deleteProject = function(project){
        reqProjectDelete.emit(project);
        resProjectDelete.fromProject($stateParams.id).onValue(function(){
          reqProjectListRefresh.emit();
          currentProject.setProjectId();
          $state.go("cooking.projects");
        });
      };
      $scope.updateProject = function(project){
        reqProjectUpdate.emit(project);
        resProjectUpdate.fromProject($stateParams.id).$assignProperty($scope, 'log');
      };
      currentProject.setProjectId($stateParams.id);
    }
  ])
  .controller('createProjectCtrl',
  ['$scope', 'reqProjectsInstall', 'resProjectsInstall',
    function($scope, reqProjectsInstall, resProjectsInstall) {
      resProjectsInstall.$assignProperty($scope, 'result');
      $scope.$fromWatch('result')
        .filter(function(val) {
          if (typeof val.newValue == "object" && val.newValue.status) return true;
        })
        .onValue(function() {
          $scope.loading = false;
        });

      $scope.install = function(val) {
        if (!val) return false;
        $scope.result = {};
        $scope.loading = true;
        reqProjectsInstall.emit(val);
      }
    }
  ])
  .controller('settingsCtrl',
  ['$scope', 'resSettingsList',
    function($scope, resSettingsList) {
        resSettingsList.$assignProperty($scope, 'settings');
    }
  ])
;

config = require '../stores/config'
jetpack = require 'fs-jetpack'
spawn = require('child_process').spawn

watcherModel = require '../stores/watcher.coffee'

appConfig = config.get 'app'

module.exports.getPathResolvedWithRelativeHome = (fsPath) ->
  return null if typeof fsPath != "string"
  homePath = @getEintopfHome()
  fsPath = fsPath.replace /^(~|~\/)/, homePath if homePath?
  return fsPath

module.exports.getEintopfHome = () ->
  return process.env.EINTOPF_HOME if process.env.EINTOPF_HOME
  return process.env.USERPROFILE if process.platform == 'win32'
  return process.env.HOME

module.exports.getConfigPath = () ->
  return @getPathResolvedWithRelativeHome "#{@getEintopfHome()}/.eintopf";

module.exports.getConfigModulePath = () ->
  return null if ! (configPath = @getConfigPath())? || ! appConfig.defaultNamespace
  return jetpack.cwd(configPath).path appConfig.defaultNamespace

module.exports.getProjectsPath = () ->
  return null if ! (configModulePath = @getConfigModulePath())
  return jetpack.cwd(configModulePath).path('configs')

module.exports.getProjectNameFromGitUrl = (gitUrl) ->
  return null if !(projectName = gitUrl.match(/^[:]?(?:.*)[\/](.*)(?:s|.git)?[\/]?$/))?
  return projectName[1].substr(0, projectName[1].length-4) if projectName[1].match /\.git$/i
  return projectName[1]

module.exports.typeIsArray = Array.isArray || ( value ) -> return {}.toString.call( value ) is '[object Array]'

module.exports.folderExists = (path) ->
  return null if ! path
  return true if jetpack.exists(path) == "dir"
  return false

#@todo refactoring: use clear naming (renaming project|recommendations and not just here)
module.exports.isProjectInstalled = (projectId) ->
  return null if ! projectId || ! (projectsPath = @getProjectsPath())
  return @folderExists jetpack.cwd(projectsPath).path(projectId)

module.exports.runCmd = (cmd, config, logName, callback) ->
  config = {} if ! config
  output = ''

  sh = 'sh'
  shFlag = '-c'

  if process.platform == 'win32'
    sh = process.env.comspec || 'cmd'
    shFlag = '/d /s /c'
    config.windowsVerbatimArguments = true

  proc = spawn sh, [shFlag, cmd], config
  proc.on 'error', (err) ->
    return callback err if callback
  proc.on 'close', (code, signal) ->
    return callback null, output if callback
  proc.stdout.on 'data', (chunk) ->
    watcherModel.log logName, chunk.toString() if logName
    output += chunk.toString()
  proc.stderr.on 'data', (chunk) ->
    watcherModel.log logName, chunk.toString() if logName
    output += chunk.toString()
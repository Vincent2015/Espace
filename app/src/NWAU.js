if (window.NWModule) {


  function VersionManager() {
    this.init();
    this.url = "/version/3/2/8";
    // this.host = "https://pc-api.esn.ren";//预发布
    // this.host = "https://pc-api.upesn.com";//正式
    this.host = "http://pc.api.esn.ren:6062";//"https://pc-api.esn.ren";//
  }

  VersionManager.prototype.init = function() {
    this.updater = require('nw-auto-updater');
    this.path = require('path');
    this.fs =  require("fs");

    this.async = require("async");
  }


  VersionManager.prototype.configure = function(suc, fail) {
    var self = this;
    var url = this.remoteUrl;
    console.log(url);
    this.updater.configure({
      'remoteManifest': url,
      'tmpManifest': this.path.resolve('tmp/update_manifest.json'),
      'tmpArchive': this.path.resolve('tmp/update_archive.zip'),
      'extractPath': this.path.resolve('.'),
      'nwGui': require('nw.gui'),

      'update-available': function() {
        console.log('available');
      },
      'update-not-available': function() {
        fail("更新失败");
        console.log('not available');
      },
      'update-downloading': function(state) {
        jQuery(".esn-progress").css("width",state.percent+"%");
        console.log('downloading, ' + state.percent + " %");
      },
      'update-downloaded': function() {
        console.log('zip downloaded');
        jQuery(".esn-progress").css("width","100%");
      },
      'update-installed': function() {
        console.log('archive installed');
        jQuery(".btn-charge").html("正在安装");
        jQuery(".btn-charge").css("background","#9aec98");

        //写入新版本号
        self.writeVersion(function(data) {
          var win = gui.Window.get();
          // win.reload();
          suc(data);
        }, function(error) {
          fail(error);
        });
        // this.path = require('path');
        var start = new Date().getTime();
        var path = self.path.resolve("esn_desktop");
        var srcpath = self.path.resolve("");
        console.log(srcpath);
        self.copyDir(path, srcpath, function (err) {
        	if (err) {
        		console.log("error ocur");
        		console.dir(err);
        	} else {

        		console.log("copy ok");
        		console.log("consume time:" + (new Date().getTime() - start));
            var win = gui.Window.get();
            win.reload();
        	}
        });
      },
      'error': function(e) {
        fail("更新失败");
        console.error(e);
      }
    });
  }

  VersionManager.prototype.update = function(suc, fail) {
    if (!this.new_version_info) return;
    this.resetRemoteUrl();
    this.new_version = this.new_version_info.data.version;
    this.configure(suc, fail);
    this.updater.launch();
  }


  VersionManager.prototype.checkedUpdate = function(suc, fail) {

    var path = this.path.resolve("package.json");
    console.log("resolve目录" + path);
    var json = require(path);
    console.log("开始检查更新");
    console.log("当前版本" + json["version"]);


    // 检查是否有更新
    this.dataService("get", this.url, function(data) {
      if (data.code == 0) {
        //纪录新版本信息
        this.new_version_info = data;
        suc(data);
      } else {
        fail(data);
      }
    }.bind(this), function(error) {
      console.log(error);
      fail({msg: "网络异常"});
    }.bind(this));

  }

  VersionManager.prototype.resetRemoteUrl = function() {
    var strParams = this.getLoginParams(this.url);
    this.remoteUrl = this.host + this.url + '?' + strParams;
  }


  VersionManager.prototype.dataService = function(type, url, suc, fail, params) {
    var host = this.host;
    var strParams = this.getLoginParams(url);
    this.remoteUrl = host + url + '?' + strParams;
    console.log(this.remoteUrl);
    $.ajax({
      type: type,
      url: this.remoteUrl,
      success: function(data) {
        console.log(data);
        var json = data;
        (suc && typeof(suc) === 'function') && suc(json);
      },
      error: function(data) {
        console.log(data);
        (fail && typeof(fail) === 'function') && suc(data);
      }

    });
  };

  VersionManager.prototype.writeVersion = function(suc, fail) {
    if (this.new_version) {
      try {
        var path = this.path.resolve("package.json");
        console.log("resolve目录" + path);
        var json = require(path);
        json["version"] = this.new_version;
        this.fs.writeFileSync(path, JSON.stringify(json));
        suc("更新成功");
      } catch (e) {
        console.log(e);
        fail("更新失败 写入版本信息失败");
      }
    } else {
      fail("更新失败");
    }

  }

  VersionManager.prototype.getVersion = function() {
    var path = this.path.resolve("package.json");
    var json = require(path);
    return json.version;
  }

  VersionManager.prototype.getLoginParams = function(url) {
    var v = this.getVersion();
    var rcode = Math.floor(Math.random() * 1000000 + 100000);
    var $strParams = 'rcode=' + rcode + '&timestamp=' + (new Date()).valueOf() + '&v=' + v;
    var $sign = this.getSign(url, $strParams, true);
    var strParams = $strParams + '&sign=' + $sign;
    return strParams;
  }

  VersionManager.prototype.getSign = function(uri, strParams, type) {
    var $sn = "";
    if (!type) {
      var esn = window.localStorage.getItem("esn_user");
      var info = JSON.parse(esn);
      $sn = info.sn;
    }
    var $uri = uri;
    var $strParams = strParams;
    var $salt = 'BAN/+GGzUBtMW'; //固定字符串
    // console.log($sn+$uri+$strParams+$salt);

    var $sign = $.md5($sn + $uri + $strParams + $salt);
    return $sign;
  }


  // var fs = require("fs");
  // var path = require("path");
  // cursively make dir
  VersionManager.prototype.mkdirs = function(p, mode, f, made) {
  	if (typeof mode === 'function' || mode === undefined) {
  		f = mode;
  		mode = 0777 & (~process.umask());
  	}
  	if (!made)
  		made = null;

  	var cb = f || function () {};
  	if (typeof mode === 'string')
  		mode = parseInt(mode, 8);
  	p = this.path.resolve(p);
    var self = this;
  	this.fs.mkdir(p, mode, function (er) {
  		if (!er) {
  			made = made || p;
  			return cb(null, made);
  		}
  		switch (er.code) {
  		case 'ENOENT':
  			self.mkdirs(self.path.dirname(p), mode, function (er, made) {
  				if (er) {
  					cb(er, made);
  				} else {
  					mkdirs(p, mode, cb, made);
  				}
  			});
  			break;

  			// In the case of any other error, just see if there's a dir
  			// there already.  If so, then hooray!  If not, then something
  			// is borked.
  		default:
  			self.fs.stat(p, function (er2, stat) {
  				// if the stat fails, then that's super weird.
  				// let the original error be the failure reason.
  				if (er2 || !stat.isDirectory()) {
  					cb(er, made);
  				} else {
  					cb(null, made)
  				};
  			});
  			break;
  		}
  	});
  }
  // single file copy
VersionManager.prototype.copyFile = function(file, toDir, cb) {
    var self = this;
  	this.async.waterfall([
  			function (callback) {
  				self.fs.exists(toDir, function (exists) {
  					if (exists) {
  						callback(null, false);
  					} else {
  						callback(null, true);
  					}
  				});
  			}, function (need, callback) {
  				if (need) {
  					self.mkdirs(self.path.dirname(toDir), callback);
  				} else {
  					callback(null, true);
  				}
  			}, function (p, callback) {
  				var reads = self.fs.createReadStream(file);
  				var writes = self.fs.createWriteStream(self.path.join(self.path.dirname(toDir), self.path.basename(file)));
  				reads.pipe(writes);
  				//don't forget close the  when  all the data are read
  				reads.on("end", function () {
  					writes.end();
  					callback(null);
  				});
  				reads.on("error", function (err) {
  					console.log("error occur in reads");
  					callback(true, err);
  				});

  			}
  		], cb);

  }

  // cursively count the  files that need to be copied

  VersionManager.prototype._ccoutTask = function(from, to, cbw) {
    var self = this;
  	self.async.waterfall([
  			function (callback) {
  				self.fs.stat(from, callback);
  			},
  			function (stats, callback) {
  				if (stats.isFile()) {
  					cbw.addFile(from, to);
  					callback(null, []);
  				} else if (stats.isDirectory()) {
  					self.fs.readdir(from, callback);
  				}
  			},
  			function (files, callback) {
  				if (files.length) {
  					for (var i = 0; i < files.length; i++) {
  						self._ccoutTask(self.path.join(from, files[i]), self.path.join(to, files[i]), cbw.increase());
  					}
  				}
  				callback(null);
  			}
  		], cbw);

  }
  // wrap the callback before counting
  VersionManager.prototype.ccoutTask = function(from, to, cb) {
  	var files = [];
  	var count = 1;

  	function wrapper(err) {
  		count--;
  		if (err || count <= 0) {
  			cb(err, files)
  		}
  	}
  	wrapper.increase = function () {
  		count++;
  		return wrapper;
  	}
  	wrapper.addFile = function (file, dir) {
  		files.push({
  			file : file,
  			dir : dir
  		});
  	}

  	this._ccoutTask(from, to, wrapper);
  }


  VersionManager.prototype.copyDir = function(from, to, cb) {
      if(!cb){
  	  cb=function(){};
  	}
    var self = this;
  	this.async.waterfall([
  			function (callback) {
  				self.fs.exists(from, function (exists) {
  					if (exists) {
  						callback(null, true);
  					} else {
  						console.log(from + " not exists");
  						callback(true);
  					}
  				});
  			},
  			function (exists, callback) {
  				self.fs.stat(from, callback);
  			},
  			function (stats, callback) {
  				if (stats.isFile()) {
  					// one file copy
  					self.copyFile(from, to, function (err) {
  						if (err) {
  							// break the waterfall
  							callback(true);
  						} else {
  							callback(null, []);
  						}
  					});
  				} else if (stats.isDirectory()) {
  					self.ccoutTask(from, to, callback);
  				}
  			},
  			function (files, callback) {
                  // prevent reaching to max file open limit
  				self.async.mapLimit(files, 10, function (f, cb) {
  					self.copyFile(f.file, f.dir, cb);
  				}, callback);
  			}
  		], cb);
  }

  // var start = new Date().getTime();
  //
  // copyDir("F:\\gear", "F:\\gear2", function (err) {
  // 	if (err) {
  // 		console.log("error ocur");
  // 		console.dir(err);
  // 	} else {
  //
  // 		console.log("copy ok");
  // 		console.log("consume time:" + (new Date().getTime() - start))
  // 	}
  // });






  window.versionManager = new VersionManager();

}

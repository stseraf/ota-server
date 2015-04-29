var fs = require("fs");
var tar = require("tar");
var zlib = require('zlib');
var xml = require('node-xml-lite')
var exec = require("child_process").exec;

var updatesForVin = [];
var UPDATES_PATH = 'updates';

updatesForVin['12345678'] = false;

function checkVersion(terget_version, path) {
   var updates_version = '';
   fs.createReadStream(path)
      .on('error', console.log)
      .pipe(zlib.Unzip())
      .pipe(tar.Parse())
      .on('entry', function(entry) {
         if (/\.xml$/.test(entry.path)) { // only extract XML files, for instance
            entry.pipe(fs.createWriteStream('updates/test.xml')
               .on('finish', function() {
                  var file = xml.parseFileSync('updates/test.xml');
                  var pase_updates = file['childs'];
                  for(i in pase_updates) {
                     if(pase_updates[i]['name'] === 'PASE-IMAGE') {
                        updates_version = pase_updates[i]['childs'][0]['attrib']['version'];
                        console.log('Version: ' + updates_version);
                     }
                  }
               }));
         }
      });
   while(updates_version === '') {
      require('deasync').runLoopOnce();
   }
   return (terget_version !== updates_version);
}

function checkVin(vin) {
   var vinList = fs.readFileSync('vin.list').toString().split("\n");
   for(i in vinList) {
      if(vinList[i].indexOf(vin) > -1) {
         console.log('VIN', vin, 'has been found in trusted list');
         return true;
      }
   }
   return false;
}

function findUpdates() {
   return fs.readdirSync(UPDATES_PATH).sort().pop();
}

function test(response, request) {
   console.log("[--------------test--------------------------------");
   response.writeHead(200, {"Content-Type": "text/html"});
   var vin = "12345678";
   console.log('isVinInList returns: ' + checkVin(vin));
   var tmp = updatesForVin[vin];
   console.log('Has updates for vin: ' + tmp);
   var updates = findUpdates();
   var path = UPDATES_PATH + '/' + updates;
   console.log("Updates: " + path);
   response.write("Updates: " + path);
   console.log('Check version: ' + checkVersion('RRWOW_1429546229_1', path));
   response.end();
   console.log("---------------------------------------------------]");
}

function hello(response, request) {
   console.log("[--------------hello-------------------------------");
   console.log(request.headers)
   response.writeHead(200, {"Content-Type": "text/plain"})
   response.write("Hello, I'm SWDL server!");
   console.log("---------------------------------------------------]");
   response.end();
}

function check(response, request) {
   console.log("[--------------chech_for_updates-------------------");
   var vin = request.headers['vin'];
   var target_version = request.headers['version'];
   console.log("VIN: " + vin);
   console.log("Version: " + target_version);

   var updates_path = UPDATES_PATH + '/' + findUpdates();

   if(checkVin(vin)) {
      updatesForVin[vin] = checkVersion(target_version, updates_path);
      response.writeHead(200, {
         "Content-Type": "text/plain",
         "update": updatesForVin[vin]
      });
      console.log(updatesForVin[vin] ? "Have updates for VIN" : "No updates for VIN", vin);
      response.write(updatesForVin[vin] ? "Have updates" : "No updates");

      response.end();
      console.log("---------------------------------------------------]");
      return;
   }

   response.writeHead(403, {"Content-Type": "text/plain"})
   response.write("VIN is not in list");
   response.end();
   console.log("---------------------------------------------------]");
}

function get(response, request) {
   console.log("[------------------get_update-----------------------");
   var vin = request.headers['vin'];
   var target_version = request.headers['version'];
   console.log("VIN: " + vin);
   console.log("Version: " + target_version);

   if(!checkVin(vin)) {
      console.log("VIN is not in list");
      response.writeHead(403, {"Content-Type": "text/plain"})
      response.write("VIN is not in list");
      console.log("---------------------------------------------------]");
      response.end();
      return;
   }

   if(!updatesForVin[vin]) {
      console.log("Updates not checked");
      response.writeHead(204, {"Content-Type": "text/html"});
      response.write("Updates not checked");
      console.log("---------------------------------------------------]");
      response.end();
      return;
   }

   var updates_path = UPDATES_PATH + '/' + findUpdates();
   console.log("Updates: ", updates_path);
   fs.exists(updates_path, function (exists) {
      if(exists) {
         console.log("Getting file stats");
         var stat = fs.statSync(updates_path);

         response.writeHead(200, {
            'Content-Type': 'application/x-tar',
            'Content-Length': stat.size,
            'Content-Disposition': 'attachment; filename=update.tar.gz'
         });

         console.log("About to send a file");
         var readStream = fs.createReadStream(updates_path);
         readStream.pipe(response);
         console.log("File has been sent");
         console.log("---------------------------------------------------]");
      }
      else {
         console.log("No updates");
         response.writeHead(204, {"Content-Type": "text/html"});
         response.write("No updates");
         response.end();
      }
   });
}

exports.hello = hello;
exports.check = check;
exports.get = get;
exports.test = test;

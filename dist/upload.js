#!/usr/bin/env node
"use strict";

var fs = require("fs");
var fetch = require("node-fetch");
var FormData = require("form-data");
var util = require("util");

function upload(channel, path) {
  console.log("110 path " + util.inspect(path) + "\n");
  console.log("111 channel " + util.inspect(channel) + "\n");
  return new Promise(function (resolve, reject) {
    var form = new FormData();
    form.append("channels", channel);
    //form.append("channels", "@ed");
    console.log("111 formdata " + util.inspect(form) + "\n");
    form.append("token", process.env.SLACK_API_TOKEN);
    //console.log("112 formdata " + util.inspect(form) + "\n");
    //form.append("file", fs.createReadStream(path));  //NOTE: This became to fail somehow suddenly... https://github.com/form-data/form-data#notes
    var buf = fs.readFileSync(path);
    form.append("file", buf, {
      filename: path,
      contentType: "image/png",
      knownLength: buf.length
    });

    return fetch("https://slack.com/api/files.upload", { method: "POST", body: form }).then(function (res) {
      return(
        /*
         * {ok: true, file: {...}}    See https://api.slack.com/types/file
         */
        res.json()
      );
    }).then(function (e) {
      return e.ok ? resolve(e) : reject(new Error(JSON.stringify(e)));
    }).catch(function (err) {
      return reject(err);
    });
  });
}

module.exports = {
  upload: upload
};

if (require.main === module) {
  var channel = process.env.SLACK_CHANNEL_NAME || "#api-test";
  upload(channel, process.argv[2]).then(function (json) {
    return console.log(json);
  }).catch(function (err) {
    return console.error(err);
  });
}

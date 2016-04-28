#!/usr/bin/env node
const {exec, execSync} = require('child_process')

const feed = require('feed-read')
const fs = require('fs')
const path = require('path')

let last_date = null
let rss_url = 'http://googlechromereleases.blogspot.com/atom.xml'

let execSyncSafe = function (command) {
  try {
    execSync(command)
  } catch (e) {
  }
}

var upload_queue = [];
var upload = function() {
  if (upload_queue.length == 0) return;

  var a = upload_queue[0];
  console.log('Snapshoting', a.version);
  fs.writeFileSync(path.join('changelog', a.version + '.title'), a.title);
  fs.writeFileSync(path.join('changelog', a.version + '.html'), a.content);
  execSyncSafe('git add changelog');
  execSyncSafe(`git commit changelog -m ${a.version}`);
  execSyncSafe('git pull --rebase');
  execSyncSafe('git push');
  exec('./script/sync ' + a.version + ' && ./script/upload', function() {
    upload_queue.shift();
    upload();
  });
}

var parse = function(article) {
  try {
    result = article.content.match(/\d+\.\d+\.\d+\.\d+/);
    if (result == null) return null;

    return {
      title: article.title,
      version: result[0],
      content: article.content
    };
  } catch (e) {
  }
  return null;
}

var check = feed.bind(this, rss_url, function(err, articles) {
  if (last_date == null)
    last_date = articles[0].published;

  if (err || articles.length == 0) return;
  if (last_date == articles[0].published) return;

  articles = articles.reverse();
  for (var i in articles) {
    if (articles[i].published <= last_date)
      continue;

    var a = parse(articles[i]);
    if (a != null) {
      upload_queue.push(a);
      if (upload_queue.length == 1)
        upload();
    }
  }

  last_date = articles[articles.length - 1].published;
});

// Start checking.
check();
setInterval(check, 60 * 60 * 1000);  // hourly.

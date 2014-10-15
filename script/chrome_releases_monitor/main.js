#!/usr/bin/env node
var exec = require('child_process').exec;
var feed = require('feed-read');
var fs = require('fs');
var path = require('path');
var runas = require('runas');

var last_date = null;
var rss_url = 'http://googlechromereleases.blogspot.com/atom.xml';

var upload_queue = [];
var upload = function() {
  if (upload_queue.length == 0) return;

  var a = upload_queue[0];
  console.log('Snapshoting', a.version);
  fs.writeFileSync(path.join('changelog', a.version + '.title'), a.title);
  fs.writeFileSync(path.join('changelog', a.version + '.html'), a.content);
  runas('git', ['push', '--delete', 'v' + a.version]);
  runas('git', ['add', 'changelog']);
  runas('git', ['commit', 'changelog', '-m', a.version]);
  runas('git', ['pull', '--rebase']);
  runas('git', ['push']);
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

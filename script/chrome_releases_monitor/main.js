#!/usr/bin/env node
var exec = require('child_process').exec;
var feed = require('feed-read');
var fs = require('fs');

var last_date = null;
var rss_url = 'http://googlechromereleases.blogspot.com/atom.xml';

var upload_queue = [];
var upload = function() {
  if (upload_queue.length == 0) return;

  var a = upload_queue[0];
  console.log('Snapshoting', a.version);
  fs.writeFileSync(a.version + '.title', a.title);
  fs.writeFileSync(a.version + '.content', a.content);
  exec('./script/sync ' + a.version + ' && ./script/upload', function() {
    fs.unlinkSync(a.version + '.title');
    fs.unlinkSync(a.version + '.content');
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
  if (err || articles.length == 0) return;
  if (last_date == articles[0].published) return;

  if (last_date == null)
    last_date = articles[5].published;

  if (last_date == null) {
    last_date = articles[0].published;
    return;
  }

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

  last_date = articles[0].published;
});

// Start checking.
check();
setInterval(check, 60 * 60 * 1000);  // hourly.

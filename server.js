var express = require('express');
var app = express();
const Discord = require("discord.js");
const client = new Discord.Client();
var logger = require('winston');
const request = require("request");
const randomstring = require('randomstring')
const DigitalOcean = require('do-wrapper').default
const _ = require('underscore')

client.login("");//Discord Secret Key for the BOT

app.get('/', function(request, response) {
  response.send("Polar Cop Discord Checker");
});

client.on("message", (message) => {
  if (message.content.startsWith("?help")) {
    message.channel.send("```V1:\n\nHELP:\n\nSend '?proxy <ip:port>' to check proxies.\n\nSend '?news' to get the latest polarcop news letter.\n\nSend '?getProxy <us/uk>' to get a free proxy.\n\nSend '?proxyGen <Digital Ocean API Key> <Region(UK/US)> <Number of Proxies (1-10)>' to create a proxy.\n\nSend '?proxyWipe <Digital Ocean API Key> to delete all proxies.```");
  } else if (message.content.startsWith("?proxy")) {
    polarProxy(message);
  } else if (message.content.startsWith("?news")) {
    polarNews(function(res, title, messagea, img, time) {
      if (res) {
        sendEmbeddNews(message, title, messagea, img, time);
      } else {
        message.channel.send("```FAILED TO FETCH NEWS!```");
      }
    });
  } else if (message.content.startsWith("?getProxy")) {
    var country = message.content.replace('?getProxy ', '');
    if (country.toLowerCase() == "us") {
      message.reply('Retrieving ....')
        .then(msg => {
          msg.delete(20000)
        })
      polarProxyPull("US", function(result, proxy) {
        message.reply('Checking ....')
          .then(msg => {
            msg.delete(20000)
          })
        proxyCheck('https://supremenewyork.com', proxy, function(supremeProxy) {
          proxyCheck('https://www.nike.com/', proxy, function(nikeProxy) {
            proxyCheck('https://undefeated.com', proxy, function(undefeatedProxy) {
              proxyCheck('https://kith.com', proxy, function(kithProxy) {
                console.log("Done")
                message.channel.send("```Free Proxy: " + proxy + "\n\nSupreme: " + supremeProxy + "\n\nNike: " + nikeProxy + "\n\nUndefeated: " + undefeatedProxy + "\n\nKith: " + kithProxy + "```");
              });
            });
          });
        });
      });
    } else if (country.toLowerCase() == "uk") {
      message.reply('Retrieving ....')
        .then(msg => {
          msg.delete(20000)
        })
      polarProxyPull("GB", function(result, proxy) {
        message.reply('Checking ....')
          .then(msg => {
            msg.delete(20000)
          })
        proxyCheck('https://supremenewyork.com', proxy, function(supremeProxy) {
          proxyCheck('https://nike.com', proxy, function(nikeProxy) {
            proxyCheck('https://undefeated.com', proxy, function(undefeatedProxy) {
              proxyCheck('https://kith.com', proxy, function(kithProxy) {
                console.log("Done")
                message.channel.send("```Free Proxy:  " + proxy + "\n\nSupreme: " + supremeProxy + "\n\nNike: " + nikeProxy + "\n\nUndefeated: " + undefeatedProxy + "\n\nKith: " + kithProxy + "```");
              });
            });
          });
        });
      });
    } else if (country.toLowerCase() == "gb") {
      message.reply('Retrieving ....')
        .then(msg => {
          msg.delete(20000)
        })
      polarProxyPull("GB", function(result, proxy) {
        message.reply('Checking ....')
          .then(msg => {
            msg.delete(20000)
          })
        proxyCheck('https://supremenewyork.com', proxy, function(supremeProxy) {
          proxyCheck('https://nike.com', proxy, function(nikeProxy) {
            proxyCheck('https://undefeated.com', proxy, function(undefeatedProxy) {
              proxyCheck('https://kith.com', proxy, function(kithProxy) {
                console.log("Done")
                message.channel.send("```Free Proxy: " + proxy + "\n\nSupreme: " + supremeProxy + "\n\nNike: " + nikeProxy + "\n\nUndefeated: " + undefeatedProxy + "\n\nKith: " + kithProxy + "```");
              });
            });
          });
        });
      });
    }else if (message.content.startsWith("?featureRequest")) {


    }else {
      message.channel.send("```Invalid Request!```");
    }
  }else if (message.content.startsWith("?latest")){
    polarCopLatest(function(success, version){
      if (success){
        message.channel.send("The latest production version is: "+version+"");
      }else{
        message.channel.send("Unable to fetch the latest build version. DM @offline#1977");
      }
    });
  }else if (message.content.startsWith("?proxyGen")) {
    proxyGen(message)
  }else if (message.content.startsWith("?proxyWipe")){
    var rawMessage = message.content.replace('?proxyWipe ', '');
    var rawArray = rawMessage.split(" ");
    var apiKey = rawArray[0];
    wipe(apiKey, message)
  }
});

function polarNews(callback) {
  request({
    method: "GET",
    url: "", //Provide your own news api
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36"
    },
    time: 500
  }, function(error, response, body) {
    if (error) {
      return callback(true, "", "", "", "");
    } else {
      try {
        if (response.statusCode == 200) {
          var news = JSON.parse(body);
          return callback(true, news.title, news.message, news.image, news.date);
          console.log(news.image);
        } else {
          return callback(true, "", "", "", "");
        }
      } catch (err) {
        console.log(err);
        return callback(true, "", "", "", "");
      }
    }
  });
}

function polarProxyPull(country, callback) {
  request({
    method: "GET",
    url: "" + country, //Proxy API, there are many free versions, just search around.
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36"
    },
    time: 500
  }, function(error, response, body) {
    if (error) {
      return callback(false);
    } else {
      try {
        if (response.statusCode == 200) {
          var proxies = JSON.parse(body);
          //var rand = Math.floor(Math.random() * proxies.length);
          return callback(true, proxies.ip + ":" + proxies.port);
        } else {
          return callback(false, "");
        }
      } catch (err) {
        console.log(err);
        return callback(false, "");
      }
    }
  });
}

async function polarProxy(message) {
  var globalmessage = message
  var proxy = message.content.replace('?proxy ', '');
  message.reply('Checking ....')
    .then(msg => {
      msg.delete(20000)
    })
  proxyCheck('https://supremenewyork.com', proxy, function(supremeProxy) {
    proxyCheck('https://nike.com', proxy, function(nikeProxy) {
      proxyCheck('https://undefeated.com', proxy, function(undefeatedProxy) {
        proxyCheck('https://kith.com', proxy, function(kithProxy) {
          console.log("Done")
          globalmessage.channel.send("```CHECKING: " + proxy + "\n\nSupreme: " + supremeProxy + "\n\nNike: " + nikeProxy + "\n\nUndefeated: " + undefeatedProxy + "\n\nKith: " + kithProxy + "```");
        });
      });
    });
  });

}

function proxyCheck(url, proxy, callback) {
  request({
    method: "GET",
    url: url,
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36"
    },
    time: 500,
    proxy: "http://" + proxy,
  }, function(error, response, body) {
    if (error) {
      return callback("INVALID");
    } else {
      try {
        if (response.statusCode == 200) {
          return callback("PASSED" + " (" + response.elapsedTime + " ms)");
        } else {
          return callback("BLOCKED");
        }
      } catch (err) {
        return callback("INACTIVE");
      }
    }
  });
}

function polarCopLatest(callback) {
  request({
    method: "GET",
    url: "",//URL for version in the json form {"latest": "x.x.x"}
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36"
    },
    time: 500
  }, function(error, response, body) {
    if (error) {
      return callback(false);
    } else {
      try {
        if (response.statusCode == 200) {
          return callback(true, JSON.parse(body).latest);
        } else {
          return callback(false, "");
        }
      } catch (err) {
        console.log(err);
        return callback(false, "");
      }
    }
  });
}

function sendEmbeddNews(Message, title, message, img, time) {
  console.log(img);
  const embed = new Discord.RichEmbed()
    .setTitle(title)
    .setDescription(message)
    .setImage(img)
    .setTimestamp()
    .setURL("https://polarcop.com/blog")
    .setFooter("This news article was provided by PolarCop - " +time)
  Message.channel.send({
    embed
  });
}

//--------------------PROXY GENERATOR --------------------------//
var proxyList = []
var proxyListString = ""

function proxyGen(message){
  var rawMessage = message.content.replace('?proxyGen ', '');
  var rawArray = rawMessage.split(" ");
  var APIKEY = rawArray[0];
  var region = rawArray[1];
  var proxiesToCreate = rawArray[2];
  if(APIKEY != undefined){
    if(APIKEY.length > 5){
       if (region == "UK" || region == "US"){
        if (region == "UK"){
          region = "lon1"
        }else{
          region = "nyc3"
        }
        if (proxiesToCreate != undefined){
            if (proxiesToCreate > 0 && proxiesToCreate < 10){
              var api = new DigitalOcean(APIKEY, '9999');
              let proxyNumber = parseInt(proxiesToCreate);
              for(var i=0; i< proxyNumber; i++){
                createDroplet(message, api, region, APIKEY, proxiesToCreate);
                if(proxyNumber == (i + 1)){
                   message.channel.send("We have succeessfully created your proxies. They will be messaged to you when they are ready!");
                    setTimeout(function(){
                      console.log("List:")
                      console.log(proxyList)
                      for (var z = 0; z < proxyList.length; z++){
                        console.log("Getting Proxies");
                        getProxies(APIKEY, proxyList[z].name, message, proxyList[z].username, proxyList[z].password);
                        if ((z + 1) == (proxyList.length)){
                          console.log("Waiting to send proxies");
                          setTimeout(function(){
                            message.channel.send("```Proxies Generated:\n\n"+proxyListString+"\n\n```")
                          }, 12000);
                        }
                      }
                    }, 6000);
                }
              }

            }else{
            message.channel.send("```OUTPUT:\n\nPlease enter the number of proxies you desire, the value must be greater than 1 but less than 10.```");
            }
        }else{
           message.channel.send("```OUTPUT:\n\nPlease enter the number of proxies you desire.```");
        }
      }else{
       message.channel.send("```OUTPUT:\n\nThe region entered does not exist.```");
       console.log("failed");
      }
    }else{
       message.channel.send("```OUTPUT:\n\nPlease provide a valid API key.```");
    }
  }else{
    message.channel.send("```OUTPUT:\n\nPlease provide an API key.```");
  }
}

function createDroplet(message, api, region, APIKEY, proxiesToCreate){
  var username = "polarcop";
  var password = randomstring.generate(6);
  var dropletName = randomstring.generate(14) + '-polarcop';
  var dropletData = {
    name: dropletName,
    region: region,
    size: '512mb',
    image: "34487567",
    ssh_keys: [null],
    monitoring: true,
    user_data:
      '#!/bin/bash \n' +
      'yum install squid wget httpd-tools -y &&' +
      'touch /etc/squid/passwd &&' +
      `htpasswd -b /etc/squid/passwd ${username} ${password} &&` +
      'wget -O /etc/squid/squid.conf https://raw.githubusercontent.com/dzt/easy-proxy/master/confg/userpass/squid.conf --no-check-certificate &&' +
      'touch /etc/squid/blacklist.acl &&' +
      'systemctl restart squid.service && systemctl enable squid.service &&' +
      'iptables -I INPUT -p tcp --dport 3128 -j ACCEPT &&' +
      'iptables-save'
  };
  api.dropletsCreate(dropletData, function(err, resp, body) {
    if (!err){
      var proxy = {
        "name": dropletName,
        "username": username,
        "password": password
      }
      console.log("Created: ")
      console.log(proxy);
       proxyList.push(proxy);
    }
  });
}

function getProxies(APIKEY, dropletName ,message, username, password){
var api = new DigitalOcean(APIKEY, '9999');
 api.dropletsGetAll({}, function(err, resp, body) {
                    console.log(body);
                    ///*
                   var id = _.findWhere(resp.body.droplets, {
                        name: dropletName
                    }).id;

                    var host = _.findWhere(resp.body.droplets, {
                        name: dropletName
                    }).networks.v4[0].ip_address;
   console.log("found" + username + ":" + password + "@" + host + ":" + '3128' + "\n");
   proxyListString += username + ":" + password + "@" + host + ":" + '3128' + "\n";
   console.log("String");
   console.log(proxyListString);
 });
}

function wipe(apiKey, message){
   var api = new DigitalOcean(apiKey, "9999");
    var droplets = [];
    api.dropletsGetAll({}, function(err, resp, body) {
        if (err) {
            console.log(err);
            message.channel.send("```OUTPUT:\n\nThere was an error wiping proxies.```");
        }

        for (var i = 0; i < body.droplets.length; i++) {
            var id = body.droplets[i].id;
            var dropletName = body.droplets[i].name;
            if (dropletName.endsWith('-polarcop')) {
                api.dropletsDelete(id, function(err, resp, body) {});
            }
        }

        message.channel.send("```OUTPUT:\n\nAll proxies have been wiped.```");

        //console.log(body);
    });
}

//--------------------PROXY GENERATOR--------------------------//


// listen for requests :)
var listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});

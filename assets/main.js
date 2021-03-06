//get the webview
const webview = document.querySelector('webview');

//get title
const title = document.querySelector('title');

//get the navbar
const bar = document.querySelector('.bar');

//get the path of json file
const path = __dirname+'/data.json';

//import electron
const {shell} = require('electron');
const urlExists = require("url-exists");

//set $ to jQuery function
const $ = jQuery;

//Check language
if (osLocale.sync().indexOf("fr_FR") > -1 || osLocale.sync().indexOf("fr_BE") >-1) {
  var lang = require("./assets/lang/fr.js");
} else if (osLocale.sync().indexOf("en_US") > -1 || osLocale.sync().indexOf("en_EN") > -1) {
  var lang = require("./assets/lang/en.js");
} else {
  var lang = require("./assets/lang/en.js");
}

webview.addEventListener("did-stop-loading", function() {
    title.innerHTML = webview.getTitle();
});

//Remove the mouswheel click
(function() {
  function callback(e) {
    var e = window.e || e;
    if (e.target.localName == 'a') {
      e.preventDefault();
    }
    return
  }

  if (document.addEventListener) {
    document.addEventListener('auxclick', callback, false);
  } else {
    document.attachEvent('onauxclick', callback);
  }
})();

  bar.addEventListener("mousewheel", scrollHorizontally, false);

//function to open the url of the webview
function showWebsite(url) {
    console.info("online");
    //if there is http:// or https:// in valu we load the web page
    if (url.indexOf("http://") == 0 || url.indexOf("https://") == 0) {
        $.ajax({
            url: `${url}`,
            context: document.body,
            error: function(jqXHR, exception) {
                webview.loadURL("file://"+__dirname+"/404.html");
            },
            success: function() {
                webview.loadURL(url);
            }
        });
    } else if (url.indexOf("http://") == -1) {
        $.ajax({
            url: `http://${url}`,
            context: document.body,
            error: function(jqXHR, exception) {
                webview.loadURL("file://"+__dirname+"/404.html");
            },
            success: function() {
                webview.loadURL("http://"+url);
            }
        });
    } else {
        console.log("Error at loading");
    }
}

//Add horizontall scroll for navbar
function scrollHorizontally(e) {
    e = window.event || e;
    var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
    document.documentElement.scrollLeft -= (delta*40); // Multiplied by 40
    document.body.scrollLeft -= (delta*40); // Multiplied by 40
    e.preventDefault();
}

//Function for add website
function addWebsite() {
  vex.dialog.open({
      //we ask the url to the user
      message: lang.EnterUrl,
      input: [
          '<input name="URL" type="text" placeholder="http://" required />',
      ].join(''),
      buttons: [
          $.extend({}, vex.dialog.buttons.YES, { text: lang.addButton }),
          $.extend({}, vex.dialog.buttons.NO, { text: lang.CancelButton })
      ],
      callback: function (data) {
          if (data) {
            console.log('URL', data.URL);
            if (!/^https?:\/\//i.test(data.URL)) { // add http protocol to the url to make url-exists
                data.URL = 'http://' + data.URL;
            }
            urlExists(data.URL, function(err, exists) { //verify that the url exists
                if(exists) {
                  //we open the data.json file
                  var save = fs.createWriteStream(path, {
                      flags: 'a'
                  });
      
                  //we write the json file with the url given by the user
                  save.write(',{"web":"'+data.URL+'"}');
                  save.end()
                  
                  //we set a random id for the new bookmark
                  var RandomID = Math.floor((Math.random() * 10000) + 1000);
  
                  //we remove the add button so that the new button does not cover it
                  document.querySelector('.add-btn').remove();
                  //we add the new button
                  $("<a href=\"#\" id=\""+RandomID+"\" class=\"btn\" url=\""+data.URL+"\" title=\""+data.URL+"\" onclick='showWebsite(\""+data.URL+"\")'></a>").appendTo(bar);
                  //we set the background-color
                  getColor(data.URL, RandomID);
                  //we add the add button
                  $("<a href=\"javascript:addWebsite()\" class=\"add-btn\"></a>").appendTo(bar);
                  //we initialize the right-click function
                  rightClick();
                } else {
                    vex.dialog.alert("This URL doesn't exists. Please retry.");
                    console.log("This URL doesn't exists. Please retry.");
                }
            });
        }
    }
  });
}

      var browser = remote.getCurrentWindow();
      webview.addEventListener("enter-html-full-screen", function() {
        browser.setFullScreen(true);
        bar.style.display = "none";
        webview.style.bottom = "0px";
      });
      webview.addEventListener("leave-html-full-screen", function() {
        browser.setFullScreen(false);
        bar.style.display = "block";
        webview.style.bottom = "50px";
      });

//we load the json file
 loadJSON(function(response) {
    var link = JSON.parse(response+"]");
    console.log(link);
    updateBar(link);
 }, path);

//function to load a json file
 function loadJSON(callback, jsonfile) {   
    var xobj = new XMLHttpRequest();
        xobj.overrideMimeType("application/json");
    xobj.open('GET', jsonfile, true);
    xobj.onreadystatechange = function () {
          if (xobj.readyState == 4 && xobj.status == "200") {
            callback(xobj.responseText);
          }
    };
    xobj.send(null);  
 }

//function to set the color of the background with the main the favicon
function getColor(link, key) {
  var url = "https://icons.better-idea.org/allicons.json?url=" + link.toLowerCase();
  var image = "";
  $.getJSON(url, function(data) {
      if (typeof data.icons !== 'undefined') {
          image = data.icons[0].url;
      }
      $(document).find('#' + key).css('background-image', "url(" + image + ")");
  });
}

//we show the buttons
function updateBar(link) {
  bar.innerHTML = "";
  for (var key in link) {
   $("<a href=\"#\" url=\""+link[key].web+"\" class=\"btn\" id=\""+key+"\" title=\""+link[key].web+"\" onclick='showWebsite(\""+link[key].web+"\")'></a>").appendTo(bar);
    getColor(link[key].web, key);
  }
  $("<a href=\"javascript:addWebsite()\" class=\"add-btn\"></a>").appendTo(bar);
  rightClick();
}

//function to remove an bookmark with a right click
function rightClick() {
    $('.btn').on("contextmenu", function (e) {
      if (this.id == "0") {
        console.warn("Nope");
      } else {
        var id = this.id;
        console.log(id);

        var UrlToRemove = $("#"+id).attr("url");
        console.log(UrlToRemove);
        removeWebsite(id, UrlToRemove);
      }
    });
}

//removing function of bookmark
function removeWebsite(ida, url) {
  vex.dialog.confirm({
      message: lang.Remove +url+ lang.FBM,
      buttons: [
        $.extend({}, vex.dialog.buttons.YES, {
          text: lang.ContinueButton
        }),
        $.extend({}, vex.dialog.buttons.NO, {
          text: lang.CancelButton
        })
      ],
      callback: function (value) {
        var id = ida;
          if (value) {
            var ButtonToRemove = document.getElementById(id);
            ButtonToRemove.remove();
            replace({
              regex: ',{"web":"'+url+'"}',
              replacement: "",
              paths: [''+path+''],
              recursive: true,
              silent: true,
            });

          }
      }
  }, vex.closeAll());
}

rightClick();
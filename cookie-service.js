//This is code that provides the expected cookie api---get and set.
// modify url if you are using your own hosted cookie server


//WARNING: can't use $().on and $().off because jquery's event normalization
//removes the necessary fields event.source, event.origin, event.data


MakeCookieService = function(url) {
    
    var 
    url = url || "http://people.csail.mit.edu/karger/Cookie/cookie-server.html",
    serverWindow,
    frame,
    loading = $.Deferred();


    var init = function() {
	var onLoad = function(event) {
	    if (event.source !== frame.get(0).contentWindow) 
		return; //wrong event

	    window.removeEventListener("message",onLoad);
	    serverWindow = event.source;
	    loading.resolve();
	}
	window.addEventListener("message", onLoad, false);
	frame = $('<iframe src="' + url + '"></iframe>'); //server will send
							  //message on load
	frame.hide();
	$("body").append(frame);
    };


    var setCookie = function (name, value, days) {
	loading.done(function() {
		serverWindow.postMessage({cmd: "set", 
					  name: name,
					  value: value,
					  days: 7
		    },"*");
	    });
    };

    var getCookie = function(name, cont) {
	loading.done(function() {
		var returnData = function(event) {
		    if (event.source === serverWindow) {
			window.removeEventListener("message", returnData);
			if (cont) cont(event.data);
		    }
		};
		window.addEventListener("message", returnData, false);
		serverWindow.postMessage({cmd: "get", name: name},"*");
	    });
    };

    init();
    return({setCookie: setCookie, getCookie: getCookie});
}



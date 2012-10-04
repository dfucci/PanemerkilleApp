 //var endpoint = "http://panemerkille.herokuapp.com";
 var user = {};
 var eventObj = {};
 var venueObj = {}; // TODO: refactor
 var platform;

 $('#FBLogout').live('tap', function() {
	mixpanel.track("Logout");
 	$.mobile.loading('show', {
 		text: 'Logging you out...',
 		textVisible: true,
 		theme: 'a',

 	});
 	window.localStorage.clear();
 	FB.init({
 		appId: "366089376758944",
 		nativeInterface: CDV.FB,
 		useCachedDialogs: false,

 	});
 	FB.logout(function(response) {
 		$.mobile.changePage('connect.html');
 		$.mobile.loading('hide');
 	});
 });

 $('#btn-claimed').live('tap', function() {
	 
	mixpanel.track("Confirm claim"); 
 	var patch = getUrlVars()["id"];
 	$.ajax({
		  type: "POST",
		  url: endpoint + '/users/' + user.id + "/patches/" + patch,
		  data: {claimed: 'true'},
	 	  cache: false,
	 	  timeout: 10000
	
		}).done(function( data ) {
	 		console.log("Patch claimed");
		}).fail(function(jXHR, textStatus) {
			console.log("Error claiming a patch");
	 	});
 	

 });


 $('#parties-page').live('pageshow', function(event) {
	mixpanel.track("Events list"); 
 	$.mobile.loading('show', {
 		text: 'Loading parties...',
 		textVisible: true,
 		theme: 'a',

 	});
 	$.ajax({
 		url: endpoint + "/events",
 		type: "GET",
 		dataType: "json",
 		cache: false,
 	}).done(function(data) {
 		displayParties(data);
 		populateUserFriends();
 	}).fail(function(jXHR, textStatus) {
 		if (textStatus === "timeout") {
 			$.mobile.changePage('timeoutError.html', {
 				transition: 'pop',
 				role: 'dialog'
 			});
 		}
 	});

 });



 
 $('#yourpatches').live('pageshow', function(event) {
	mixpanel.track("My patches list");
 	$.mobile.loading('show', {
 		text: 'Loading your patches...',
 		textVisible: true,
 		theme: 'a',

 	});
 	var id = getUrlVars()["user"];
 	$.ajax({
 		url: endpoint + "/users/" + user.id,
 		type: "GET",
 		dataType: "json",
 		cache: false,
 	}).done(function(data) {
 		displayPatches(data);
 	}).fail(function(jXHR, textStatus) {
 		if (textStatus === "timeout") {
 			$.mobile.changePage('timeoutError.html', {
 				transition: 'pop',
 				role: 'dialog'
 			});
 		}
 	});
 });

 $('#yourcheckins').live('pageshow', function(event) {
	mixpanel.track("My posters wall");
 	$.mobile.loading('show', {
 		text: 'Loading your posters...',
 		textVisible: true,
 		theme: 'a',

 	});
 	var id = getUrlVars()["user"];
 	$.ajax({
 		url: endpoint + "/users/" + id,
 		type: "GET",
 		dataType: "json",
 		cache: false,
 	}).done(function(data) {
 		displayCheckins(data);
 	}).fail(function(jXHR, textStatus) {
 		if (textStatus === "timeout") {
 			$.mobile.changePage('timeoutError.html', {
 				transition: 'pop',
 				role: 'dialog'
 			});
 		}
 	});
 });

 $('#checkedin-page').live('pageshow', displayCheckinStats);

 $('#stream').live('pageshow', displayStream);



 document.addEventListener('deviceready', init, false);

 function init() {
 	$.mobile.loading('show', {
 		text: 'Loading...',
 		textVisible: true,
 		theme: 'a',

 	});
 	platform = device.platform;
 	$.mobile.pushStateEnabled = false;
 	mixpanel.track("App launch");
 	try {
 		FB.init({
 			appId: "366089376758944",
 			nativeInterface: CDV.FB,
 			useCachedDialogs: false,

 		});
 		var timeoutHandler = setTimeout(function() {
 			requestFailed();
 		}, 1000);

 		function requestFailed() {
 			// When this happens, it means that FB API was unresponsive
 			console.log('hey, FB API does not work!');
 		}

 		FB.getLoginStatus(function(response) {
 			clearTimeout(timeoutHandler); // This will clear the timeout in case of proper FB call
 			if (response.status === 'connected') {
 				console.log('connesso');
 				var facebook_id = window.localStorage.getItem('pm_facebook_id');
 				console.log(facebook_id);
 				if (!isUserInStorage()) {
 					console.log('user not in storage');

 					$.ajax({
 						url: endpoint + "/users/",
 						type: "GET",
 						dataType: "json",
 						cache: false,
 						timeout: 10000,
 						data: {
 							facebook_id: facebook_id
 						}
 					}).done(function(data) {
 						if (data.length>0) {
 							user.id = data[0]._id;
 							saveUserStorage(user.id);
 							
 							$.mobile.changePage('parties.html');
 						} else {
 							FB.logout(function(response) {
 						 		$.mobile.changePage('connect.html');
 						 	});
 							
 						}
 						
 					}).fail(function(jXHR, textStatus) {
 						if (textStatus === "timeout") {
 							$.mobile.changePage('timeoutError.html', {
 								transition: 'pop',
 								role: 'dialog'
 							});
 						}
 					});
 				} else {
 					user.id = window.localStorage.getItem("pm_user_id");
 					console.log('user in storage' + user.id);
 	
 					$.mobile.changePage('parties.html');
 				}
 			} else {
 				console.log('non connesso');
 				$.mobile.changePage('connect.html');
 			}
 		}, true);


 	} catch (e) {
 		alert(e);
 	}
 }



 $("#connect").live('pageinit', function() {
 	$.mobile.loading('show', {
 		text: 'Loading...',
 		textVisible: true,
 		theme: 'a',

 	});
 	FB.Event.subscribe('auth.login', function(response) {
 		if (response.authResponse) {
 			FB.api('/me?fields=id,first_name,last_name,birthday,gender,email,picture&type=large', function(response) {
 				registerUser(response.id, response.first_name, response.last_name, response.birthday, response.gender, response.picture, response.email);			
 			});
 		} else {
 			console.log('User cancelled login or did not fully authorize.');
 		}
 	});
 	FB.init({
 		appId: "366089376758944",
 		nativeInterface: CDV.FB,
 		useCachedDialogs: false,

 	});
 	$.mobile.loading('hide');

 });

 $("#fbConnect").live('tap', function(e) {
 	$.mobile.loading('show', {
 		text: 'Logging you in...',
 		textVisible: true,
 		theme: 'a',

 	});
 	FB.login(function(response) {}, {
 		scope: "email, user_birthday, publish_actions, publish_stream"
 	});
 });



 function displayStream(prevPage) {
	mixpanel.track("Stream");
 	$.mobile.loading('show', {
 		text: 'Loading your friends...',
 		textVisible: true,
 		theme: 'a',

 	});
 	$.ajax({
 		url: endpoint + "/users/" + user.id + "/friends",
 		type: "GET",
 		dataType: "json",
 		cache: false,
 		timeout: 10000
 	}).done(function(friends) {
 		$("#streamContent").empty();
 		//TODO: check if there are no friends
 		for (var i = 0; i < friends.length; i++) {
 			var output = '';
 			var myTime = moment(friends[i].checkins[0].timestamp).fromNow();
 			output += '<ul data-role="listview" data-inset="true" id="listview-stream' + i + '"><li data-icon="false"><a href="party.html?id=' + friends[i].checkins[0].event._id + '" data-transition="none">';
 			output += '<img src="' + friends[i].picture_url + '" class="ui-li-thumb profile-stream"/>';
 			output += '<p class="text-stream">' + friends[i].name.firstname + '</p>'
 			output += '<p class="text-stream">' + friends[i].checkins[0].event.name + '</p>';
 			output += '<p class="day-stream">' + myTime + '</p>';
 			output += '<img src="' + friends[i].checkins[0].event.poster_url + '" class="poster-stream"/>';
 			output += '</a></li></ul>';
 			$('#streamContent').append(output);
 			$('#listview-stream' + i).listview();
 		}
 		$.mobile.loading('hide');

 	}).fail(function(jXHR, textStatus) {
 		if (textStatus === "timeout") {
 			console.log("Timeout exceeded!");
 			$.mobile.changePage('timeoutError.html', {
 				transition: 'pop',
 				role: 'dialog'
 			});
 		}
 	});
 }

 function displayCheckinStats(event) {
	
 	$.mobile.loading('show', {
 		text: 'Loading your stats...',
 		textVisible: true,
 		theme: 'a',

 	});
 	var eventID = getUrlVars()['event'];
 	$(".checkin-event").html(eventObj.name);
 	$(".checkin-venue").html(venueObj.name);

 	$.ajax({
 		url: endpoint + "/users/" + user.id,
 		type: "GET",
 		dataType: "json",
 		cache: false,
 		timeout: 10000
 	}).done(function(data) {
 		updateCheckinsVenue(data)
 	}).fail(function(jXHR, textStatus) {
 		if (textStatus === "timeout") {
 			console.log("Timeout exceeded!");
 			$.mobile.changePage('timeoutError.html', {
 				transition: 'pop',
 				role: 'dialog'
 			});
 		}
 	});

 	//$.getJSON(endpoint + '/users/' + user.id, updateCheckinsVenue);
 }

 function updateCheckinsVenue(data) {
 	var total = 0;
 	var allCheckins = data.checkins;
 	for (var i = 0; i < allCheckins.length; i++) {
 		if (allCheckins[i].event.venue == venueObj.id) total++;
 	}
 	if (total == 1) $("#number-checkins-venue").html('once');
 	else $("#number-checkins-venue").html(total + ' times');
 	var unseen = new Array();
 	for (var i = 0; i < data.patches.length; i++) {
 		console.log(data.patches[i]);
 		if (!data.patches[i].seen) {
 			unseen.push(data.patches[i]);
 		}
 	}

 	$('.list-patch').remove()
 	if (unseen.length == 0) {
 		$("#divider-unlocked").after('<li class="list-patch"><p class="italic">Sorry, this time you did not unlock any patch :-( Keep on coming and checking in!</p></li>');
 		$('#liview-checkin').listview('refresh');
 	} else {
 		var count = 0;

 		for (var i = 0; i < unseen.length; i++) {
 			var id = unseen[i].patch._id;
 			$.ajax({
 				url: endpoint + "/patches/" + id,
 				type: "GET",
 				dataType: "json",
 				cache: false,
 				timeout: 10000
 			}).done(function(patch) {
 				var output = "";
 				output += '<li class="list-patch">';
 				output += '<a href="patch.html?id=' + patch._id + '&claimed=false">';
 				output += '<img src="' + patch.image_url + '" class="ui-li-thumb">';
 				output += '<h3 class="ui-li-heading">' + patch.name + '</h3>'
 				output += '<p class="ui-li-desc">' + patch.description + '</p>';
 				output += '</a></li>';
 				$("#divider-unlocked").after(output);
 				count++;
 				if (unseen.length == count) {
 					$('#liview-checkin').listview('refresh');
 				}

 				$.mobile.loading('hide');
 			}).fail(function(jXHR, textStatus) {
 				if (textStatus === "timeout") {
 					console.log("Timeout exceeded!");
 					$.mobile.changePage('timeoutError.html', {
 						transition: 'pop',
 						role: 'dialog'
 					});
 				}
 			});
 		};
 	}


 }

 function displayParties(data) { // TODO: refactor
 	var boilerplate = "<li  data-role='list-divider' id='li-today'>Today</li>";
 	boilerplate += "<li data-role='list-divider' id='li-tomorrow'>Tomorrow</li>";
 	boilerplate += "<li data-role='list-divider' id='li-upcoming'>Upcoming</li>";
 	$('#parties-listview').html(boilerplate);
 	var noPartyToday = true;
 	var noPartyTomorrow = true;
 	var noPartyUpcoming = true;
 	
 	$.each(data.reverse(), function(index, party) {
 		var out = '';
 		var sTime = moment(party.time.start).toDate();
 		var sEnd = moment(party.time.end).toDate();
 		var sHour = trailingZero(sTime.getHours());
 		var sMinute = trailingZero(sTime.getMinutes());
 		var sDay = "Next " + dayName(sTime.getDay());
 		var featured = "";
 		if (party.venue.featured) {
 			featured += "<img class='featured' src='images/corner.png'/>";
 		}
 		if (isGoingOn(sTime, sEnd)) {
 			noPartyToday = false;
 			out += "<li><a href='party.html?id=" + party._id + "' data-transition='none'><img src='" + party.poster_url + "' class='ui-li-thumb' /><h3>" + party.name + featured + "</h3><p>" + party.venue.name + " - Now</p></a></li>";
 			$('#li-today').after(out);
 		} else if (isToday(sTime)) 	{
 			noPartyToday = false;
 			out += "<li><a href='party.html?id=" + party._id + "' data-transition='none'><img src='" + party.poster_url + "' class='ui-li-thumb' /><h3>" + party.name + featured + "</h3><p>" + party.venue.name + " - " + sHour + ":" + sMinute + "</p></a></li>";
 			$('#li-today').after(out);
 		} else if (isTomorrow(sTime)) {	
 			noPartyTomorrow = false;
 			out += "<li><a href='party.html?id=" + party._id + "' data-transition='none'><img src='" + party.poster_url + "' class='ui-li-thumb' /><h3>" + party.name + featured + "</h3><p>" + party.venue.name + " - " + sHour + ":" + sMinute + "</p></a></li>";
 			$('#li-tomorrow').after(out);
 			
 		} else  {
 			noPartyUpcoming = false;
 			var today = new Date();
 			var tomorrow = new Date();
 			tomorrow.setDate(today.getDate() + 1);
 			if (tomorrow.getDate() == sTime.getDate()) {
 				sDay = 'Tomorrow';
 			}
 			out += "<li><a href='party.html?id=" + party._id + "' data-transition='none'><img src='" + party.poster_url + "' class='ui-li-thumb'/><h3>" + party.name + featured + "</h3><p>" + party.venue.name + " - " + sDay + " " + sHour + ":" + sMinute + " </p></a></li>";
 			$('#li-upcoming').after(out);
 		}
 	});
 	if (noPartyToday) {
 		$('#li-today').after("<li><p  class='italic no-event'>Unfortunately there's nothing going on tonight. </p><p class='italic no-event'>Take some time to sew your patches ;)</p></li>");
 	}
 	if (noPartyTomorrow) {
 		$('#li-today').after("<li><p  class='italic no-event'>Unfortunately there's nothing planned for tomorrow. </p><p class='italic no-event'> Yet.</p></li>");
 	}
 	if (noPartyUpcoming) {
 		$('#li-upcoming').after("<li><p  class='italic no-event'>Unfortunately there are no upcoming events. </p><p class='italic no-event'>It might be the right time to take have rest :)</p></li>");

 	}
 	$("#parties-listview").listview('refresh');

 	$.mobile.loading('hide');
 }



 function trailingZero(time) {
 	if (time < 10) {
 		time = "0" + time.toString();
 	}
 	return time;
 }

 function dayName(day) {
 	return dayname = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][day];
 }

 function isToday(pDate) {
 	var today = new Date();
 	return ((today.getFullYear() == pDate.getFullYear()) && (today.getMonth() == pDate.getMonth()) && (today.getDate() == pDate.getDate()));
 }

 function isTomorrow(pDate) {
 	var today = new Date();
 	var tomorrow = new Date();
 	tomorrow.setDate(today.getDate() + 1);
 	return ((tomorrow.getFullYear() == pDate.getFullYear()) && (tomorrow.getMonth() == pDate.getMonth()) && (tomorrow.getDate() == pDate.getDate()));

 }

 function isGoingOn(start, end) {
 	var now = new Date();
 	return ((start <= now) && (end >= now));
 }

 function displayCheckins(data) {
 	var checkins = data.checkins;
 	if (checkins.length > 0) {
 		var blocks = ['a', 'b', 'c', 'd'];
 		$.each(
 		checkins, function(index, c) {
 			var event_id = c.event._id;
 			var event_name = c.event.name;
 			var event_poster = c.event.poster_url;
 			var k = index % 4;
 			var cls = "ui-block-" + blocks[k];
 			$('#checkingrid').append('<div class=' + cls + '> <a href="userCheckin.html?id=' + event_id + '" data-ajax="false data-transition="none"><div><img class=poster src="' + event_poster + '"></div></a></div>');
 		});
 	} else {
 		$('#yourcheckins-content').append('<p class="italic">It looks pretty empty around here. Attend some party and watch your poster wall filling up ;)</p>');
 	}
 	$.mobile.loading('hide');

 }

 function displayPatches(data) {
 	var patches = data.patches;
 	if (patches.length > 0) {
 		console.log(patches);
 		var blocks = ['a', 'b', 'c', 'd'];
 		$('#patchgrid').empty();
 		$.each(
 		patches, function(index, p) {
 			var patch_name = p.patch.name;
 			var patch_image = p.patch.image_url;
 			var patch_id = p.patch._id;
 			var k = index % 4;
 			var cls = "ui-block-" + blocks[k];
 			$('#patchgrid').append('<div class=' + cls + '> <a href="patch.html?id=' + patch_id + '&claimed=' + p.claimed + '" data-transition="none"><div class="patch"><img class="patchImg" src="' + patch_image + '"></div></a></div>');
 		});
 	} else {
 		$('#yourpatches-content').append('<p class="italic">It looks pretty empty around here. Attend some party and collect awesome patches ;)</p>');
 	}
 	$.mobile.loading('hide');
 }

 function displayAllPatches(patches) {
	mixpanel.track("All patches list");
 	$('#patchgrid').empty();
 	var blocks = ['a', 'b', 'c', 'd'];

 	$.ajax({
 		url: endpoint + "/users/" + user.id,
 		type: "GET",
 		dataType: "json",
 		cache: false,
 		timeout: 10000
 	}).done(function(user) {

 		userPatches = new Array();
 		for (var int = 0; int < user.patches.length; int++) {
 			var patch = {
 				id: user.patches[int].patch._id,
 				claimed: user.patches[int].claimed
 			};
 			userPatches.push(patch);
 		}
 		console.log(userPatches.length);

 		var patches_ids = $.map(userPatches, function(o) {
 			return o["id"];
 		});
 		var count = 0;
 		$.each(
 		patches, function(index, p) {
 			var patch_name = p.name;
 			var patch_image = p.image_url;
 			var patch_id = p._id;
 			var opaque = "";
 			var k = index % 4;
 			var cls = "ui-block-" + blocks[k];
 			if ($.inArray(p._id, patches_ids) == -1) {
 				href = "#";
 				opaque += " locked";
 			} else {
 				var href = 'patch.html?id=' + patch_id + '&claimed=' + userPatches[count].claimed;
 				count++;
 			}
 			$('#patchgrid').append('<div class="' + cls + '"><a href="' + href + '" data-transition="none"> <div class="patch"><img class="patchImg' + opaque + '" src="' + patch_image + '"/></div></a></div>');
 		});
 		$.mobile.loading('hide');
 	}).fail(function(jXHR, textStatus) {
 		if (textStatus === "timeout") {
 			console.log("Timeout exceeded!");
 			$.mobile.changePage('timeoutError.html', {
 				transition: 'pop',
 				role: 'dialog'
 			});
 		}
 	});

 }

 function displayCheckin(data) {
	mixpanel.track("Single poster");
 	$('#checkinH1').html(data.name);
 	var poster_big = buildBigImg(data.poster_url);
 	$('#checkinContent').html("<img src='" + poster_big + "' />");
 	$.mobile.loading('hide');

 }

 $('#profile').live('pageshow', function() {
	mixpanel.track("Profile");
 	$('#profile-content').hide();
 	$.mobile.loading('show',{
 		text: 'Loading your profile...',
		textVisible: true,
		theme: 'a',
 	});
 	populateUser(user.id);
 });


 function isUserInStorage() {
 	// var facebook_id = window.localStorage.getItem("pm_facebook_id");
 	var user_id = window.localStorage.getItem("pm_user_id");
 	return user_id != null;

 }

 function saveUserStorage(user_id) {
 	// window.localStorage.setItem("pm_facebook_id", facebook_id);
 	window.localStorage.setItem("pm_user_id", user_id);
 }

 function populateUser(userid) {
 	$("#userPatchesLink").attr('href', 'userPatches.html?user=' + userid);
 	$("#userCheckinLink").attr('href', 'userCheckins.html?user=' + userid);

 	$.ajax({
 		url: endpoint + "/users/" + userid,
 		type: "GET",
 		dataType: "json",
 		cache: false,
 		timeout: 10000
 	}).done(function(data) {
 		$("#picture_url").attr("src", data.picture_url);
 		var picture_url;
 		console.log(data.picture_url);
 		if ( data.picture_url == undefined ||  data.picture_url  == null ) 
 			picture_url = "images/facebookquestionmark.jpg"; 
 		else
 			picture_url = data.picture_url;
 		$("#profilePicture").html("<img id='profilePictureImg' src='" + picture_url + "'/>");
 		$("#firstname").html(data.name.firstname);
 		$("#surname").html(data.name.surname);
 		$("#patch_counter").html(data.patches.length);
 		$("#checkin_counter").html(data.checkins.length);
 		$('#listview-stats').listview('refresh');
 		$("#profilePictureImg").cropresize({
 			height: 100,
 			width: 100,
 			vertical: 'top'
 		});
 		$('#profile-content').show();
 		 $.mobile.loading('hide');

 	}).fail(function(jXHR, textStatus) {
 		if (textStatus === "timeout") {
 			console.log("Timeout exceeded!");
 			$.mobile.changePage('timeoutError.html', {
 				transition: 'pop',
 				role: 'dialog'
 			});
 		}
 	});
 }


 function populateUserFriends() {
 	FB.init({
 		appId: "366089376758944",
 		nativeInterface: CDV.FB,
 		useCachedDialogs: false,
 	});
	console.log('populateUserFriends');
 	FB.getLoginStatus(function(response) {
 		if (response.status == 'connected') {
 			console.log("Retrieving user friends");
 			var pmFriends = new Array();
 			FB.api('/me/friends', {
 				fields: 'installed'
 			}, function(res) {
 	 			console.log("Answer received");
 				if (res.error) console.log(res.error.message);
 				else {
 		 			console.log("I have got the user friends");
 					for (var i = 0; i < res.data.length; i++) {
 						if (typeof res.data[i].installed != "undefined") {
 							pmFriends.push(res.data[i]);
 						}
 					}
 					var friendsParameter = JSON.stringify(pmFriends);
 					$.ajax({
 						  type: "POST",
 						  url: endpoint + "/users/" + user.id + "/friends",
 						  data: {friends: friendsParameter},
 					 	  cache: false,
 					 	  timeout: 10000
 					
 						}).done(function( data ) {
 							console.log(data);
 						}).fail(function(){
 							console.log("Error posting user friends");
 						});
 					
 					

 				}
 			});

 		} else console.log(response.status);
 	}, true);
 }

 $('#party').live('pageshow', function(event) {
	mixpanel.track("Event info");
 	$.mobile.loading('show', {
 		text: 'Loading party info...',
 		textVisible: true,
 		theme: 'a',

 	});
 	$("#party-content").hide();
 	var id = getUrlVars()['id'];
 	$.ajax({
 		url: endpoint + '/events/' + id,
 		type: "GET",
 		dataType: "json",
 		cache: false,
 		timeout: 10000
 	}).done(function(data) {
 		displayParty(data);
 	}).fail(function(jXHR, textStatus) {
 		if (textStatus === "timeout") {
 			console.log("Timeout exceeded!");
 			$.mobile.changePage('timeoutError.html', {
 				transition: 'pop',
 				role: 'dialog'
 			});
 		}
 	});

 });

 function displayParty(data) {
 	$('#party-header h1').html(data.name);
 	$('#posterImg').attr('src', data.poster_url);
 	$('#party-venue').html(data.venue.name);
 	var start = moment(data.time.start).toDate();
 	var end = moment(data.time.end).toDate();
 	var day = '';
 	var sStart = '';
 	var sEnd = '';
 	var now = moment().toDate();
 	if (end < now) { // TODO: usa switch o qualcosa
 		console.log('party over');
 		sEnd = moment(end).fromNow();
 	} else {
 		if (isGoingOn(start, end)) {
 			day = 'Now';
 		} else if (isToday(start)) {
 			day = 'Today';
 			sStart = ' from ' + trailingZero(start.getHours()) + ":" + trailingZero(start.getMinutes());
 		} else if (isTomorrow(start)) {
 			day = 'Tomorrow';
 			sStart = ' from ' + trailingZero(start.getHours()) + ":" + trailingZero(start.getMinutes());

 		} else {
 			day = "Next " + dayName(start.getDay());
 			sStart = ' from ' + trailingZero(start.getHours()) + ":" + trailingZero(start.getMinutes());

 		}
 		if (isToday(end)) {
 			sEnd = ' until ' + trailingZero(end.getHours()) + ":" + trailingZero(end.getMinutes());
 		} else if (isTomorrow(end)) {
 			sEnd = ' until tomorrow at ' + trailingZero(end.getHours()) + ":" + trailingZero(end.getMinutes());

 		} else {
 			endDay = "next " + dayName(end.getDay());
 			sEnd = ' until ' + endDay + " at " + trailingZero(end.getHours()) + ":" + trailingZero(end.getMinutes());

 		}
 	}
 	$('#party-time').html("<span id='day'>" + day + "</span>" + sStart + sEnd);
 	$('#party-desc').html(data.description);
 	venueObj.lat = data.venue.lat;
 	venueObj.lon = data.venue.lon;
 	venueObj.name = data.venue.name;
 	venueObj.id = data.venue._id;

 	eventObj.name = data.name;
 	enableCheckinBtn();
 	displayPartyAttenders(data.attenders);
 	$("#party-content").show();
 	$.mobile.loading('hide');



 	$('#btnCheckin').one('tap', function(event) {
 		mixpanel.track("Checkin");
 		$.mobile.loading('show', {
 			text: 'Checking you in...',
 			textVisible: true,
 			theme: 'a',

 		});
 		clicked = true;
 		var eventid = getUrlVars()['id'];
 		console.log('button checkin tapped');
 		if ($('input[name=checkbox-0]').is(':checked')) {
 			console.log('fb status');
 			var party = $('#party-header h1').text();
 			var image = $('#posterImg').attr('src');
 			var place = $('#party-venue').text();
 			var description = $('#party-desc').text();
 			FB.api('/me/feed', 'post', {
 				message: 'I am partying at ' + party + " at " + place,
 				picture: image,
 				link: 'http://www.panemerkille.fi',
 				name: party,
 				caption: "at " + place,
 				description: description
 			}, function(response) {
 				if (!response || response.error) console.log('Error while posting on Facebook');
 				else console.log('Post successfull');
 			});
 		}
 		$.ajax({
			  type: "POST",
			  url: endpoint + '/users/' + user.id + '/checkins',
			  data: {event: eventid},
		 	  cache: false,
		 	  timeout: 10000
		
			}).done(function( data ) {
				$.mobile.changePage('checkin.html?event=' + eventid);
			}).fail(function(jXHR, textStatus) {
		 		if (textStatus === "timeout") {
		 			console.log("Timeout exceeded!");
		 			$.mobile.changePage('timeoutError.html', {
		 				transition: 'pop',
		 				role: 'dialog'
		 			});
		 		}
		 	});


 	});
}


 function displayPartyAttenders(attenders) {
 	$('#attenders').empty();
 	var blocks = ['a', 'b', 'c', 'd'];
 	for (var i = 0; i < attenders.length; i++) {
 		var attenderImg = attenders[i].attender.picture_url;
 		var col = i % 4;
 		var cls = 'ui-block-' + blocks[col];
 		var output = '<div class="' + cls + '">';
 		output += '<img class="attenderImg" src="' + attenderImg + '"/>'
 		output += '</div>';
 		$('#attenders').append(output);
 		$('#attenders img').cropresize({
 			width: 65,
 			height: 65,
 			vertical: "top"
 		});
 	}
 }

 function enableCheckinBtn() {
 	$.mobile.loading('show', {
 		text: 'Looking for duplicates...',
 		textVisible: true,
 		theme: 'a',

 	});
 	var eventID = getUrlVars()['id'];
 	$.ajax({
 		url: endpoint + "/users/" + user.id,
 		type: "GET",
 		dataType: "json",
 		cache: false,
 		timeout: 10000
 	}).done(function(data) {

 		for (var i = 0; i < data.checkins.length; i++) {
 			console.log(data.checkins[i].event._id);
 			console.log('done for');
 			if (data.checkins[i].event._id == eventID) { //check if the user checked in at the same event
 				$('#party-error').html('You have already checked in here.');
 				$('#party-error').show();
 				$.mobile.loading('hide');
 				mixpanel.track("Already here");
 				return;
 			}
 		}
 		if (data.checkins.length > 0) {
 			$.mobile.loading('show', {
 				text: 'Checking your history...',
 				textVisible: true,
 				theme: 'a',

 			});
 			var lastCheckin = moment(data.checkins[data.checkins.length - 1].timestamp);
 			var now = moment();
 			var diff = now.diff(lastCheckin, 'minutes');
 			var interval = moment.duration(120, 'minutes');
 			if (diff < 120) {
 				var result = lastCheckin.add('minutes', 120).fromNow();
 				$('#party-error').html('You have already checked in somewhere else recentely. Try again  ' + result);
 				$('#party-error').show();
 				$.mobile.loading('hide');
 				mixpanel.track("Already elsewhere");
 				return;
 			}
 		}
 		$.mobile.loading('show', {
 			text: 'Checking party time...',
 			textVisible: true,
 			theme: 'a',

 		});

 		var day = $('#day').text();
 		if (day != 'Now') { //event has not started yet
 			$('#party-error').html('This is not happening now.');
 			$('#party-error').show();
 			$.mobile.loading('hide');
 			mixpanel.track("Not now");
 			return;
 		}

 		$.mobile.loading('show', {
 			text: 'Checking your location...',
 			textVisible: true,
 			theme: 'a',

 		});
 		navigator.geolocation.getCurrentPosition(onGPSSuccess, onGPSError, {
 			enableHighAccuracy: true,
 			maxiumAge: 60000,
 			timeout: 15000
 		});
 	}).fail(function(jXHR, textStatus) {
 		if (textStatus === "timeout") {
 			console.log("Timeout exceeded!");
 			$.mobile.changePage('timeoutError.html', {
 				transition: 'pop',
 				role: 'dialog'
 			});
 		}
 	});
 }

 function onGPSSuccess(pos) {
 	var myLat = pos.coords.latitude;
 	var myLon = pos.coords.longitude;
 	var distance = haversine(myLon, myLat, venueObj.lon, venueObj.lat);
 	if (distance <= maxDistance) {
 		mixpanel.track("Checkin enabled");
 		$('#btnCheckin').removeClass('ui-disabled');
 		$("input[type='checkbox']").checkboxradio('enable');
 	} else {
 		mixpanel.track("Too far");
 		$('#party-error').html('You seem to be too far from it. Get closer and try again.');
 		$('#party-error').show();
 	}
 	$.mobile.loading('hide');
 }



 function haversine(lon1, lat1, lon2, lat2) {
 	var R = 6371; // km
 	var dLat = toRad(lat2 - lat1);
 	var dLon = toRad(lon2 - lon1);
 	var lat1 = toRad(lat1);
 	var lat2 = toRad(lat2);

 	var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
 	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
 	var d = R * c;
 	return d * 1000;
 }

 function onGPSError(err) {
	 mixpanel.track("GPS error");
 	$.mobile.changePage('gpsError.html', {
 		transition: 'pop',
 		role: 'dialog'
 	});
 	//$('#party-error').html('There is a problem finding your current location');
 	//$('#party-error').show();
 }

 function toRad(deg) {
 	return deg * Math.PI / 180;
 }

 $('#patches').live('pageshow', function(event) {
 	$.mobile.loading('show', {
 		text: 'Loading all patches...',
 		textVisible: true,
 		theme: 'a',

 	});
 	$.ajax({
 		url: endpoint + '/patches/',
 		type: "GET",
 		dataType: "json",
 		cache: true,
 		timeout: 10000
 	}).done(function(data) {
 		displayAllPatches(data)
 	}).fail(function(jXHR, textStatus) {
 		if (textStatus === "timeout") {
 			console.log("Timeout exceeded!");
 			$.mobile.changePage('timeoutError.html', {
 				transition: 'pop',
 				role: 'dialog'
 			});
 		}
 	});
 });

 // $('#patch').live('pageshow', function(event) {
 // 	var id = getUrlVars()["id"];
 // 	$.getJSON(endpoint + '/patches/' + id, displayPatch)
 // });
 $('#patch').live('pageshow', function(event, ui) {
 	$.mobile.loading('show', {
 		text: 'Loading patch info...',
 		textVisible: true,
 		theme: 'a',

 	});
 	if (ui.prevPage[0].id != 'checkedin-page') {
 		$('#patch-back').show();
 		$('#patch-done').hide();
 	} else {
 		$('#patch-back').hide();
 		$('#patch-done').show();
 	}
 	var hashes = $(this).data("url").split("?")[1].split('&'); //TODO: check 2 parameters.
 	var vars = [];
 	for (var i = 0; i < hashes.length; i++) {
 		hash = hashes[i].split('=');
 		//vars.push(hash[0]);
 		vars[hash[0]] = hash[1];
 	}
 	var patch = vars['id'];
 	var claimed = vars['claimed'];
 	$.ajax({
 		url: endpoint + '/patches/' + patch,
 		type: "GET",
 		dataType: "json",
 		cache: false,
 		timeout: 10000
 	}).done(function(data) {
 		$('#patchH1').html(data.name);
 		var output = "<img id='singlepatch' src='" + data.image_url + "' /><p>" + data.description + "</p>";
 		$('#patchContent').html(output);
 		if (claimed == 'false') {
 			$('#patchContent').append('<p>Woah! Show this virtual patch to the staff to get a real one and then tap the button!</p><a data-role="button" data-icon="check" data-theme="b" data-rel="dialog" href="claimPatch.html?id="' + patch + ' id="btn-dialog-claimed">OK, I got my real patch!</a>');
 			$('#btn-dialog-claimed').button();
 		}
 		$.mobile.loading('hide');

 	}).fail(function(jXHR, textStatus) {
 		if (textStatus === "timeout") {
 			console.log("Timeout exceeded!");
 			$.mobile.changePage('timeoutError.html', {
 				transition: 'pop',
 				role: 'dialog'
 			});
 		}
 	});
 });

 $('#checkin').live('pageshow', function(event) {
 	$.mobile.loading('show', {
 		text: 'Loading poster...',
 		textVisible: true,
 		theme: 'a',

 	});
 	var id = getUrlVars()["id"];
 	$.ajax({
 		url: endpoint + "/events/" + id,
 		type: "GET",
 		dataType: "json",
 		timeout: 10000,
 		cache: false
 	}).done(function(data) {
 		displayCheckin(data)
 	}).fail(function(jXHR, textStatus) {
 		if (textStatus === "timeout") {
 			console.log("Timeout exceeded!");
 			$.mobile.changePage('timeoutError.html', {
 				transition: 'pop',
 				role: 'dialog'
 			});
 		}
 	});

 });


 function getUrlVars() {
 	var vars = [],
 		hash;
 	var hashes = window.location.href.slice(
 	window.location.href.indexOf('?') + 1).split('&');
 	for (var i = 0; i < hashes.length; i++) {
 		hash = hashes[i].split('=');
 		//vars.push(hash[0]);
 		vars[hash[0]] = hash[1];
 	}
 	return vars;
 }

 function buildBigImg(src) {
 	return src.substring(0, src.lastIndexOf(".")) + "_b" + src.substring(src.lastIndexOf("."));
 }

 function registerUser(facebook_id, firstname, surname, birthdate, gender, picture_url, email) {
 	$.get(endpoint + "/users/?facebook_id=" + facebook_id, function(data) {
 		if (data.length == 0) {
 			
 	 		$.ajax({
 				  type: "POST",
 				  url: endpoint + '/users',
 				  data: {
 		 				facebook_id: facebook_id,
 		 				firstname: firstname,
 		 				surname: surname,
 		 				birthdate: birthdate,
 		 				gender: gender,
 		 				picture_url: picture_url,
 		 				email: email
 		 		  },
 			 	  cache: false,
 			 	  timeout: 10000
 			
 				}).done(function( data ) {
 					mixpanel.track("New user");
 				 	window.localStorage.setItem("pm_facebook_id", facebook_id);
 					$(location).attr('href', 'index.html');
 				}).fail(function(jXHR, textStatus) {
 			 		if (textStatus === "timeout") {
 			 			console.log("Timeout exceeded!");
 			 			$.mobile.changePage('timeoutError.html', {
 			 				transition: 'pop',
 			 				role: 'dialog'
 			 			});
 			 		}
 			 	});
 		} else {
 			
		 	window.localStorage.setItem("pm_facebook_id", facebook_id);
			$(location).attr('href', 'index.html');
 		}
 	});
 }
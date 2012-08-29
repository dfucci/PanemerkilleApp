 //var DEBUG="http://localhost:7777";
 var endpoint = "http://blazing-mist-8758.herokuapp.com";
 var user = {};
 var eventObj = {};
 var venueObj = {}; // TODO: refactor
 $('#FBLogout').live('tap', function() {
 	console.log('bye bye');
 	window.localStorage.clear();
 	FB.init({
 		appId: "366089376758944",
 		nativeInterface: CDV.FB,
 		useCachedDialogs: false,

 	});
 	FB.logout(function(response) {
 		$(location).attr('href', 'connect.html');
 	});
 });

 $('#btn-claimed').live('tap', function() {
 	var patch = getUrlVars()["id"];
 	//TODO: POST user.checkins.claimed = true
 	$.post(endpoint + '/users/' + user.id + "/patches/" + patch, {
 		claimed: 'true'
 	}, function(data) {
 		if (data) {

 			$("#btn-claimed").toggle();
 		}
 	});
 });
 $('#parties-page').live('pageshow', function(event) {
 	$.getJSON(endpoint + '/events', displayParties);
 	populateUserFriends();
 });

 $('#yourpatches').live('pageshow', function(event) {
 	var id = getUrlVars()["user"];
 	$.getJSON(endpoint + '/users/' + id, displayPatches);
 });

 $('#yourcheckins').live('pageshow', function(event) {
 	var id = getUrlVars()["user"];
 	$.getJSON(endpoint + '/users/' + id, displayCheckins);
 });

 $('#btnCheckin').live('tap', function(event) {
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

 	$.post(endpoint + '/users/' + user.id + '/checkins', {
 		event: eventid
 	}, function(data) {
 		console.log('checkin executed');
 	});
 });

 $('#checkedin-page').live('pageshow', displayCheckinStats);

 $('#stream').live('pageshow', displayStream);

 function displayStream(prevPage) {
 	$.getJSON(
 	endpoint + "/users/" + user.id + "/friends", function(friends) {
 		$("#streamContent").empty();
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

 	});
 }

 function displayCheckinStats(event) {
 	var eventID = getUrlVars()['event'];
 	$(".checkin-event").html(eventObj.name);
 	$(".checkin-venue").html(venueObj.name);
 	$.getJSON(endpoint + '/users/' + user.id, updateCheckinsVenue);
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

 			$.getJSON(endpoint + '/patches/' + id, function(patch) {

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
 			});
 		};
 	}
 }

 function displayParties(data) { // TODO: refactor
 	var boilerplate = "<li  data-role='list-divider' id='li-today'>Today</li>";
 	boilerplate += "<li data-role='list-divider' id='li-upcoming'>Upcoming</li>";
 	$('#parties-listview').html(boilerplate);
 	var noPartyToday = true;
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
 		if ((isToday(sTime)) || (isGoingOn(sTime, sEnd))) {
 			noPartyToday = false;
 			out += "<li><a href='party.html?id=" + party._id + "' data-transition='none'><img src='" + party.poster_url + "' class='ui-li-thumb' /><h3>" + party.name + featured + "</h3><p>" + party.venue.name + " - " + sHour + ":" + sMinute + "</p></a></li>";
 			$('#li-today').after(out);
 		} else {
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
 	if (noPartyUpcoming) {
 		$('#li-upcoming').after("<li><p  class='italic no-event'>Unfortunately there are no upcoming events. </p><p class='italic no-event'>It might be the right time to take have rest :)</p></li>");

 	}
 	$("#parties-listview").listview('refresh');
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
 }

 function displayPatches(data) {
 	var patches = data.patches;
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
 }

 function displayAllPatches(patches) {


 	$('#patchgrid').empty();
 	var blocks = ['a', 'b', 'c', 'd'];


 	$.getJSON(endpoint + "/users/" + user.id, function(user) {
 		userPatches = new Array();
 		for (var int = 0; int < user.patches.length; int++) {
 			var patch = {
 				id: user.patches[int].patch._id,
 				claimed: user.patches[int].claimed
 			};
 			userPatches.push(patch);
 		}
 		console.log(userPatches);

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



 	});


 	$

 }

 function displayPatch(data) {
 	$('#patchH1').html(data.name);
 	var output = "<img id='singlepatch' src='" + data.image_url + "' /><p>" + data.description + "</p>";
 	$('#patchContent').html(output);
 	console.log(data);
 	if (!data.claimed) {
 		$('#patchContent').append('<a data-role="button" data-icon="check" data-theme="b" id="btn-claimed">Ok, I have got it!</a>');
 		$('#btn-claimed').button();
 	}


 }

 function displayCheckin(data) {
 	$('#checkinH1').html(data.name);
 	var poster_big = buildBigImg(data.poster_url);
 	$('#checkinContent').html("<img src='" + poster_big + "' />");
 }

 $('#profile').live('pagebeforeshow', function() {
 	populateUser(user.id);
 });
 // evento originale: 'pagebeforecreate'
 // $('#profile').live('pagebeforeshow', function() {
 // //TODO: carica l'id quando phonegap è pronto
 // if (user.id == undefined) { //TODO: controlla lo storage per l'id
 // facebook_id = window.localStorage.getItem("pm_facebook_id");
 // if (facebook_id == undefined) { //TODO: elimina
 // facebook_id = 641892040;
 // }
 // console.log(facebook_id);
 // }
 // $.getJSON(endpoint + "/users", {
 // facebook_id: facebook_id
 // }, function(data) {
 // if (data) {
 // //user.id = data[0]._id;
 // populateUser(user.id);
 // }
 // });
 // });

 function isUserInStorage() {
 	// var facebook_id = window.localStorage.getItem("pm_facebook_id");
 	var user_id = window.localStorage.getItem("pm_user_id");
 	console.log('checkin user' + user_id);
 	return user_id != null;

 }

 function saveUserStorage(user_id) {
 	// window.localStorage.setItem("pm_facebook_id", facebook_id);
 	window.localStorage.setItem("pm_user_id", user_id);
 }

 function populateUser(userid) {
 	$("#userPatchesLink").attr('href', 'userPatches.html?user=' + userid);
 	$("#userCheckinLink").attr('href', 'userCheckins.html?user=' + userid);
 	$.getJSON(endpoint + "/users/" + userid, function(data) {
 		$("#picture_url").attr("src", data.picture_url);
 		$("#profilePicture").html("<img id='profilePictureImg' src='" + data.picture_url + "'/>");
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
 	});
 }


 function populateUserFriends() {
 	console.log('populateUserFriends');
 	FB.init({
 		appId: "366089376758944",
 		nativeInterface: CDV.FB,
 		useCachedDialogs: false,
 	});
 	FB.getLoginStatus(function(response) {
 		if (response.status == 'connected') {
 			var pmFriends = new Array();
 			FB.api('/me/friends', {
 				fields: 'installed'
 			}, function(res) {
 				if (res.error) console.log(res.error);
 				else {
 					for (var i = 0; i < res.data.length; i++) {
 						if (typeof res.data[i].installed != "undefined") {
 							console.log('trovato');
 							pmFriends.push(res.data[i]);
 						}
 					}
 					var friendsParameter = JSON.stringify(pmFriends);
 					$.post(endpoint + "/users/" + user.id + "/friends", {
 						friends: friendsParameter
 					}, function(data) {
 						console.log(data);
 					});
 				}
 			});

 		} else console.log(response.status);
 	}, true);
 }

 $('#party').live('pageshow', function(event) {
 	var id = getUrlVars()['id'];
 	$('#btnCheckin').attr('href', 'checkin.html?event=' + id);
 	$.getJSON(endpoint + '/events/' + id, displayParty);
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
 	var eventID = getUrlVars()['id'];
 	$.getJSON(endpoint + '/users/' + user.id, function(data) {
 		for (var i = 0; i < data.checkins.length; i++) {
 			console.log(data.checkins[i].event._id);
 			if (data.checkins[i].event._id == eventID) { //check if the user checked in at the same event
 				$('#party-error').html('You have already checked in here.');
 				$('#party-error').show();
 				return;
 			}
 		}
 		if (data.checkins.length > 0) {
 			var lastCheckin = moment(data.checkins[data.checkins.length - 1].timestamp);
 			var now = moment();
 			var diff = now.diff(lastCheckin, 'minutes');
 			var interval = moment.duration(120, 'minutes');
 			if (diff < 120) {
 				var result = lastCheckin.add('minutes', 120).fromNow();
 				$('#party-error').html('You have already checked in somewhere else recentely. Try again  ' + result);
 				$('#party-error').show();
 				return;
 			}
 		}

 		var day = $('#day').text();
 		if (day != 'Now') { //event has not started yet
 			$('#party-error').html('This is not happening now.');
 			$('#party-error').show();
 			return;
 		}
 		navigator.geolocation.getCurrentPosition(onGPSSuccess, onGPSError, {
 			enableHighAccuracy: true
 		});
 	});
 }

 function onGPSSuccess(pos) {
 	var myLat = pos.coords.latitude;
 	var myLon = pos.coords.longitude;
 	var distance = haversine(myLon, myLat, venueObj.lon, venueObj.lat);
 	if (distance <= 1000000) { //TODO: distance = 100
 		$('#btnCheckin').removeClass('ui-disabled');
 		$("input[type='checkbox']").checkboxradio('enable');
 	} else {
 		$('#party-error').html('You seem to be too far from it. Get closer and try again.');
 		$('#party-error').show();
 	}

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
 	console.log(err);
 	$('#party-error').html('There is a problem finding your current location');
 	$('#party-error').show();
 }

 function toRad(deg) {
 	return deg * Math.PI / 180;
 }
 $('#patches').live('pageshow', function(event) {
 	$.getJSON(endpoint + '/patches/', displayAllPatches);
 });

 // $('#patch').live('pageshow', function(event) {
 // 	var id = getUrlVars()["id"];
 // 	$.getJSON(endpoint + '/patches/' + id, displayPatch)
 // });
 $('#patch').live('pageshow', function(event, ui) {
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
 	$.getJSON(endpoint + '/patches/' + patch, function(data) {
 		$('#patchH1').html(data.name);
 		var output = "<img id='singlepatch' src='" + data.image_url + "' /><p>" + data.description + "</p>";
 		$('#patchContent').html(output);
 		if (claimed == 'false') {
 			$('#patchContent').append('<a data-role="button" data-icon="check" data-theme="b" id="btn-claimed">Ok, I have got it!</a>');
 			$('#btn-claimed').button();
 		}
 	});
 });

 $('#checkin').live('pageshow', function(event) {
 	var id = getUrlVars()["id"];
 	$.getJSON(endpoint + '/events/' + id, displayCheckin);
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
 	console.log("checking user" + facebook_id);
 	$.get(endpoint + "/users/?facebook_id=" + facebook_id, function(data) {
 		if (data.length < 1) {
 			$.post(endpoint + '/users', {
 				facebook_id: facebook_id,
 				firstname: firstname,
 				surname: surname,
 				birthdate: birthdate,
 				gender: gender,
 				picture_url: picture_url,
 				email: email
 			});

 		}
 		window.localStorage.setItem("pm_facebook_id", facebook_id);
 		$(location).attr('href', 'index.html');

 	});
 }
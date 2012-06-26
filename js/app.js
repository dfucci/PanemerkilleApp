//var DEBUG="http://localhost:7777";
var endpoint = "http://blazing-mist-8758.herokuapp.com";
var user = {};
$('#parties-page').live('pageshow', function(event) {
     $.getJSON(endpoint + '/events', displayParties);
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
    $.post(endpoint+'/users/'+user.id+'/checkins', {event: eventid}, function(data) {
        console.log('checkin executed');
    });
});

function displayParties(data) { //TODO: refactor
    var boilerplate = "<li  data-role='list-divider' id='li-today'>Today</li>";
    boilerplate+="<li data-role='list-divider' id='li-upcoming'>Upcoming</li>";
    $('#parties-listview').html(boilerplate);
    var noParty=true;
    $.each(data.reverse(), function(index, party) {
        var out = '';
        var sTime = new Date(party.time.start);
        var sHour = trailingZero(sTime.getHours());
        var sMinute = trailingZero(sTime.getMinutes());
        var sDay = "Next " + dayName(sTime.getDay());
        var featured="";
        if (party.venue.featured) {
            featured+="<img class='featured' src='images/corner.png'/>";
        }
        if (isToday(sTime)) {
            noParty=false;
            out += "<li><a href='party.html?id=" + party._id + "' data-transition='none'><img src='" + party.poster_url + "' class='ui-li-thumb' /><h3>" + party.name  + featured+"</h3><p>" + party.venue.name + " - "  + sHour + ":" + sMinute +  "</p></a></li>";
            $('#li-today').after(out);
        } else {
            var today = new Date();
            var tomorrow = new Date();
            tomorrow.setDate(today.getDate()+1);
            if(tomorrow.getDate()==sTime.getDate()){
                sDay='Tomorrow';
            }
            out += "<li><a href='party.html?id=" + party._id + "' data-transition='none'><img src='" + party.poster_url + "' class='ui-li-thumb'/><h3>" + party.name+ featured+"</h3><p>" + party.venue.name + " - " + sDay + " " + sHour + ":" + sMinute + " </p></a></li>";
            $('#li-upcoming').after(out);
        }
    });
        if (noParty) {
             $('#li-today').after("<li><p  class='italic no-event'>Unfortunately there's nothing going on tonight. </p><p class='italic no-event'>Take some time to sew your patches ;)</p></li>");
        };
    $("#parties-listview").listview('refresh');
}

function trailingZero(time) {
    if (time < 10) {
        time = "0" + time;
    }
    return time;
}

function dayName(day) {
    return dayname= ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][day];
}

function isToday(pDate) {
    var today = new Date();
    return ((today.getFullYear() == pDate.getFullYear()) && (today.getMonth() == pDate.getMonth()) && (today.getDate() == pDate.getDate()));
}

function displayCheckins(data) {
    var checkins = data.checkins;
    var blocks = ['a', 'b', 'c', 'd'];
    $.each(checkins, function(index, c) {
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
    var blocks = ['a', 'b', 'c', 'd'];
    $('#patchgrid').empty();
    $.each(patches, function(index, p) {
        var patch_name = p.patch.name;
        var patch_image = p.patch.image_url;
        var patch_id = p.patch._id;
        var k = index % 4;
        var cls = "ui-block-" + blocks[k];
        $('#patchgrid').append('<div class=' + cls + '> <a href="patch.html?id=' + patch_id + '" data-transition="none" data-ajax="false"><div class="patch"><img class="patchImg" src="' + patch_image + '"><div>' + patch_name + '</div></div></a></div>');
    });
}

function displayAllPatches(data) {
    $('#patchgrid').empty();
    var blocks = ['a', 'b', 'c', 'd'];
    $.each(data, function(index, p) {
        var patch_name = p.name;
        var patch_image = p.image_url;
        var patch_id = p._id;

        var k = index % 4;
        var cls = "ui-block-" + blocks[k];
        $('#patchgrid').append('<div class=' + cls + '><a href="patch.html?id=' + patch_id + '" data-transition="none" data-ajax="false> <div class="patch"><img class="patchImg" src="' + patch_image + '"><div>' + patch_name + '</div> </div></a></div>');
    });
}

function displayPatch(data) {
    $('#patchH1').html(data.name);
    $('#patchContent').html("<img src='" + data.image_url + "' />").append("<p>" + data.description + "</p>");


}

function displayCheckin(data) {
    $('#checkinH1').html(data.name);
    var poster_big = buildBigImg(data.poster_url);
    $('#checkinContent').html("<img src='" + poster_big + "' />");
}


// evento originale: 'pagebeforecreate'
$('#profile').live('pagebeforeshow', function() { 
    //TODO: carica l'id quando phonegap è pronto
    if (user.id == undefined) { //TODO: controlla lo storage per l'id
        facebook_id = window.localStorage.getItem("pm_facebook_id");
        if (facebook_id == undefined) { //TODO: elimina
            facebook_id = 641892040;
        }
        console.log(facebook_id);
}
        $.getJSON(endpoint + "/users", {
            facebook_id: facebook_id
        }, function(data) {
            if (data) {
                user.id = data[0]._id;
                populateUser(user.id);
            }
        });
    

});

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
    });
}
$('#party').live('pageshow', function(event){
    var id = getUrlVars()['id'];
    $.getJSON(endpoint+'/events/' + id, displayParty);
});

function displayParty(data){
    $('#party-header h1').html(data.name);
    $('#posterImg').attr('src', data.poster_url);
    $('#party-venue').html(data.venue.name);
    var start = new Date(data.time.start);
    var end = new Date(data.time.end);

    $('#party-time').html("Next " +dayName(start.getDay())+ " from "+trailingZero(start.getHours())+":"+trailingZero(start.getMinutes()) + " to " + trailingZero(end.getHours()) + ":" + trailingZero(end.getMinutes()));
    $('#party-desc').html(data.description);
}

$('#patches').live('pageshow', function(event) {
    $.getJSON(endpoint + '/patches/', displayAllPatches);
});

$('#patch').live('pageshow', function(event) {
    var id = getUrlVars()["id"];
    $.getJSON(endpoint + '/patches/' + id, displayPatch)
});

$('#checkin').live('pageshow', function(event) {
    var id = getUrlVars()["id"];
    $.getJSON(endpoint + '/events/' + id, displayCheckin);
});

function getUrlVars() {
    var vars = [],
        hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for (var i = 0; i < hashes.length; i++) {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
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
        $(location).attr('href', 'profile.html');

    });
}
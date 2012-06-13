//var DEBUG="http://localhost:7777";
var endpoint = "http://blazing-mist-8758.herokuapp.com";
var user = {};


$('#yourpatches').live('pageshow', function(event) {
    var id = getUrlVars()["user"];
    $.getJSON(endpoint + '/users/' + id, displayPatches);
});



$('#yourcheckins').live('pageshow', function(event) {
    var id = getUrlVars()["user"];
    $.getJSON(endpoint + '/users/' + id, displayCheckins);
});

function displayCheckins(data) {
    var checkins = data.checkins;
    var blocks = ['a', 'b', 'c', 'd'];
    $.each(checkins, function(index, c) {
        var event_name = c.event.name;
        var event_poster = c.event.poster_url;
        var k = index % 4;
        var cls = "ui-block-" + blocks[k];
        $('#checkingrid').append('<div class=' + cls + '> <div><img class=poster src="' + event_poster + '"></div></div>');
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
        $('#patchgrid').append('<div class=' + cls + '> <a href="patch.html?id='+ patch_id + '" data-transition="none"><div class="patch"><img class="patchImg" src="' + patch_image + '"><div>' + patch_name + '</div></div></a></div>');
    });
}

function displayAllPatches(data){
    $('#patchgrid').empty();
    var blocks = ['a', 'b', 'c', 'd'];
    $.each(data, function(index, p) {
        var patch_name = p.name;
        var patch_image = p.image_url;
        var patch_id = p._id;
        var k = index % 4;
        var cls = "ui-block-" + blocks[k];
        $('#patchgrid').append('<div class=' + cls + '><a href="patch.html?id='+ patch_id + '" data-transition="none"> <div class="patch"><img class="patchImg" src="' + patch_image + '"><div>' + patch_name + '</div> </div></a></div>');
    });
}

function displayPatch(data) {
     $('#patchH1').html(data.name);
     $('#patchContent').empty().append("<img src='" + data.image_url + "' />").append("<p>" + data.description + "</p>");

    // $('#patchDesc').html(data.description);
    // $('#patchImg').attr('src', data.image_url);

}


$('#profile').live('pagebeforecreate', function() { //TODO: carica l'id quando phonegap è pronto
    if (user.id == undefined) { //TODO: controlla lo storage per l'id
        facebook_id = window.localStorage.getItem("pm_facebook_id");
        $.getJSON(endpoint + "/users", {
            facebook_id: facebook_id
        }, function(data) {
            if (data) {
                user.id = data[0]._id;
                populateUser(user.id);
            }
        });
    }
    
});

function populateUser(userid) {
    console.log(userid);
    $("#userPatchesLink").attr('href', 'userPatches.html?user=' + userid);
    $("#userCheckinLink").attr('href', 'userCheckins.html?user=' + userid);
    $.getJSON(endpoint + "/users/" + userid, function(data) {
        // $("#picture_url").attr("src", data.picture_url);
        $("#profilePicture").html("<img id='profilePictureImg' src='" + data.picture_url + "'/>");
        $("#firstname").html(data.name.firstname);
        $("#surname").html(data.name.surname);
        $("#patch_counter").html(data.patches.length);
        $("#checkin_counter").html(data.checkins.length);
    });
}


$('#patches').live('pageshow', function(event) {
    $.getJSON(endpoint + '/patches/', displayAllPatches);
});

$('#patch').live('pageshow', function(event) {
    var id = getUrlVars()["id"];

    $.getJSON(endpoint + '/patches/' +id, displayPatch)
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


function registerUser(facebook_id, firstname, surname, birthdate, gender, picture_url, email){
    console.log("checking user" + facebook_id);
    $.get(endpoint+"/users/?facebook_id="+ facebook_id, function(data) {
        if (data.length<1) {
            console.log('registering user');
            $.post(endpoint+'/users', {facebook_id:facebook_id, firstname:firstname, surname:surname,
            birthdate:birthdate,gender:gender, picture_url:picture_url, email:email});

        } 
        else {
            console.log('user' + facebook_id + 'already registered');
        }
         window.localStorage.setItem("pm_facebook_id", facebook_id);
         $(location).attr('href', 'profile.html');

    });
}
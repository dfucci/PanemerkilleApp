var endpoint = "http://localhost:7777";
var user = {};
$('#yourpatches').live('pageshow', function(event) {
    console.log('fired');
    var id = getUrlVars()["user"];
    $.getJSON(endpoint + '/users/' + id, displayPatches);
});

function displayPatches(data) {
    var patches = data.patches;
    console.log(patches);
    var blocks=['a','b','c','d'];
    $.each(patches, function(index, p) {
        var patch_name = p.patch.name;
        var patch_url = p.patch.image_url;
        var k=index%4;
        var cls ="ui-block-" + blocks[k];
       // switch (k % 4) {
       // case 0:
            $('#patchgrid').append('<div class='+cls+'> <div><img src="' + patch_url + '"></div><div>' + patch_name + '</div> </div>');
        //     break;
          //  $('#patchgrid').add('div').addClass(cls).add('div').add('img').attr('src', patch_url).after('div').html(patch_name);
        // case 1:
        //     $('#patchgrid').append('<div class="ui-block-b">  <div><img src="' + patch_url + '"></div><div>' + patch_name + '</div> </div>');
        //     break;

        // case 2:
        //     $('#patchgrid').append('<div class="ui-block-c"> <div><img src="' + patch_url + '"></div><div>' + patch_name + '</div> </div>');
        //     break;

        // case 3:
        //     $('#patchgrid').append('<div class="ui-block-d"> <div><img src="' + patch_url + '"></div><div>' + patch_name + '</div> </div>');
        //     break;
        // }
    });
}


//TODO: sostiture ready con phonegap.ondeviceready
$('#profile').live('pagebeforecreate',function(){ //TODO: carica l'id quando phonegap è pronto
    if (user.id == undefined) {//TODO: controlla lo storage per l'id
    facebook_id='641892040';
    $.getJSON(endpoint+"/users",{
         facebook_id : facebook_id
      }, function (data) {
        if (data){
            user.id=data[0]._id;
            populateUser();
        }
    });
}
});


// $('#profile').on('deviceready',function(){ //TODO: carica l'id quando phonegap è pronto
//     if (user.id == undefined) {//TODO: controlla lo storage per l'id
//     facebook_id='641892040';
//     $.getJSON(endpoint+"/users",{
//          facebook_id : facebook_id
//       }, function (data) {
//         if (data){
//             user.id=data[0]._id;
//         }
//     });
//     }
// });


function populateUser(){
    $.getJSON(endpoint+"/users/" + user.id, function(data) {
         $("#picture_url").attr("src", data.picture_url);
         $("#firstname").html(data.name.firstname);
         $("#surname").html(data.name.surname);
         $("#patch_counter").html(data.patches.length);
         $("#checkin_counter").html(data.checkins.length);
         $("#userPatchesLink").attr('href', 'userPatches.html?user='+user.id);
    });
}
    
 


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



// function loadUser (url, facebook_id) {
//   $.ajax({ 
//          async: false, 
//          url: url, 
//          dataType: "json", 
//          data:{ facebook_id : facebook_id},
//          success: function(data) {
//            if (data == true) {                   
//              $("#picture_url").attr("src", data[0].picture_url);
//           $("#firstname").html(data[0].name.firstname);
//           $("#surname").html(data[0].name.surname);
//           $("#patch_counter").html(data[0].patches.length);
//           $("#checkin_counter").html(data[0].checkins.length);
//           return data;
//            }
//         }, 
//     });
// }
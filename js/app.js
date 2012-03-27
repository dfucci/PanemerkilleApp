function loadUser (url, facebook_id) {
	 $.ajax({ 
         async: false, 
         url: url, 
         dataType: "json", 
         data:{ facebook_id : facebook_id},
         success: function(data) {
           if (data == true) {                   
             $("#picture_url").attr("src", data[0].picture_url);
	         $("#firstname").html(data[0].name.firstname);
	         $("#surname").html(data[0].name.surname);
	         $("#patch_counter").html(data[0].patches.length);
	         $("#checkin_counter").html(data[0].checkins.length);
	         return data;
           }
        }, 
    });
}
$.get('/userinfos'+location.pathname, function(data){
    $('#name').text('Name: '+ data[0].name);
    $('#email').text('Email address: '+ data[0].email);
    if (data[0].sheets){
        $.each(data[0].sheets, function(){
        $('#sheets').append('<a href="sheet/'+this+'"><li>'+this+"</li></a>")
        });
    } 
});
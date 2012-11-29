$('document').ready(function(){

var userid = location.pathname.split('/')[1]

$.get('/userinfos/'+userid, function(data){
    $('#name').text('Name: '+ data[0].name);
    $('#email').text('Email address: '+ data[0].email);
    if (data[0].sheets){
        $.each(data[0].sheets, function(){
            $('#sheets').append('<a href="sheet/'+this+'"><li>'+this+"</li></a>")
        });
    }
});

$('#add-sheet').click(function(){
    $.post('/sheets', {'id': userid}, function(data){
        window.location = '/sheet/'+data
    })
})

})
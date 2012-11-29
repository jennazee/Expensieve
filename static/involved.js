$('document').ready(function(){

var sheetid = location.pathname.split('/sheet/')[1]

$(build_sheet(sheetid))


$.get('/users/'+sheetid, function(data){
    $.each(data, function(){
        $('#involved-list').append("<li>"+this.name+'</li>')
    })
})

$('#add-involved').submit(function(e){
    e.preventDefault()
    $.post('/sheet/'+sheetid, {'email': $('#share-email').val()}, function(data){
        console.log(data)
        if (data.length>0){
            $('#involved-list').append("<li>"+this.name+'</li>')
        }
        else {
            $('#involved').append("<div>No one with that email has an account. Would you like to email them and ask them to join Expensieve? Even if not, you can still list them on the sheet, but they just won't be able to edit</div>")
        }
    });
})

})
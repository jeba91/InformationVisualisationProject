$(function(){
    $.ajax({
        url:"request.php",
        type:"post",
        data:"",
        success: function(response){
            console.log(response);
        }
    });
});

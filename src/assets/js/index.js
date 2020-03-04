$(document).ready(function(){

    /*
    $('ion-backdrop').click(function(){
        console.log(2);
        $('#menu2').removeClass('show-menu');
        $('#menu2 .menu-inner').animate({
           'transform': 'translateX(-312px)'
        }, 1000);
    });
*/

	 $('.footer-menu .more-btn').on('click', function(e){

        if($(this).hasClass('menu-left')){
            $(this).removeClass('menu-left');

            $(this).parents('.menu-one').animate({
                'margin-left': '-92%'
            }, 1000);
        }else{
            $(this).addClass('menu-left');

            $(this).parents('.menu-one').animate({
                'margin-left': '0'
            }, 1000);
        }
    });
});

// alert(1);

(function(){
    /*动态生成视口标签*/
    var num = 1/window.devicePixelRatio;
    document.write('<meta name="viewport" content="width=device-width, user-scalable=no, initial-scale='+num+', maximum-scale='+num+', minimum-scale='+num+'" />');

    var fontSize = document.documentElement.clientWidth/10;

    document.querySelector('html').style.fontSize = fontSize+'px';
    /*动态生成视口标签*/
})();
$(function(){
    if(/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)) {
        $('.outer').addClass('mobile')
    }else{
        $('.outer').addClass('pc')
    }
    $('.nav_item a').click(function(){
        $('.nav_item a').removeClass('active')
        $(this).addClass('active')
        $('.container_box').hide(0)
        $('.mobile .nav_list').slideUp(300)
        $('#'+$(this).attr('href').substr(1)).show(0)
    })
    $('.nav_header img').click(function(){
        $('.nav_list').slideToggle(500)
    })
})
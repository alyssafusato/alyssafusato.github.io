$(document).ready(function () {

    var wheelCount = 0;
    var wheelCurrent = 0;

    window.addEventListener('wheel', function (event) {
        if (event.deltaY < 0) {
            console.log('scrolling up');
            console.log(event.deltaY);
            wheelCurrent += event.deltaY;

            if (wheelCount > wheelCurrent + 250) {
                wheelCount = wheelCurrent;
                $(".pswp__button--arrow--left").click();
            }
        }
        else if (event.deltaY > 150) {
            console.log('scrolling down');
            console.log(event.deltaY);
            wheelCurrent += event.deltaY;

            if (wheelCount < wheelCurrent - 250) {
                wheelCount = wheelCurrent;
                $(".pswp__button--arrow--right").click();
            }
        }

    });

});
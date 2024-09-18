
var sliderinit = function() {

    // basic options for all sliders
    let defaults = {
        spaceBetween: 0,
        slidesPerView: 1
    };
    // call init function
    initSwipers(defaults);
    function initSwipers(defaults = {}, selector = ".swiper-container") {
    let swipers = document.querySelectorAll(selector);
    swipers.forEach((swiper) => {
        // get options
        let optionsData = swiper.dataset.swiper
        ? JSON.parse(swiper.dataset.swiper)
        : {};
        // combine defaults and custom options
        let options = {
        ...defaults,
        ...optionsData
        };
        // init
        new Swiper(swiper, options);
    });
    }
}
sliderinit();

var gallery = function(){
    if ( $('div').hasClass('widget-gallery-slider') ){
  var slider = new Swiper ('.gallery-slider', {
    slidesPerView: 1,
    loop: true,
    effect:'fade',
    loopedSlides: 4,
  });
  
  var thumbs = new Swiper ('.gallery-thumbs', {
    slidesPerView: 'auto',
    spaceBetween: 11,
    loop: true,
    slideToClickedSlide: true,
  });
    slider.controller.control = thumbs;
    thumbs.controller.control = slider;
  }
}
gallery();

var gallery1 = function(){
  if ( $('div').hasClass('gallery-style-1') ){
var slider = new Swiper ('.gallery-slider', {
  slidesPerView: 1,
  loop: true,
  effect:'fade',
  loopedSlides: 4,
});

var thumbs = new Swiper ('.gallery-thumbs', {
  slidesPerView: 'auto',
  spaceBetween: 30,
  loop: true,
  slideToClickedSlide: true,
});
  slider.controller.control = thumbs;
  thumbs.controller.control = slider;
}
}
gallery1();
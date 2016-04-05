var slideshow;
var slides;
var lightboxTarget;
var notes;
var slideIndicator;
var timerStart;
var bookmarks = [];

$.ready().then(function(){
  var FoveaSlideshow = document.registerElement('fovea-slideshow');

  slideshow = $('fovea-slideshow');
  slides = $$('slide');
  notes = $$('notes');

  slideshow.setAttribute('black', true);

  window.addEventListener('resize', resizeSlides);
  Mousetrap.bind(['right', 'down', 'pagedown', 'space', 'enter'], function() { updateSlide('next') });
  Mousetrap.bind(['left', 'up', 'pageup'], function() { updateSlide('previous') });
  Mousetrap.bind('b', function() { hideSlideshow() });
  Mousetrap.bind('n', function() { toggleNotes() });
  Mousetrap.bind('a', function() { resetSaturationScreen() });
  Mousetrap.bind('s', function() { saturateScreen() });
  Mousetrap.bind('d', function() { superSaturateScreen() });
  Mousetrap.bind('c', function() { toggleClock() });
  Mousetrap.bind('t', function() { toggleTimer() });

  Mousetrap.bind('home', function() { updateSlide(0) });
  Mousetrap.bind('end', function() { updateSlide(-1) });
  Mousetrap.bind('1', function() { goToBookmark(1) });
  Mousetrap.bind('2', function() { goToBookmark(2) });
  Mousetrap.bind('3', function() { goToBookmark(3) });
  Mousetrap.bind('4', function() { goToBookmark(4) });
  Mousetrap.bind('5', function() { goToBookmark(5) });
  Mousetrap.bind('6', function() { goToBookmark(6) });
  Mousetrap.bind('7', function() { goToBookmark(7) });
  Mousetrap.bind('8', function() { goToBookmark(8) });
  Mousetrap.bind('9', function() { goToBookmark(9) });
  Mousetrap.bind('0', function() { updateSlide(0) });

  initSlideshow();
})

function initSlideshow() {
  resizeSlides();

  prepareSlides();

  createSlideIndicator();

  prepareZoomableImages();

  createClock();
  createTimer();

  window.setTimeout(function(){
    updateSlide('start');
  }, 200);
}

function updateSlide(method) {
  var n = slideshow.getAttribute('currentSlide');

  if(method=='start') {
    var startState = History.getState();
    if(startState.data.slide) {
      var startSlide = startState.data.slide
    } else {
       var startSlide = slideshow.getAttribute('startSlide');
    }

    slideshow._.set({
      attributes: {
        'currentSlide': startSlide,
        'black': false,
        'saturate': false,
        'superSaturate': false,
        'shownotes': false
      }
    });
  }
  if(method=='next') {
    if(n<slides.length) slideshow.setAttribute('currentslide', parseInt(slideshow.getAttribute('currentslide'))+1);
  }
  if(method=='previous') {
    if(n>1) slideshow.setAttribute('currentslide', parseInt(slideshow.getAttribute('currentslide'))-1);
  }
  if(isInt(method)) {
    slideshow.setAttribute('currentslide', parseInt(method)+1);

    if(parseInt(method)==-1) {
      slideshow.setAttribute('currentslide', slides.length);
    }
  }

  n = slideshow.getAttribute('currentslide');

  slides._.set({
    attributes: {
      visible: 'false',
      focus: 'false'
    }
  });
  if(n>1){
    slides[n-2]._.set({
      attributes: {
        visible: 'true',
        focus: 'false'
      }
    });
  }
  slides[n-1]._.set({
    attributes: {
      visible: 'true',
      focus: 'true'
    }
  });
  slideIndicator.style.width = ((n-1)/(slides.length-1))*100+'%';
  History.pushState({'slide': n},'Slide '+n,'?slide='+n);
}
function goToBookmark(n) {
  if(bookmarks[n-1]) {
    updateSlide(bookmarks[n-1]);
  }
}

function hideSlideshow() {
  slideshow.setAttribute('black', !parseBoolean(slideshow.getAttribute('black')));
}
function resetSaturationScreen() {
  slideshow.setAttribute('saturate', false);
  slideshow.setAttribute('superSaturate', false);
}
function saturateScreen() {
  slideshow.setAttribute('saturate', !parseBoolean(slideshow.getAttribute('saturate')));
}
function superSaturateScreen() {
  slideshow.setAttribute('superSaturate', !parseBoolean(slideshow.getAttribute('superSaturate')));
}
function toggleNotes() {
  slideshow.setAttribute('shownotes', !parseBoolean(slideshow.getAttribute('shownotes')));
}
function toggleClock() {
  $('.clock').setAttribute('visible', !parseBoolean($('.clock').getAttribute('visible')));
}
function toggleTimer() {
  $('.timer').setAttribute('visible', !parseBoolean($('.timer').getAttribute('visible')));
}

function resizeSlides() {
  var body = $('body');
  var wbox = body.getBoundingClientRect();
  var ww = wbox.width;
  var wh = wbox.height;
  var wr = ww/wh;

  var ssr = slideshow.getAttribute('ratio');
  var ssbox = slideshow.getBoundingClientRect();

  if(parseInt(ssr*100)<=parseInt(wr*100)) {
    // alert('too wide ('+sr+', '+wr+')');
    slideshow._.style({
      width: ssbox.height*ssr+'px',
      height: '100%'
    });
  }
  else {
    slideshow._.style({
      height: ssbox.width/ssr+'px',
      width: '100%'
    });
  }
}

function prepareSlides() {
  slides.forEach(function(s, i){
    if(s.getAttribute('background-image')) {
      var bgSat = s.getAttribute('background-saturate')!=null ? s.getAttribute('background-saturate') : 1;
      var bgBri = s.getAttribute('background-brightness')!=null ? s.getAttribute('background-brightness') : 1;
      if(s.getAttribute('background-bw')){
        bgSat = 0;
      }
      var bgSep = s.getAttribute('background-sepia') | 0;
      var bgBlur = s.getAttribute('background-blur') | 0;
      var bgFilter = s.getAttribute('background-cssgram');

      var slideBackground = $.create("div", {
        className: 'slideBackground',
        style: {
          backgroundImage: 'url('+ s.getAttribute('background-image')+')',
          webkitFilter: 'saturate('+bgSat+') sepia('+bgSep+') brightness('+bgBri+') blur('+bgBlur+'px)',
          filter: 'saturate('+bgSat+') sepia('+bgSep+') brightness('+bgBri+') blur('+bgBlur+'px)'
        }
      });

      if(bgFilter!==null && bgFilter!=="")
        slideBackground.classList.add(bgFilter);
      s.appendChild(slideBackground);
    }

    if(s.getAttribute('bookmark')) {
      bookmarks[s.getAttribute('bookmark')-1] = i;
    }
  });
}

function createSlideIndicator() {
  var slideIndicatorCreator = $.create("div", {
    className: "slideIndicator",
    contents: [
      {
        tag: "div"
      }
    ]
  });
  slideshow.appendChild(slideIndicatorCreator);

  slideIndicator = $('.slideIndicator div');
}

function prepareZoomableImages() {
  $$('[canzoom]')._.set({
    attributes: {
      'canzoom': true,
      'iszoom': false
    }
  });

  var lightboxCreator = $.create("div", {
    className: "lightbox",
    attributes: {
      'iszoom': false
    },
    contents: [
      {
        tag: "img"
      }
    ]
  });
  slideshow.appendChild(lightboxCreator);

  $$('[canzoom]').forEach(function(el) {
    el.addEventListener('click', zoomImage);
  });
  $('.lightbox').addEventListener('click', closeImage);
}
function zoomImage(e) {
  console.log(e);

  var img = $('.lightbox img');

  var lightboxBox = $('.lightbox').getBoundingClientRect();

  lightboxTarget = $(e.target);
  var targetBoxSmall = lightboxTarget.getBoundingClientRect();
  console.log(targetBoxSmall);

  img._.set({
    attributes: {
      src: lightboxTarget.getAttribute('src'),
      animate: false
    },
    style: {
      position: 'relative',
      width: '70%'
    }
  });

  var targetBoxLarge = img.getBoundingClientRect();

  img._.set({
    attributes: {
      visible: true,
      top_s: targetBoxSmall.top-lightboxBox.top+'px',
      left_s: targetBoxSmall.left-lightboxBox.left+'px',
      right_s: targetBoxSmall.right-lightboxBox.right+'px',
      bottom_s: targetBoxSmall.bottom-lightboxBox.bottom+'px',
      width_s: targetBoxSmall.width+'px',
      height_s: targetBoxSmall.height+'px',
      top_l: targetBoxLarge.top-lightboxBox.top+'px',
      left_l: targetBoxLarge.left-lightboxBox.left+'px',
      right_l: targetBoxLarge.right-lightboxBox.right+'px',
      bottom_l: targetBoxLarge.bottom-lightboxBox.bottom+'px',
      width_l: targetBoxLarge.width+'px',
      height_l: targetBoxLarge.height+'px'
    },
    style: {
      position: 'fixed',
      top: targetBoxSmall.top-lightboxBox.top+'px',
      left: targetBoxSmall.left-lightboxBox.left+'px',
      right: targetBoxSmall.right-lightboxBox.right+'px',
      bottom: targetBoxSmall.bottom-lightboxBox.bottom+'px',
      width: targetBoxSmall.width+'px',
      height: targetBoxSmall.height+'px'
    }
  });

  window.setTimeout(function() {
    $('.lightbox').setAttribute('iszoom', true);

    lightboxTarget.parentNode.setAttribute('zoomhide', true);

    img._.set({
      attributes: {
        animate: true
      },
      style: {
        top: targetBoxLarge.top-lightboxBox.top+'px',
        left: targetBoxLarge.left-lightboxBox.left+'px',
        right: targetBoxLarge.right-lightboxBox.right+'px',
        bottom: targetBoxLarge.bottom-lightboxBox.bottom+'px',
        width: targetBoxLarge.width+'px',
        height: targetBoxLarge.height+'px'
      }
    });

  }, 50);
}
function closeImage(e) {
  var img = $('.lightbox img');

  $('.lightbox').setAttribute('iszoom', false);

  img._.set({
    style: {
      top: img.getAttribute('top_s'),
      left: img.getAttribute('left_s'),
      right: img.getAttribute('right_s'),
      bottom: img.getAttribute('bottom_s'),
      width: img.getAttribute('width_s'),
      height: img.getAttribute('height_s')
    }
  });

  window.setTimeout(function(){
    img._.set({
      attributes: {
        animate: false,
        visible: false
      },
      style: {
        top: '',
        left: '',
        right: '',
        bottom: '',
        width: '',
        height: ''
      }
    });

    lightboxTarget.parentNode.setAttribute('zoomhide', false);

  }, 450);
}

function createClock() {
  var clockCreator = $.create("div", {
    className: "clock",
    attributes: {
      'visible': false
    },
    contents: [
      {
        tag: "p"
      }
    ]
  });
  slideshow.appendChild(clockCreator);
}
function createTimer() {
  var timerCreator = $.create("div", {
    className: "timer",
    attributes: {
      'visible': false
    },
    contents: [
      {
        tag: "p"
      }
    ]
  });
  slideshow.appendChild(timerCreator);
  timerStart = moment();

  startTime();
}

function startTime() {
  var now = new moment();
  $('.clock p').innerHTML = now.format("HH:mm:ss");

  var timer = now.valueOf() - timerStart.valueOf();
  // var timer = moment.duration(timerMS);
  $('.timer p').innerHTML = moment.utc(timer).format("HH:mm:ss");

  var t = setTimeout(startTime, 500);
}

window.parseBoolean = function(string) {
  var bool;
  bool = (function() {
    switch (false) {
      case string.toLowerCase() !== 'true':
        return true;
      case string.toLowerCase() !== 'false':
        return false;
    }
  })();
  if (typeof bool === "boolean") {
    return bool;
  }
  return void 0;
};
function isInt(value) {
  var x;
  if (isNaN(value)) {
    return false;
  }
  x = parseFloat(value);
  return (x | 0) === x;
}

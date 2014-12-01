
H$ = {

  queue: [],
  playing: false,
  pixel: 0,
  col: 0,
  row: 0,
  initialize: function(args) {

    H$.font = args['font'] || feld_12
    H$.width = args['width'] || 480
    H$.height = args['height'] || 240
    H$.line_height = args['line_height'] || 16 // 12px font but 4px padding
    H$.pixel_size = args['pixel_size'] || 2 // size of hellschreiber pixel in x and y
    H$.pixel_width = parseInt(H$.width/H$.pixel_size) // expanded pixel size of canvas
    H$.pixel_height = parseInt(H$.height/H$.pixel_size)

    H$.element = $('#canvas')[0]
    $('#canvas').width(H$.width)
    $('#canvas').height(H$.height)
    H$.canvas = H$.element.getContext('2d')
    $C = H$.canvas
    $C.canvas.width = H$.width
    $C.canvas.height = H$.height

    H$.form = $('#encode')
    H$.input = $('#encode input')
    H$.form.submit(H$.type)

    // riffwave.js sound gen setup
    // we need either a small enough sample to be 1 pixel, or to start/stop a longer sample (1 column high) and rewind it when necessary
    var sine = []; for (var i=0; i<3000; i++) sine[i] = 128+Math.round(127*Math.sin(i/1.3));
    var wave2 = new RIFFWAVE(sine);
    H$.audio = new Audio(wave2.dataURI);

    // resize based on window width if we want
    //if ($(window).width() < $(window).height()) H$.width = args['displaySize    '] || $(window).width()-64 //256
    //else H$.width = args['displaySize'] || ($(window).width()-30)/3

    // this should run only when we hear noise or when typing, but for now:
    //setInterval(H$.draw,1000/72)
    //setInterval(H$.draw,1000/166)
    setInterval(H$.draw,1)
    
  },

  // run on submitting form
  type: function(e) {
    e.preventDefault()
    H$.display(H$.encode(H$.input.val()))
    H$.input.val('')
  },

  // look it up in the font and return an array of binary strings of default (12) length
  // for some idiotic reason, fonts seem to be encoded in horizontal rows, though. 
  encode: function(text) {
    var msg = []
    $.each(text.split(''),function(i,cha) {

      // go through each column of the character
      for (var col=0;col<H$.line_height;col++) {
        msg.push('')
        // go through each row of the character map to get pixel values
        $.each(H$.font[cha],function(i,row) {
          function pad(a,b){return(1e15+a+"").slice(-b)}
          // convert each row into binary, split it up by char
          pxl = pad(row.toString(2),H$.line_height)
          pxl = pxl.split('')[col] || '0'
          msg[msg.length-1] = msg[msg.length-1] + pxl
        })
      }
    })
    return msg
  },

  // adds array of binary strings to the queue for display
  // could display at H$.col
  display: function(msg) {
    H$.queue = H$.queue.concat(msg)
  },

  fillPixel: function(x,y) {
    $C.fillRect(x*H$.pixel_size,y*H$.pixel_size+H$.row*2*H$.line_height*H$.pixel_size,H$.pixel_size,H$.pixel_size)
  },

  // fetch first column from queue and draw it to canvas at H$.col
  // later, we'll need another draw function cued by audio detection
  draw: function() {
    //$C.clearRect(0,0,H$.width,H$.height)

    if (H$.queue.length > 0) {
      if (!H$.coldata) H$.coldata = H$.queue.splice(0,1).toString(2)
 
      pix = H$.coldata.split('')[H$.pixel]
 
      if (pix == '0') $C.fillStyle = "white"
      else if (pix == '1') $C.fillStyle = "black"
 
      // draw a rect
      H$.fillPixel(H$.col,H$.pixel)
      // double it
      H$.fillPixel(H$.col,H$.pixel+H$.line_height)
      // play sound
      if (pix == '0') {
        H$.audio.pause()
        H$.playing = false
      } else if (H$.playing) {
        H$.audio.currentTime = 0;
      } else {
        H$.play()
        H$.playing = true
      }
 
      H$.pixel++
      if (H$.pixel >= H$.line_height) {
        H$.pixel = 0
        H$.col += 1 // advance write position
        H$.coldata = H$.queue.splice(0,1).toString(2)
      }
    } else {
      H$.audio.pause()
    }

    // newline
    if (H$.col > H$.width/H$.pixel_size) {
      H$.col = 0
      H$.row += 1
    }

  },

  play: function(bin) {
    if (!H$.audio.paused) { // if playing stop and rewind
      H$.audio.pause();
      H$.audio.currentTime = 0;
    }
    H$.audio.play();
  },

  /**
   * Returns a dataURL string of any rect from the offered canvas
   */
  excerptCanvas: function(x1,y1,x2,y2,source) {
    source = source || $C
    var width = x2-x1, height = y2-y1
    $('body').append("<canvas style='display:none;' id='excerptCanvas'>    </canvas>")
    var element = $('#excerptCanvas')[0]
    element.width = width
    element.height = height
    var excerptCanvasContext = element.getContext('2d')
    var sourcedata = source.getImageData(x1,y1,width,height)
    excerptCanvasContext.putImageData(sourcedata,0,0)
    return excerptCanvasContext.canvas.toDataURL()
  }


}

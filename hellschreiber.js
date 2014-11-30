
H$ = {
  initialize: function(args) {

    H$.width = args['width'] || 480
    H$.height = args['height'] || 240
    H$.pixel_size = args['pixel_size'] || 4 // size of hellschreiber pixel in x and y
    H$.pixel_width = parseInt(H$.width/H$.pixel_size) // expanded pixel size of canvas
    H$.pixel_height = parseInt(H$.height/H$.pixel_size)

    H$.element = $('#canvas')[0]
    $('#canvas').width(H$.width)
    $('#canvas').height(H$.height)
    H$.canvas = H$.element.getContext('2d')
    $C = H$.canvas

    H$.input = $('#encode')
    H$.input.submit(H$.type)

    // resize based on window width if we want
    //if ($(window).width() < $(window).height()) H$.width = args['displaySize    '] || $(window).width()-64 //256
    //else H$.width = args['displaySize'] || ($(window).width()-30)/3

    // this should run only when we hear noise or when typing, but for now:
    setInterval(H$.draw,1000/72) //
    
  },

  // run on submitting form
  type: function(e) {
    e.preventDefault()
    H$.display(H$.encode(H$.input.val()))
    H$.input.val('')
  },
  // look it up in the font
  encode: function(text) {
    
  },
  // could display at H$.pos
  display: function(text) {

  },

  fillPixel: function(x,y) {
    $C.fillRect(x*H$.pixel_size,y*H$.pixel_size,H$.pixel_size,H$.pixel_size)
  },

  draw: function() {
    $C.clearRect(0,0,H$.width,H$.height)

    H$.x = 0
    H$.y = 0

    $C.fillStyle = "black"
    for (i=0;i<H$.pixel_width*H$.pixel_height;i++) {
      // draw a black or white rect
      H$.fillPixel(H$.x,H$.y)

      H$.y += 1
      if (H$.y > H$.height/H$.pixel_size) {
        H$.x += 1
        H$.y = 0
      }
    }

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

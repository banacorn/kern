$ ->
    nav.init()
    
nav = (->

    detectScroll = ->
        headers = ($(header).position().top for header in $('h2'))
        arr = (i for header, i in headers when $(window).scrollTop() >= header)
        curr = if arr.length is 0 then 0 else arr.length - 1
        _changeTag(curr)
        console.log curr
        
    bindScroll = ->
        $(window).scroll detectScroll
    unbindScroll = ->
        $(window).unbind 'scroll'

    _changeTag = (index) ->
        $('nav li.selected').removeClass 'selected'
        $('nav li').eq(index).addClass 'selected'

    return (
        init: ->
            that = @
            $('nav li a').click(->
                index = $(this).index('nav li a')
                that.changeTag index
                that.jump index
            )
                
            $(window).scroll detectScroll
            
        changeTag: (index) -> _changeTag index
            
        jump: (index) ->
            unbindScroll()
            nextOffset = $('h2').eq(index).position().top
            $('body').animate (
                scrollTop: nextOffset
            ), 300, bindScroll
    
    )
)()

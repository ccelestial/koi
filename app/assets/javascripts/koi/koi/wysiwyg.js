(function (document, window, $) {

  // Configuration ////////////////////////////////////////////////////////////

  var CKEditor = Ornament.CKEditor = {

    $selector: '.wysiwyg.source',
    loadingAttribute: "data-ckeditor-loading",

    bindForTextarea: function(textarea, force){
      force = force || false;
      var instance = CKEDITOR.instances[textarea.id];
      if (force || !instance) {
        CKEDITOR.replace(textarea);
      }
    },

    bindForParent: function(parent, force){
      force = force || false;
      parent.find(CKEditor.$selector).each(function(){
        CKEditor.bindForTextarea(this, force);
      });
    },

    bindAll: function(force){
      force = force || false;
      $(CKEditor.$selector).each(function(){
        CKEditor.bindForTextarea(this, force);
      });
    },

    destroy: function($parent, rebind) {
      rebind = rebind || false;
      CKEditor.destroyAndRebind($parent, rebind);
    },

    getEditorContainer: function($editor) {
      return $editor.parent();
    },

    sizeContainerAndDestroy: function($parent){
      $parent = $parent || false;
      var $editors = CKEditor.getEditorsForParentOrWindow($parent);
      $editors.each(function(){
        var $editor = $(this);
        var instance = CKEDITOR.instances[$editor.attr("id")];
        if(instance) {
          var $container = CKEditor.getEditorContainer($editor);
          $instance = $(instance.container.$);
          var $placeholder = $("<div />").attr(CKEditor.loadingAttribute, "").css("height", $instance.outerHeight());
          $container.append($placeholder);
          $editor.hide();
          instance.destroy();
        }
      });
    },

    bindAndReleaseSizing: function($parent) {
      $parent = $parent || false;
      var $editors = CKEditor.getEditorsForParentOrWindow($parent);
      $editors.each(function(){
        var editor = this;
        var $editor = $(editor);
        var $container = CKEditor.getEditorContainer($editor);
        CKEditor.bindForTextarea(editor, true);
        var instance = CKEDITOR.instances[$editor.attr("id")];
        if(instance) {
          instance.on('instanceReady', function(){
            $container.find("[" + CKEditor.loadingAttribute + "]").remove();
          });
        }
      });
    },

    getEditorsForParentOrWindow($parent) {
      return $parent ? $parent.find(CKEditor.$selector) : $(CKEditor.$selector);
    },

    // Destroy and rebind
    destroyAndRebind: function($parent, rebind){
      $parent = $parent || false;
      rebind = rebind || true;
      var $editors = CKEditor.getEditorsForParentOrWindow($parent);
      $editors.each(function(){
        var $editor = $(this);
        var instance = CKEDITOR.instances[$editor.attr("id")];
        if(instance) {
          instance.destroy();
          if(rebind) {
            CKEditor.bindForTextarea($editor[0], true);
          }
        } else {
          console.warn("No instance for " + $editor.attr("id"));
        }
      });
    }
  }

  $(document).on("ornament:ck-editor", function(){

    Ornament.CKEditor.bindAll();

    //////////////////////////////////////////////////////////// Configuration //

    // Tidy Source //////////////////////////////////////////////////////////////

    function either ()
    {
      return [].join.call (arguments, '|')
    }

    function opening (pattern)
    {
      return '(<(' + pattern + ')\\b[^>]*>)'
    }

    function closing (pattern)
    {
      return '(</(' + pattern + ')\\b[^>]*>)'
    }

    function opening_or_closing (pattern)
    {
      return '(</?(' + pattern + ')\\b[^>]*>)'
    }

    function left_spaced (pattern)
    {
      return '\\s+' + pattern
    }

    function right_spaced (pattern)
    {
      return pattern + '\\s+'
    }

    function maybe_spaced (pattern)
    {
      return '\\s*' + pattern + '\\s*'
    }

    function expression (pattern)
    {
      return new RegExp (pattern, 'gi')
    }

    function indent (number)
    {
      return INDENTS.substring (0, number * 2)
    }

    function style (name)
    {
      return '\\s*\\b(' + name + '):\\s*[^;]+;\\s*'
    }

    var INLINE  = 'a|abbr|b|bdi|bdo|cite|del|dfn|em|i|ins|kbd|mark|q|rp|rt|samp|small|span|strong|sub|sup|time|var|wbr'
    var BLOCK   = 'address|article|aside|audio|blockquote|body|button|caption|code|colgroup|datalist|dd|details|div|[dou]l|d[lt]|embed|fieldset|figcaption|figure|footer|form|h[1-6]|head|header|hgroup|html|label|legend|li|map|menu|meter|nav|noscript|object|optgroup|option|output|progress|script|p|pre|ruby|section|select|video|audio|style|summary|table|tbody|tfoot|thead|t[dhr]|textarea|title|video|audio|video'
    var VOID    = 'area|base|[bh]r|canvas|col|command|iframe|img|input|keygen|link|meta|param|source|track'
    var ANY     = '[\\w:]+'
    var TAGLESS = '[^<>]*'
    var INDENTS = '                                                                                               '

    var toDataFormat_super = CKEDITOR.htmlDataProcessor.prototype.toDataFormat
    var toDataFormat = function (html)
    {
      var data = toDataFormat_super.call (this, html)
      data = data.replace (expression (left_spaced  (opening (INLINE))), ' $1')
                 .replace (expression (right_spaced (closing (INLINE))), '$1 ')
                 .replace (expression (maybe_spaced (opening_or_closing (either (BLOCK, VOID)))),'\n$1\n')
                 .replace (expression (right_spaced (opening (ANY)) + TAGLESS + left_spaced (closing (ANY))), function (match, $1, $2, $3, $4) { return $2 == $4 ? match.replace (/[\n\r]/g, '') : match })
                 .replace (/\r/g, '\n').replace (/\n+/g, '\n').replace (/^\s+/g, '').replace (/\s+$/g, '')
                 .replace (expression (style (either ('line-height', 'font-size', 'font-family', 'color'))), '')
                 .replace (/\sstyle=['"]\s*['"]/ig, '')

      data = data.split ('\n')
      for (var n = 0, i = 0; i < data.length; i ++)
      {
        var isOpening = expression (opening (BLOCK)).test (data [i])
        var isClosing = expression (closing (BLOCK)).test (data [i])

             if (isOpening && ! isClosing) {       data [i] = indent (n) + data [i]; n ++ }
        else if (isClosing && ! isOpening) { n --; data [i] = indent (n) + data [i]       }
        else                               {       data [i] = indent (n) + data [i]       }
      }
      return data.join ('\n')
    }

    CKEDITOR.htmlDataProcessor.prototype.toDataFormat = toDataFormat

    ////////////////////////////////////////////////////////////// Tidy Source //

  });

  $(document).on("ornament:refresh", function(){
    $(document).trigger("ornament:ck-editor");
  });

  $(document).on("ornament:tab-change", function () {  
    $(document).trigger("ornament:ck-editor");
  });

}(document, window, jQuery));

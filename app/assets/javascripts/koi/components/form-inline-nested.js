/*jslint browser: true, indent: 2, todo: true, unparam: true */
/*global jQuery,Ornament /*/

(function (document, window, $) {

  "use strict";

  $(document).on("ornament:refresh", function () {

    var $nestedFields = $("[data-inline-nested]");

    // Generic initialising of CKEditor on new elements
    var initCkEditorOn = function(parentElement) {
      parentElement.find('.wysiwyg.source').not(".wysiwyg-enabled").each(function() {
        $(this).addClass("wysiwyg-enabled");
        CKEDITOR.replace (this);
      });
    }

    // Show inline item regardless of current state
    var showNestedPane = function($pane) {
      $pane.addClass("active");
      $pane.children("[data-inline-nested-field-heading]").addClass("nested-fields-visible");
      // $pane.siblings().find("[data-inline-nested-field-heading]").removeClass("nested-fields-visible").next(".nested-inline-fields").hide();
      $pane.children(".nested-inline-fields").slideDown('fast');
    }

    // Hide inline item regardless of current state
    var hideNestedPane = function($pane) {
      $pane.removeClass("active");
      $pane.children("[data-inline-nested-field-heading]").removeClass("nested-fields-visible");
      // $pane.siblings().find("[data-inline-nested-field-heading]").removeClass("nested-fields-visible").next(".nested-inline-fields").hide();
      $pane.children(".nested-inline-fields").slideUp('fast');
    }

    // Either show or hide based on current state
    var toggleNestedPane = function($pane) {
      if($pane.is(".active")) {
        hideNestedPane($pane);
      } else {
        showNestedPane($pane);
      }
    }

    // Generic function to update ordinal fields based on order of items
    var updateOrdinal = function(fields) {
      fields.children(".inline-ordinal-wrapper").find('.inline-ordinal').each(function(i, e) {
        $(e).val(i);
      });
    }

    // Some global bindings for programatic state setting if needed
    $nestedFields.each(function(){
      var $inlineNested = $(this);
      $inlineNested.bind("koi:inline-nested:make-sortable", function(){
        makeNestedSortable($inlineNested);
      });
      $inlineNested.bind("koi:inline-nested:make-unsortable", function(){
        makeNestedUnsortable($inlineNested);
      });
    });

    // Clicking on collapser will toggle the pane
    $("body").off("click", ".collapser").on("click", ".collapser", function (event) {
      toggleNestedPane($(this).closest(".nested-fields"));
    });

    // Show the new item and collapse the others
    $(document).on("ornament:inline-nested:insert", function(event, insertedItem) {
      showNestedPane(insertedItem);
      // Init CKEditor if necessary
      initCkEditorOn(insertedItem);
      Ornament.C.FormHelpers.tagifyInputs();
      Ornament.C.FormHelpers.enhanceForms();
      // Find the parent inline nested element and check if we 
      // need to update ordinals 
      var $inlineNested = insertedItem.closest("[data-inline-nested]");
      if($inlineNested.is("[data-inline-nested-sortable]")) {
        var nested_inline_fields = insertedItem.parent().children(".nested-fields");
        updateOrdinal(nested_inline_fields);
      }
    });

    // Changing the re-ordering checkbox 
    $("body").off("change", "[data-inline-nested-sortable-toggle]").on("change", "[data-inline-nested-sortable-toggle]", function() {

      var parent               = $(this).closest(".inline-nested--heading").next(".nested-wrapper");
      var nested_container     = parent.children(".nested-container")
      var nested_fields        = nested_container.children(".nested-fields");
      var nested_title_fields  = nested_fields.children("[data-inline-nested-field-heading]");
      var nested_inline_fields = nested_fields.children(".nested-inline-fields");
      var handlers             = nested_fields.children("[data-inline-nested-field-heading]").children(".drag-handler");

      if (this.checked) {

        parent.addClass("nested-wrapper-ordering");
        nested_inline_fields.hide();
        nested_container.children(".nested-links").hide();
        nested_title_fields.removeClass("nested-fields-visible");
        nested_title_fields.children(".collapser").addClass("no-collapser").removeClass("collapser");
        nested_title_fields.children(".drag-handler").show().addClass("drag-me");
        nested_fields.removeClass("active");

        nested_container.sortable({
          axis: "y",
          handle: ".drag-me",
          stop: function( event, ui ) {
            updateOrdinal(nested_fields);
          }
        });

      } else {

        parent.removeClass("nested-wrapper-ordering");
        nested_container.children(".nested-links").show();
        nested_fields.children("[data-inline-nested-field-heading]").children(".drag-handler").hide().removeClass("drag-me");
        nested_fields.children("[data-inline-nested-field-heading]").children(".no-collapser").addClass("collapser").removeClass("no-collapser");
      }

    });

    $('body').unbind('cocoon:after-insert').bind('cocoon:after-insert', function(event, insertedItem) {
      $(document).trigger("ornament:inline-nested:insert", [insertedItem]);
    });

  });

}(document, window, jQuery));
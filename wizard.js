/*!
 * Wizard.js JavaScript Library v1.0.0
 * https://github.com/lcavadas/wizard
 *
 * Copyright 2013, Luis Serralheiro
 */
(function ($) {
  $.fn.wizard = function (extraProps) {

    var props = {
      keepOriginals: false,
      cancel: "Cancel",
      previous: "Previous",
      next: "Next",
      finish: 'Finish',
      previous_animation: function (toHide, toShow, callback) {
        toHide.fadeOut(function () {
          toShow.fadeIn(callback);
        });
      },
      next_animation: function (toHide, toShow, callback) {
        toHide.fadeOut(function () {
          toShow.fadeIn(callback);
        });
      },
      onfinish: function () {
        console.log('WizardJS: Finished');
        _$that.hide();
      },
      onstart: function () {
        console.log('WizardJS: Started');
      },
      oncancel: function () {
        console.log('WizardJS: Cancelled');
        _$that.hide();
      },
      steps: [
        {
          content: "<div style='margin: 10px;'>This is step one</div>",
          description: 'Step one',
          before_next: function () {
            console.log('WizardJS: step 1 before next')
          },
          before_previous: function () {
            console.log('WizardJS: step 1 before previous')
          }
        },
        {
          content: "<div style='margin: 10px;'>This is step two</div>",
          description: 'Step two',
          before_next: function () {
            console.log('WizardJS: step 2 before next')
          },
          before_previous: function () {
            console.log('WizardJS: step 2 before previous')
          }
        },
        {
          content: "<div style='margin: 10px;'>This is step three</div>",
          description: 'Step three',
          before_next: function () {
            console.log('WizardJS: step 3 before next')
          },
          before_previous: function () {
            console.log('WizardJS: step 3 before previous')
          }
        }
      ]
    }
    $.extend(props, extraProps);

    var _that = this,
      _$that = $(_that),
      _steps = props.steps || [],
      _currStep = 0;

    var _view = (function () {

      var html = '<div class="wizard-wrapper">' +
        '   <div class="wizard-breadcrum-wrapper">';

      var i = 0;
      var _step;
      for (; i < _steps.length; i++) {
        _step = _steps[i];
        html +=
          '       <span class="wizard-breadcrum-step-' + i + ' wizard-breadcrum">' +
          '           <span class="step-number">' + (i + 1) + '. </span>' +
          '           <span class="step-description">' + _step.description + '</span>' +
          '       </span>';
      }

      html += '   </div>' +
        '   <div class="wizard-content"><div class="wizard-step-wrapper"></div>' +
        '   </div>' +
        '   <div class="wizard-controls">' +
        '       <button class="wizard-cancel rounded-corners-5px">' + props.cancel + '</button>' +
        '       <button class="wizard-previous rounded-corners-5px">' + props.previous + '</button>' +
        '       <button class="wizard-next rounded-corners-5px">' + props.next + '</button>' +
        '   </div>' +
        '</div>';

      _$that.append(html);

      _steps.map(function (step, idx) {
        if (step.content) {
          _$that.find("div.wizard-step-wrapper").append(
            (props.keepOriginals ?
              $(step.content).clone().addClass("wizard-step").addClass('wizard-step-' + idx).hide() :
              $(step.content).detach().addClass("wizard-step").addClass('wizard-step-' + idx).hide()));
        }
      });

      var _resetBreadCrumbState = function () {
        var i = 0;
        for (; i < _steps.length; i++) {
          var el = _$that.find('.wizard-breadcrum-step-' + i);
          el.removeClass('wizard-breadcrum-current');
          el.removeClass('wizard-breadcrum-completed');
        }
      };

      return {
        updateControlStates: function () {
          if (_currStep == 0) {
            _$that.find('button.wizard-previous').attr("disabled", true);
          } else {
            _$that.find('button.wizard-previous').attr("disabled", false);
          }

          if (_currStep + 1 === _steps.length) {
            _$that.find('button.wizard-next').text(props.finish);
          } else {
            _$that.find('button.wizard-next').text(props.next);
          }
        },
        updateBreadCrumbState: function () {
          for (var i = 0; i < _steps.length; i++) {
            var el = _$that.find('.wizard-breadcrum-step-' + i);

            if (i !== _currStep) {
              el.removeClass('wizard-breadcrum-current');
            } else {
              el.addClass('wizard-breadcrum-current');
              el.removeClass('wizard-breadcrum-completed');
            }

            if (_steps[i].completed && i != _currStep) {
              el.addClass('wizard-breadcrum-completed');
            }
          }
        },
        disableControls: function () {
          _$that.find('button.wizard-next').attr("disabled", true);
          _$that.find('button.wizard-previous').attr("disabled", true);
          _$that.find('button.wizard-cancel').attr("disabled", true);
        },
        enableControls: function () {
          _$that.find('button.wizard-next').attr("disabled", false);
          _$that.find('button.wizard-previous').attr("disabled", false);
          _$that.find('button.wizard-cancel').attr("disabled", false);
        },
        resetView: function () {
          _resetBreadCrumbState();
          this.enableControls();
          this.updateControlStates();
          this.updateBreadCrumbState();
        },
        showStep: function (n) {
          _steps.forEach(function (step, idx) {
            if (idx === n) {
              _$that.find('.wizard-step-' + idx).show();
            } else {
              _$that.find('.wizard-step-' + idx).hide();
            }
          });
        }
      }
    }());

    var _callSeconddIfFirst = function (beforeFn, actionFn) {
      var proceed = true;

      if (beforeFn && typeof beforeFn === 'function') {
        proceed = beforeFn();
      }

      if (proceed || proceed === undefined) {
        actionFn();
      }
    };

    var _start = function () {
      props.onstart();
      _currStep = 0;
      _view.showStep(_currStep);
    };

    var _bindControls = function () {

      _$that.find('button.wizard-next').bind('click', function () {
        _callSeconddIfFirst(_steps[_currStep].before_next, _showNextStep);
      });

      _$that.find('button.wizard-previous').bind('click', function () {
        _callSeconddIfFirst(_steps[_currStep].before_previous, _showPreviousStep);
      });

      _$that.find('button.wizard-cancel').bind('click', function () {
        _cancelWizard();
      });
    };

    var _showNextStep = function () {
      if (_currStep + 1 == _steps.length) {
        _finishWizard();
        return;
      }

      _steps[_currStep].completed = true;
      _currStep++;
      _view.updateBreadCrumbState();

      _view.disableControls();
      props.next_animation(_$that.find('.wizard-step-' + (_currStep - 1)), _$that.find('.wizard-step-' + _currStep), function () {
        _view.enableControls();
        _view.updateControlStates();
      });
    };

    var _showPreviousStep = function () {
      _currStep--;

      _view.updateControlStates();
      _view.updateBreadCrumbState();

      _view.disableControls();
      props.previous_animation(_$that.find('.wizard-step-' + (_currStep + 1)), _$that.find('.wizard-step-' + _currStep), function () {
        _view.enableControls();
      })
    };

    var _finishWizard = function () {
      _callSeconddIfFirst(props.onfinish, _view.disableControls);
    };

    var _cancelWizard = function () {
      _callSeconddIfFirst(props.oncancel, _view.disableControls);
    };

    var _initWizardState = function () {
      _steps.map(function (step) {
        step.completed = false;
      });
    };

    _initWizardState();
    _bindControls();
    _view.updateControlStates();
    _view.updateBreadCrumbState();
    _start();

    return {
      next: _showNextStep,
      previous: _showPreviousStep,
      reset: function () {
        _initWizardState();
        _start();
        _view.resetView();
      }
    }
  };
}(jQuery));

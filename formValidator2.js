function Validator(formSelector) {
  var _this = this
  function getParent(element, selector) {
    while (element.parentElement) {
      if (element.parentElement.matches(selector)) {
        return element.parentElement;
      }
      element = element.parentElement;
    }
  }
  var formRules = {};

  // validate rules
  var validatorRules = {
    required: function (value) {
      return value ? undefined : "Please input value";
    },
    email: function (email) {
      var regex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
      return regex.test(email) ? undefined : "This value must be email";
    },
    min: function (min) {
      return function (value) {
        return value.length >= min
          ? undefined
          : `Please input minimum ${min} characters`;
      };
    },
    max: function (max) {
      return function (value) {
        return value.length <= max
          ? undefined
          : `Please input maximum ${max} characters`;
      };
    },
  };

  // query
  var formElement = document.querySelector(formSelector);
  if (formElement) {
    var inputs = formElement.querySelectorAll("[name][rules]");
    for (var input of inputs) {
      var rules = input.getAttribute("rules").split("|");
      for (var rule of rules) {
        var isRuleHasValue = rule.includes(":");
        var ruleInfo;
        if (isRuleHasValue) {
          ruleInfo = rule.split(":");
          rule = ruleInfo[0];
        }
        var ruleFunc = validatorRules[rule];
        if (isRuleHasValue) {
          ruleFunc = validatorRules[rule](ruleInfo[1]);
        }
        // contain rules into formRules
        if (Array.isArray(formRules[input.name])) {
          formRules[input.name].push(ruleFunc);
        } else {
          formRules[input.name] = [ruleFunc];
        }

        // hearing the events to validate
        input.onblur = handleValidate;
        input.oninput = handleCleareErr;
      }

      // fuction validate
      function handleValidate(event) {
        var rules = formRules[event.target.name];
        var errMessage;
        for (var rule of rules) {
          errMessage = rule(event.target.value);
          if (errMessage) break;
        }

        if (errMessage) {
          var formGroup = getParent(event.target, ".form-group");
          if (formGroup) {
            var formMessage = formGroup.querySelector(".form-message");
            if (formMessage) {
              formMessage.innerText = errMessage;
              formGroup.classList.add("invalid");
            }
          }
        }
        return !errMessage;
      }
      function handleCleareErr(event) {
        var formGroup = getParent(event.target, ".form-group");
        if (formGroup) {
          var formMessage = formGroup.querySelector(".form-message");
          if (formMessage) {
            formMessage.innerText = "";
            formGroup.classList.remove("invalid");
          }
        }
      }
    }
    // console.log(formRules);
  }

  // on submit
  formElement.onsubmit = function (event) {
    event.preventDefault();
    

    
    var inputs = formElement.querySelectorAll("[name][rules]");
    for (var input of inputs) {
      var isValid = true;
      if (!handleValidate({ target: input })) {
        isValid = false;
      }
    }
    if (isValid) {
      if (typeof _this.onSubmit === "function") {
        // store value
        var enableInputs = formElement.querySelectorAll(
          "[name][rules]:not([disable])"
        );
        var formValues = Array.from(enableInputs).reduce(function (
          values,
          input
        ) {
          switch (input.type) {
            //radio
            case "radio":
              values[input.name] = formElement.querySelector(
                'input[name="' + input.name + '"]:checked'
              ).value;
              break;

            //checkbox
            case "checkbox":
              if (!input.matches(":checked")) {
                values[input.name] = "";
                return values;
              }
              if (!Array.isArray(values[input.value])) {
                values[input.name] = [];
              }
              values[input.name].push(input.value);
              break;
            default:
              values[input.name] = input.value;
          }
          return values;
        },
        {});
        _this.onSubmit(formValues);
      } else {
        formElement.submit();
      }
    }
  };
}

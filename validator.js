Validator.isRequired = function (selector, mess) {
  return {
    selector: selector,
    test: function (input) {
      return input ? undefined : mess || "vui lòng nhập trường này";
    },
  };
};

Validator.isEmail = function (selector, mess) {
  return {
    selector: selector,
    test: function (email) {
      var pattern = /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/;
      return pattern.test(email)
        ? undefined
        : mess || "vui lòng nhập trường này";
    },
  };
};

Validator.isPassword = function (selector, mess) {
  return {
    selector: selector,
    test: function (pass) {
      return pass.length >= 6 ? undefined : mess || "vui lòng nhập trường này";
    },
  };
};

Validator.isConfirm = function (selector, callback, mess) {
  return {
    selector: selector,
    test: function (confrim) {
      return confrim === callback()
        ? undefined
        : mess || "vui lòng nhập trường này";
    },
  };
};

//-----------------------------------------------------------------------------------------
function Validator(option) {
  var rulesContain = {};

  // get parent
  function getParent(inputElement, selector) {
    while (inputElement.parentElement) {
      if (inputElement.parentElement.matches(selector)) {
        return inputElement.parentElement;
      }
      inputElement = inputElement.parentElement;
    }
  }
  //validate fuction
  function Validate(inputElement, rule) {
    var errMessage;
    var rulesSelector = rulesContain[rule.selector];
    for (var i = 0; i < rulesSelector.length; ++i) {
      switch (inputElement.type) {
        case "checkbox":
        case "radio":
          errMessage = rulesSelector[i](
            formElement.querySelector(rule.selector + ":checked")
          );
          break;
        default:
          errMessage = rulesSelector[i](inputElement.value);
      }
      if (errMessage) break;
    }

    if (errMessage) {
      getParent(inputElement, option.formGroupSelector).querySelector(
        option.errSelector
      ).innerText = errMessage;
      getParent(inputElement, option.formGroupSelector).classList.add(
        "invalid"
      );
    } else {
      getParent(inputElement, option.formGroupSelector).querySelector(
        option.errSelector
      ).innerText = "";
      getParent(inputElement, option.formGroupSelector).classList.remove(
        "invalid"
      );
    }
    return !errMessage;
  }

  //query in to the form
  var formElement = document.querySelector(option.form);
  if (formElement) {
    // on submit
    var submitElement = formElement.querySelector(".form-submit");
    submitElement.onclick = function (e) {
      e.preventDefault();
      var formValid = true;

      option.rules.forEach(function (rule) {
        var inputElement = formElement.querySelector(rule.selector);
        var isValid = Validate(inputElement, rule);
        if (!isValid) {
          formValid = false;
        }
        return formValid;
      });

      if (formValid) {
        if (typeof option.onSubmit === "function") {
          var enableInputs = formElement.querySelectorAll(
            "[name]:not([disable])"
          );
          var formInputs = Array.from(enableInputs).reduce(function (
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
          console.log(formInputs);
        } else formElement.submit();
      }
    };

    option.rules.forEach(function (rule) {
      // contain rules into array

      var rulesSelector = rulesContain[rule.selector];
      if (Array.isArray(rulesSelector)) {
        rulesSelector.push(rule.test);
      } else {
        rulesSelector = [rule.test];
      }
      rulesContain[rule.selector] = rulesSelector;

      var inputElements = formElement.querySelectorAll(rule.selector);
      Array.from(inputElements).forEach(function (inputElement) {
        //on blur
        inputElement.onblur = function () {
          Validate(inputElement, rule);
        };

        // on input
        inputElement.oninput = function () {
          getParent(inputElement, option.formGroupSelector).querySelector(
            option.errSelector
          ).innerText = "";
          getParent(inputElement, option.formGroupSelector).classList.remove(
            "invalid"
          );
        };
      });
    });
  }
}

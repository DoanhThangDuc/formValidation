Validator.isRequired = function (selector, mess) {
  return {
    selector: selector,
    test: function (input) {
      return input ? undefined : mess || "please input this form";
    },
  };
};

Validator.isEmail = function (selector, mess) {
  return {
    selector: selector,
    test: function (email) {
      var regex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
      return regex.test(email) ? undefined : mess || "That is not the email";
    },
  };
};

Validator.isPassword = function (selector, character, mess) {
  return {
    selector: selector,
    test: function (password) {
      return password.length >= character
        ? undefined
        : mess || `The value need to be more than ${character} character!`;
    },
  };
};

Validator.isConfirm = function (selector, password, mess) {
  return {
    selector: selector,
    test: function (confirm) {
      return confirm === password() ? undefined : mess;
    },
  };
};

function Validator(option) {
  var rulesObject = {};

  // get parent function
  function getParent(inputElement, parentSelector) {
    while (inputElement.parentElement) {
      if (inputElement.parentElement.matches(parentSelector)) {
        return inputElement.parentElement;
      }
      inputElement = inputElement.parentElement;
    }
  }
  // validate function
  function Validate(inputElement, rule) {
    var errMessage;
    var selectorRules = rulesObject[rule.selector];
    for (var i = 0; i < selectorRules.length; ++i) {
      switch (inputElement.type) {
        case "checkbox":
        case "radio":
          errMessage = selectorRules[i](
            formElement.querySelector(rule.selector + ":checked")
          );
          break;
        default:
          errMessage = selectorRules[i](inputElement.value);
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

  // query selector
  var formElement = document.querySelector(option.form);
  if (formElement) {
    option.rules.forEach(function (rule) {
      //store rules of each selector in to array

      var selectorRules = rulesObject[rule.selector];
      if (Array.isArray(selectorRules)) {
        selectorRules.push(rule.test);
      } else {
        selectorRules = [rule.test];
      }
      rulesObject[rule.selector] = selectorRules;

      var inputElements = formElement.querySelectorAll(rule.selector);

      Array.from(inputElements).forEach(function (inputElement) {
        //onblur

        inputElement.onblur = function () {
          Validate(inputElement, rule);
        };

        //on input
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
              //file
              case "file":
                values[input.value] = input.files;
                break;
              //checkbox
              //----------BUG IN HERE--------
              case "checkbox":
                if (input.matches(":checked")) {
                  if (!Array.isArray(values[input.name])) {
                    values[input.name] = [input.value];
                  } else {
                    values[input.name].push(input.value);
                  }
                  return values
                } else {
                  values[input.name] = "";
                  return values;
                }
                break;
              //radio
              case "radio":
                values[input.name] = formElement.querySelector(
                  'input[name="' + input.name + '"]:checked'
                ).value;
                break;
              default:
                values[input.name] = input.value;
            }
            return values;
          },
          {});
          option.onSubmit(formInputs);
        }
      }
    };
  }
}

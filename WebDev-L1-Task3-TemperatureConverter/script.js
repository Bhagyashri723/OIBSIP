const form = document.getElementById("converterForm");
const temperatureInput = document.getElementById("temperature");
const unitSelect = document.getElementById("unit");
const errorMessage = document.getElementById("errorMessage");
const resetBtn = document.getElementById("resetBtn");
const resultState = document.getElementById("resultState");

const celsiusResult = document.getElementById("celsiusResult");
const fahrenheitResult = document.getElementById("fahrenheitResult");
const kelvinResult = document.getElementById("kelvinResult");

function showError(message) {
  errorMessage.textContent = message;
  temperatureInput.classList.add("invalid");
  resultState.textContent = "Check your input";
  resultState.classList.remove("success");
}

function clearError() {
  errorMessage.textContent = "";
  temperatureInput.classList.remove("invalid");
}

function formatTemperature(value) {
  return Number(value.toFixed(2)).toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
}

function convertTemperature(event) {
  event.preventDefault();
  clearError();

  const rawValue = temperatureInput.value.trim();

  if (rawValue === "") {
    showError("Please enter a temperature value.");
    return;
  }

  // Accept decimal and negative values, reject letters/symbols.
  if (!/^-?(?:\d+(?:\.\d*)?|\.\d+)$/.test(rawValue)) {
    showError("Please enter a valid numeric temperature.");
    return;
  }

  const input = Number(rawValue);
  if (!Number.isFinite(input)) {
    showError("Please enter a valid numeric temperature.");
    return;
  }

  const unit = unitSelect.value;
  let celsius;

  if (unit === "celsius") {
    celsius = input;
  } else if (unit === "fahrenheit") {
    celsius = (input - 32) * 5 / 9;
  } else {
    celsius = input - 273.15;
  }

  // Absolute zero = -273.15 °C / 0 K.
  if (celsius < -273.15) {
    showError("That temperature is below absolute zero. Please enter a valid value.");
    return;
  }

  const fahrenheit = (celsius * 9 / 5) + 32;
  const kelvin = celsius + 273.15;

  celsiusResult.textContent = formatTemperature(celsius) + " °C";
  fahrenheitResult.textContent = formatTemperature(fahrenheit) + " °F";
  kelvinResult.textContent = formatTemperature(kelvin) + " K";

  resultState.textContent = "Conversion complete";
  resultState.classList.add("success");
}

function resetConverter() {
  form.reset();
  clearError();
  celsiusResult.textContent = "—";
  fahrenheitResult.textContent = "—";
  kelvinResult.textContent = "—";
  resultState.textContent = "Waiting for input";
  resultState.classList.remove("success");
  temperatureInput.focus();
}

form.addEventListener("submit", convertTemperature);
resetBtn.addEventListener("click", resetConverter);

temperatureInput.addEventListener("input", () => {
  if (temperatureInput.classList.contains("invalid")) clearError();
});

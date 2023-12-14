import Rails from "@rails/ujs";

const batchActionClick = function(event) {
  event.preventDefault();
  let batchAction = document.getElementById("batch_action");
  if (batchAction) {
    batchAction.value = this.dataset.action;
  }
};

const batchActionConfirmComplete = function(event) {
  event.preventDefault();
  if (event.detail[0] === true) {
    let batchAction = document.getElementById("batch_action");
    if (batchAction) {
      batchAction.value = this.dataset.action;
    }
    let form = document.getElementById("collection_selection");
    if (form) {
      form.submit();
    }
  }
};

const batchActionFormSubmit = function(event) {
  event.preventDefault();
  let json = JSON.stringify(Object.fromEntries(new FormData(this).entries()));
  let inputsField = document.getElementById("batch_action_inputs");
  let form = document.getElementById("collection_selection");
  if (json && inputsField && form) {
    inputsField.value = json;
    form.submit();
  }
};

Rails.delegate(document, "[data-batch-action-item]", "confirm:complete", batchActionConfirmComplete);

Rails.delegate(document, "[data-batch-action-item]", "click", batchActionClick);

Rails.delegate(document, "form[data-batch-action-form]", "submit", batchActionFormSubmit);

const toggleDropdown = function(condition) {
  const button = document.querySelector(".batch-actions-dropdown > button");
  if (button) {
    button.disabled = condition;
  }
};

const toggleAllChange = function(event) {
  const checkboxes = document.querySelectorAll("input[type=checkbox].collection_selection");
  for (const checkbox of checkboxes) {
    checkbox.checked = this.checked;
  }
  const rows = document.querySelectorAll(".paginated-collection tbody tr");
  for (const row of rows) {
    row.classList.toggle("selected", this.checked);
  }
  toggleDropdown(!this.checked);
};

Rails.delegate(document, "input[type=checkbox].toggle_all", "change", toggleAllChange);

const toggleCheckboxChange = function(event) {
  const numChecked = document.querySelectorAll("input[type=checkbox].collection_selection:checked").length;
  const allChecked = numChecked === document.querySelectorAll("input[type=checkbox].collection_selection").length;
  const someChecked = numChecked > 0 && numChecked < document.querySelectorAll("input[type=checkbox].collection_selection").length;
  const toggleAll = document.querySelector("input[type=checkbox].toggle_all");
  if (toggleAll) {
    toggleAll.checked = allChecked;
    toggleAll.indeterminate = someChecked;
  }
  toggleDropdown(numChecked === 0);
};

Rails.delegate(document, "input[type=checkbox].collection_selection", "change", toggleCheckboxChange);

const tableRowClick = function(event) {
  const type = event.target.type;
  if (typeof type === "undefined" || type !== "checkbox" && type !== "button" && type !== "") {
    const checkbox = event.target.closest("tr").querySelector("input[type=checkbox]");
    if (checkbox) {
      checkbox.click();
    }
  }
};

Rails.delegate(document, ".paginated-collection tbody td", "click", tableRowClick);

const THEME_KEY = "color-scheme";

const darkModeMedia = window.matchMedia("(prefers-color-scheme: dark)");

const setTheme = () => {
  const darkIcon = document.getElementById("theme-toggle-dark-icon");
  const lightIcon = document.getElementById("theme-toggle-light-icon");
  if (localStorage.getItem(THEME_KEY) === "dark" || !(THEME_KEY in localStorage) && darkModeMedia.matches) {
    document.documentElement.classList.add("dark");
    lightIcon.classList.add("hidden");
    darkIcon.classList.remove("hidden");
  } else {
    document.documentElement.classList.remove("dark");
    darkIcon.classList.add("hidden");
    lightIcon.classList.remove("hidden");
  }
};

darkModeMedia.addEventListener("change", setTheme);

document.addEventListener("DOMContentLoaded", setTheme);

window.addEventListener("storage", (event => {
  if (event.key === THEME_KEY) {
    setTheme();
  }
}));

const toggleDarkMode = () => {
  if (localStorage.getItem(THEME_KEY) === "light") {
    localStorage.setItem(THEME_KEY, "dark");
  } else {
    localStorage.setItem(THEME_KEY, "light");
  }
  setTheme();
};

Rails.delegate(document, ".dark-mode-toggle", "click", toggleDarkMode);

const hasManyRemoveClick = function(event) {
  event.preventDefault();
  const oldGroup = this.closest("fieldset");
  if (oldGroup) {
    oldGroup.remove();
  }
};

Rails.delegate(document, "a.button.has_many_remove", "click", hasManyRemoveClick);

const hasManyAddClick = function(event) {
  event.preventDefault();
  const parent = this.closest(".has_many_container");
  let index = parseInt(parent.dataset.has_many_index || parent.querySelectorAll("fieldset").length - 1, 10);
  parent.dataset.has_many_index = ++index;
  const regex = new RegExp(this.dataset.placeholder, "g");
  const html = this.dataset.html.replace(regex, index);
  const tempEl = document.createElement("div");
  tempEl.innerHTML = html;
  this.before(tempEl.firstChild);
};

Rails.delegate(document, "a.button.has_many_add", "click", hasManyAddClick);

const nextSibling = function next(element, selector) {
  let sibling = element.nextElementSibling;
  if (!selector) {
    return sibling;
  }
  while (sibling) {
    if (sibling && sibling.matches(selector)) {
      return sibling;
    }
    sibling = sibling.nextElementSibling;
  }
};

const disableEmptyFields = function(event) {
  Array.from(this.querySelectorAll("input, select, textarea")).filter((el => el.value === "")).forEach((el => el.disabled = true));
};

Rails.delegate(document, ".filters-form", "submit", disableEmptyFields);

const setSearchType = function(event) {
  const input = nextSibling(this, "input");
  if (input) {
    input.name = `q[${this.value}]`;
  }
};

Rails.delegate(document, ".filters-form-field [data-search-methods]", "change", setSearchType);

const toggleMenu = function(event) {
  const parent = this.parentNode;
  const menu = nextSibling(this, "[data-menu-list]");
  if (!("open" in parent.dataset)) {
    parent.dataset.open = "";
    menu.classList.remove("hidden");
    this.querySelector("[data-menu-icon]").classList.add("rotate-90");
  } else {
    delete parent.dataset.open;
    menu.classList.add("hidden");
    this.querySelector("[data-menu-icon]").classList.remove("rotate-90");
  }
};

Rails.delegate(document, "#main-menu [data-menu-button]", "click", toggleMenu);

const setPerPage = function(event) {
  const params = new URLSearchParams(window.location.search);
  params.set("per_page", this.value);
  window.location.search = params;
};

Rails.delegate(document, ".pagination-per-page", "change", setPerPage);

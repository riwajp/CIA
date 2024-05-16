console.log("sadsad");

const submit_button = document.getElementById("submit");
console.log(submit_button);
submit_button.onclick = (e) => {
  localStorage.setItem("name", input.value);

  console.log(localStorage.getItem("name"));
};

const input = document.getElementById("input");

const preset_name = localStorage.getItem("name");
input.value = preset_name ?? "";

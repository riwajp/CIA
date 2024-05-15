const submit_button = document.getElementById("submit");
submit_button.onclick = (e) => {
  localStorage.setItem("name", e.target.value);
  console.log(localStorage.getItem("name"));
};

const input = document.getElementById("input");

const preset_name = localStorage.get("name");
input.value = preset_name ?? "";

const my_name = "Helms#3881";
let users = {};
const resources = ["lumber", "brick", "wool", "grain", "ore"];
const resources_required = {
  road: ["lumber", "brick"],
  settlement: ["lumber", "brick", "wool", "grain"],
  city: ["grain", "grain", "ore", "ore", "ore"],
  dev_card: ["wool", "grain", "ore"],
};

let isMonopolyCountPending = false;
let monopolyResource = null;
let monopolyUser = null;

const container = document.createElement("div");
container.style =
  "position:absolute; bottom:100px; left:300px;display:flex; flex-direction:column; gap:4px;z-index:1000;";

document.getElementsByTagName("body")[0].appendChild(container);
const userHasEnoughResources = (user, building_name) => {
  const user_resources = users[user].resources;

  for (let resource of resources_required[building_name]) {
    if (user_resources.indexOf(resource) == -1) {
      return false;
    }
    // user_resources.splice(user_resources.indexOf(resource), 1);
  }
  return true;
};
const addUser = (name) => {
  users[name] = {
    resources: [],
    road: 0,
    settlement: 0,
    city: 0,

    extra: 0,
  };
};

const usedInsufficientResource = (name, resource) => {
  // const robbedArray = users[name].robbed;
  // const possibleTargets = [];
  // robbedArray.forEach((robbedArrayElement) => {
  //   if (robbedArrayElement.resource.includes(resource)) {
  //     possibleTargets.push(robbedArrayElement);
  //   }
  // });
  // if (possibleTargets.length == 1) {
  //   removeUserResource(possibleTargets[0].user, [resource]);
  //   users[name].robbed.shift();
  //   users[possibleTargets[0].user].gotRobbed = users[
  //     possibleTargets[0].user
  //   ].gotRobbed.filter(
  //     (r) =>
  //       !(
  //         r.user == name &&
  //         r.resource.join("") == possibleTargets[0].resource.join("")
  //       )
  //   );
  //   return;
  // }

  users[name].extra--;
};

const removeUserResource = (name, resources) => {
  console.log("remove", resources);
  resources.forEach((resource) => {
    if (users[name].resources.indexOf(resource) != -1) {
      users[name].resources.splice(users[name].resources.indexOf(resource), 1);
    } else {
      usedInsufficientResource(name, resource);
    }
  });
};
const checkType = (message) => {
  if (
    message.innerText.includes("received") ||
    message.innerText.includes("got")
  )
    return "receive";
  if (
    message.innerText.includes("placed") ||
    message.innerText.includes("built")
  )
    return "place";
  if (message.innerText.includes("traded")) return "trade";
  if (message.innerText.includes("discarded")) return "discard";
  if (message.innerText.includes("stole") && message.innerText.includes("from"))
    return "steal";
  if (message.innerText.includes("gave bank")) return "bank";
  if (message.innerText.includes("bought")) return "buyDevCard";
  if (message.innerText.includes("took") && !message.innerText.includes("gave"))
    return "useYearOfPlenty";

  if (
    message.innerText.includes("stole") &&
    !message.innerText.includes("from")
  )
    return "useMonopoly";

  return undefined;
};

const getName = (message) => {
  const spans = Array.from(message.getElementsByTagName("span"));
  const name_span = spans[1];
  const name = name_span.innerText;
  return name;
};

const predictRobbedCard = (robbed_user) => {
  const potential_robbed_resources = Array.from(
    new Set(users[robbed_user].resources)
  );

  if (potential_robbed_resources.length == 0) return [];

  if (potential_robbed_resources.length == 1)
    return [potential_robbed_resources[0]];

  return potential_robbed_resources;
};

const recieved = (message) => {
  const name = getName(message);

  //if users doesn't have that user, add it.
  if (!users[name]) addUser(name);

  //get list of all images from the div
  const images = Array.from(message.getElementsByTagName("img"));
  if (images.filter((image) => image.alt.includes("longest")).length) return;
  if (images.filter((image) => image.alt.includes("largest")).length) return;
  //remove first image as it's the user's image, the rest of it are resources' images
  images.shift();

  //for each of the resource image, get it' alt text which is the resource name
  for (let resource_image of images) {
    const resource_name = resource_image.alt;

    users[name].resources.push(resource_name);
  }
};

const placed = (message) => {
  const name = getName(message);

  //if users doesn't have that user, add it.
  if (!users[name]) addUser(name);

  //get list of all images from the div
  const images = Array.from(message.getElementsByTagName("img"));

  //remove first image as it's the user's image, the next one is the placed item image
  images.shift();

  //for the building image, get its alt text which is the building name

  const building_name = images[0].alt;
  users[name][building_name]++;

  if (building_name == "city") {
    removeUserResource(name, resources_required[building_name]);
  } else {
    if (users[name][building_name] > 2) {
      removeUserResource(name, resources_required[building_name]);
    }
  }
  // message.innerHTML = message.innerHTML + "<br> built" + building_name;
};

const traded = (message) => {
  const span = Array.from(message.getElementsByTagName("span"))[0];
  const span_child_nodes = Array.from(span.childNodes);
  const initiator = span_child_nodes[0].innerText;
  const acceptor = span_child_nodes[span_child_nodes.length - 1].innerText;

  span_child_nodes.pop();
  span_child_nodes.pop();
  span_child_nodes.splice(0, 2);

  let resource_type = "give";
  span_child_nodes.forEach((node) => {
    if (!node.src && !node.data.includes("\n") && node.data != " ") {
      resource_type = "take";
    } else {
      const resource_name = node.alt;
      if (resource_type == "give") {
        removeUserResource(initiator, [resource_name]);
        users[acceptor].resources.push(resource_name);
      } else {
        removeUserResource(acceptor, [resource_name]);
        users[initiator].resources.push(resource_name);
      }
    }
  });
};

const banked = (message) => {
  console.log("===================================================");
  console.log(message);
  const span = Array.from(message.getElementsByTagName("span"))[0];

  const span_child_nodes = Array.from(span.childNodes);
  const user = span_child_nodes[0].innerText;

  span_child_nodes.pop();

  span_child_nodes.splice(0, 2);

  console.log(span_child_nodes);
  let resource_type = "give";
  span_child_nodes.forEach((node) => {
    if (!node.src) {
      if (!node.data.includes("\n") && node.data != " ") {
        resource_type = "take";
      }
    } else {
      const resource_name = node.alt;
      console.log(node);

      if (resource_type == "give") {
        removeUserResource(user, [resource_name]);
        console.log(resource_name);
      } else {
        users[user].resources.push(resource_name);
        console.log(resource_name);
      }
    }
  });
};

const discarded = (message) => {
  const name = getName(message);

  //get list of all images from the div
  const images = Array.from(message.getElementsByTagName("img"));

  //remove first image as it's the user's image, the rest of it are resources' images
  images.shift();

  //for each of the resource image, get it' alt text which is the resource name
  for (let resource_image of images) {
    const resource_name = resource_image.alt;
    removeUserResource(name, [resource_name]);
  }
};

const stole = (message) => {
  const span = Array.from(message.getElementsByTagName("span"))[0];
  const span_child_nodes = Array.from(span.childNodes);
  let robber = span_child_nodes[0].innerText;

  if (span.innerText.includes("You stole")) {
    robber = my_name;
  }

  let robbed = span_child_nodes[span_child_nodes.length - 1].innerText;
  if (span.innerText.includes("from you")) {
    robbed = my_name;
  }

  const robbed_resource = predictRobbedCard(robbed);

  if (robbed_resource.length == 0) {
    users[robber].extra++;

    users[robbed].extra--;
    return;
  }
  if (robbed_resource.length == 1 && users[robbed].extra == 0) {
    users[robber].resources.push(robbed_resource[0]);
    removeUserResource(robbed, [robbed_resource[0]]);
    return;
  }

  users[robber].extra += 1;

  robbed_resource.forEach((resource) => {
    users[robbed].resources.splice(
      users[robbed].resources.indexOf(resource),
      1
    );
    users[robbed].extra++;
  });

  users[robbed].extra--;
};

const boughtDevCard = (message) => {
  const name = getName(message);
  removeUserResource(name, resources_required["dev_card"]);
  const div = document.createElement("div");
};

const usedYearOfPlenty = (message) => {
  const name = getName(message);

  //get list of all images from the div
  const images = Array.from(message.getElementsByTagName("img"));

  //remove first image as it's the user's image, the rest of it are resources' images
  images.shift();

  //for each of the resource image, get it' alt text which is the resource name

  for (let resource_image of images) {
    const resource_name = resource_image.alt;

    users[name].resources.push(resource_name);
  }
};

const usedMonopoly = (message) => {
  const name = getName(message);
  const images = Array.from(message.getElementsByTagName("img"));
  const resource = images[1].alt;
  isMonopolyCountPending = true;
  monopolyResource = resource;
  monopolyUser = name;
  // const span = Array.from(message.getElementsByTagName("span"))[0];
  // Object.keys(users)
  //   .filter((user) => user != name)
  //   .forEach((user) => {
  //     users[user].resources.forEach((r) => {
  //       if (r == resource) {
  //         users[name].resources.push(resource);
  //         console.log(user, resource);
  //       }
  //     });
  //     users[user].resources = users[user].resources.filter(
  //       (r) => r != resource
  //     );
  //   });
};

const resolveMonopoly = () => {
  console.log("here");
  const users_cards_count = {};
  Object.keys(users).forEach((user) => {
    const num_cards = document.getElementById(user).value;
    console.log(num_cards);
    users_cards_count[user] = num_cards;
  });

  console.log(users_cards_count);

  Object.keys(users)
    .filter((user) => user != monopolyUser)
    .forEach((user) => {
      users[monopolyUser].resources.push(
        ...users[user].resources.filter((r) => r == monopolyResource)
      );

      users[user].resources = users[user].resources.filter(
        (r) => r != monopolyResource
      );

      while (
        users[user].resources.length + users[user].extra >
        users_cards_count[user]
      ) {
        users[user].extra--;
        users[monopolyUser].resources.push(monopolyResource);
      }
    });
  console.log(users);

  isMonopolyCountPending = false;
  renderUsers(container, users);
};

const main = () => {
  const logs = document.getElementById("game-log-text");

  const messages = Array.from(logs?.getElementsByClassName("message-post"));
  if (messages?.length) {
    messages.splice(0, processed_message_index + 1);
  }

  for (let message of messages) {
    processed_message_index++;
    console.log("1 more message processed");
    if (checkType(message) == "receive") {
      recieved(message);
    }
    if (checkType(message) == "place") {
      placed(message);
    }

    if (checkType(message) == "trade") {
      traded(message);
    }

    if (checkType(message) == "discard") {
      discarded(message);
    }

    if (checkType(message) == "steal") {
      stole(message);
    }
    if (checkType(message) == "bank") {
      banked(message);
    }
    if (checkType(message) == "buyDevCard") {
      boughtDevCard(message);
    }
    if (checkType(message) == "useYearOfPlenty") {
      usedYearOfPlenty(message);
    }
    if (checkType(message) == "useMonopoly") {
      usedMonopoly(message);
    }
  }
  return users;
};

const renderUsers = (container, users) => {
  container.innerHTML = ``;

  Object.keys(users).forEach((user) => {
    const user_element = document.createElement("div");
    user_element.style =
      "display:flex; align-items:center; gap:8px;border-bottom:1px solid black; padding:4px;";
    user_element.innerHTML = `<div style="margin-right:10px;">${user}</div>`;

    //==============================
    const user_resources_count_element = document.createElement("div");
    user_resources_count_element.style =
      "padding:4px; background-color:#8c7ae6 ;margin-right:15px  ;border:0;border-radius:5px; color:white; font-weight:700;";
    user_resources_count_element.innerHTML =
      "(" + (users[user].resources.length + users[user].extra) + ")";
    user_element.appendChild(user_resources_count_element);
    //==============================

    //==============================
    resources.forEach((resource) => {
      user_resources = users[user].resources.filter((r) => r == resource);
      user_resources.forEach((resource) => {
        const resource_element = document.createElement("img");
        resource_element.src = chrome.runtime.getURL(
          "assets/resources/" + resource + ".svg"
        );
        resource_element.width = "30";
        resource_element.style = "margin-left:-20px";

        user_element.appendChild(resource_element);
      });
    });
    //==============================

    if (users[user].extra != 0) {
      const extra_count_element = document.createElement("div");
      extra_count_element.style =
        "padding:4px; background-color:#66cc99   ;border:0;border-radius:5px; color:white; font-weight:700;";
      extra_count_element.innerHTML = "+" + users[user].extra;
      user_element.appendChild(extra_count_element);
    }

    if (isMonopolyCountPending) {
      const input_element = document.createElement("input");
      input_element.style = "padding:4px; width:50px; ";
      input_element.type = "number";
      input_element.id = user;
      user_element.appendChild(input_element);
    }
    //   users[user].gotRobbed.forEach((r) => {
    //     const robbed_element = document.createElement("div");
    //     robbed_element.style = "width:5px;height:30px;background-color:red ";
    //     user_element.appendChild(robbed_element);
    //   });
    container.appendChild(user_element);
  });

  if (isMonopolyCountPending) {
    const submit_element = document.createElement("button");
    submit_element.style = "padding:4px; ";
    submit_element.textContent = "Done";
    submit_element.onclick = () => resolveMonopoly();

    container.appendChild(submit_element);
  }
};

let processed_message_index = -1;
(() => {
  chrome.runtime.onMessage.addListener((params, sender, response) => {
    users = main();

    renderUsers(container, users);
  });
})();

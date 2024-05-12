const users = {};
(() => {
  chrome.runtime.onMessage.addListener((params, sender, response) => {
    users = {};
    console.log(params.url);
    main();
  });
})();

const resources_required = {
  road: ["lumber", "brick"],
  settlement: ["lumber", "brick", "wool", "grain"],
  city: ["grain", "grain", "ore", "ore", "ore"],
};

const userHasEnoughResources = (user, building_name) => {
  const user_resources = users[user].resources;

  for (let resource of resources_required[building_name]) {
    if (user_resources.indexOf(resource) == -1) {
      return false;
    }
    user_resources.splice(user_resources.indexOf(resource), 1);
  }
  return true;
};
const addUser = (name) => {
  users[name] = {
    resources: [],
    road: 0,
    settlement: 0,
    city: 0,
    robbed: [],
    gotRobbed: [],
  };
};

const usedInsufficientResource = (name, resource) => {
  const robbedArray = users[name].robbed;
  const possibleTargets = [];

  robbedArray.forEach((robbedArrayElement) => {
    if (robbedArrayElement.resource.includes(resource)) {
      possibleTargets.push(robbedArrayElement);
    }
  });

  if (possibleTargets.length == 1) {
    removeUserResource(possibleTargets[0].user, [resource]);
    return;
  }

  // possibleTargets.forEach((possibleTarget) => {
  //   const other_targets_indices = possibleTargets
  //     .filter(
  //       (p) =>
  //         possibleTarget.indexOf(p) != possibleTarget.indexOf(possibleTarget)
  //     )
  //     .map((pt) => possibleTargets.indexOf(pt));

  //   possibleTarget.tied.push(...other_targets_indices);
  // });
};

const removeUserResource = (name, resources) => {
  console.log(name);
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
  if (message.innerText.includes("placed")) return "place";
  if (message.innerText.includes("traded")) return "trade";
  if (message.innerText.includes("discarded")) return "discard";
  if (message.innerText.includes("stole")) return "steal";

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
    if (!node.src) {
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
  const robber = span_child_nodes[0].innerText;
  const robbed = span_child_nodes[span_child_nodes.length - 1].innerText;

  const robbed_resource = predictRobbedCard(robbed);
  if (!robbed_resource.length) {
    return;
  }

  if (robbed_resource.length == 1) {
    users[robber].resources.push(robbed_resource[0]);
    removeUserResource(robbed, [robbed_resource[0]]);
    return;
  }
  users[robber].robbed.push({
    user: robbed,
    resource: robbed_resource,
    tiedWith: [],
  });

  users[robbed].gotRobbed.push({
    user: robber,
    resource: robbed_resource,
  });
};

const main = () => {
  console.log("s");

  const logs = document.getElementById("game-log-text");

  const messages = logs.getElementsByClassName("message-post");

  for (let message of messages) {
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
  }
  Object.keys(users).forEach((user) => {
    console.log(user, users[user].resources);
  });
  // console.log(users["c"].robbed);
};

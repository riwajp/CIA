let users = {};

const addUser = (name) => {
  users[name] = { resources: [], roads: 0, settlements: 0, cities: 0 };
};

const removeUserResource = (name, resource) => {
  if (users[name].resources.indexOf(resource) != -1) {
    users[name].resources.splice(users[name].resources.indexOf(resource), 1);
  }
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

const recieved = (message) => {
  const name = getName(message);

  //if users doesn't have that user, add it.
  if (!users[name]) addUser(name);

  //get list of all images from the div
  const images = Array.from(message.getElementsByTagName("img"));

  //remove first image as it's the user's image, the rest of it are resources' images
  images.shift();

  //for each of the resource image, get it' alt text which is the resource name
  for (resource_image of images) {
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
  if (building_name == "settlement") {
    users[name].settlements++;
    if (users[name].settlements.length > 2) {
      removeUserResource(name, "lumber");
      removeUserResource(name, "brick");
      removeUserResource(name, "wool");
      removeUserResource(name, "grain");
    }
  }
  if (building_name == "road") {
    users[name].roads++;
    if (users[name].settlements.length > 2) {
      removeUserResource(name, "lumber");
      removeUserResource(name, "brick");
    }
  }
  if (building_name == "city") {
    users[name].cities++;
    removeUserResource(name, "grain");
    removeUserResource(name, "grain");
    removeUserResource(name, "ore");
    removeUserResource(name, "ore");
    removeUserResource(name, "ore");
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
        removeUserResource(initiator, resource_name);
        users[acceptor].resources.push(resource_name);
      } else {
        removeUserResource(acceptor, resource_name);
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
  for (resource_image of images) {
    const resource_name = resource_image.alt;
    removeUserResource(name, resource_name);
  }
};

const stole = (message) => {
  const span = Array.from(message.getElementsByTagName("span"))[0];
  const span_child_nodes = Array.from(span.childNodes);
  const robber = span_child_nodes[0].innerText;
  const robbed = span_child_nodes[span_child_nodes.length - 1].innerText;
};

const main = () => {
  const logs = document.getElementById("game-log-text");
  const messages = logs.getElementsByClassName("message-post");

  for (message of messages) {
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
};
(() => {
  chrome.runtime.onMessage.addListener((params, sender, response) => {
    users = {};
    console.log(params.url);
    main();
  });
})();

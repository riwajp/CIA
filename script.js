import addTransactionDOMElement from "./utils.js";

addTransactionDOMElement("receive", {
  user: "a",
  resources: ["lumber", "brick"],
});
addTransactionDOMElement("receive", {
  user: "b",
  resources: ["wool", "wool", "lumber", "lumber"],
});
addTransactionDOMElement("receive", {
  user: "c",
  resources: ["wool", "wool", "lumber", "lumber"],
});

addTransactionDOMElement("steal", {
  robber: "a",
  resource: "wool",
  robbed: "c",
});

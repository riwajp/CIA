const addTransactionDOMElement = (type, payload, pid = "game-log-text") => {
  let element;
  element = document.createElement("div");
  element.className = "message-post";
  if (type == "receive") {
    element.innerHTML = ` 
    <img
      class=""
      id=""
      alt="Guest"
      src="/dist/images/icon_player.svg?rev=09141e4aab30f18a521c"
      width="20"
      height="20"
    /><span class="" id=""
      ><span class="semibold" style="word-break: break-all; color: #e27174"
        >${payload.user}</span
      >
      got 
      ${payload.resources.map(
        (resource) => `
        <img
          src="/dist/images/card_brick.svg?rev=4beb37891c6c77ebb485"
          alt="${resource}"
          height="20"
          width="14.25"
          class="lobby-chat-text-icon"
        />`
      )}
    </span>
  `;
  }

  if (type == "trade") {
    element.innerHTML = `
    <img
      class=""
      id=""
      alt="bot"
      src="/dist/images/icon_bot.svg?rev=3a9113a7cbb03cb69db7"
      width="20"
      height="20"
    /><span class="" id=""
      ><span class="semibold" style="word-break: break-all; color: #62b95d"
        >${payload.initiator}</span
      >
      traded
      ${payload.initiatorGives
        .map(
          (resource) => `<img
      src="/dist/images/card_brick.svg?rev=4beb37891c6c77ebb485"
      alt="${resource}"
      height="20"
      width="14.25"
      class="lobby-chat-text-icon"
    />`
        )
        .join("")}
     
      for
      ${payload.initiatorTakes
        .map(
          (resource) => `<img
      src="/dist/images/card_brick.svg?rev=4beb37891c6c77ebb485"
      alt="${resource}"
      height="20"
      width="14.25"
      class="lobby-chat-text-icon"
    />`
        )
        .join("")}
      with
      <span class="semibold" style="word-break: break-all; color: #e27174"
        >${payload.acceptor}</span
      ></span
    >
 `;
  }

  if (type == "place") {
    element.innerHTML = `<img
      class=""
      id=""
      alt="Guest"
      src="/dist/images/icon_player.svg?rev=09141e4aab30f18a521c"
      width="20"
      height="20"
    /><span class="" id=""
      ><span class="semibold" style="word-break: break-all; color: #e27174"
        >${payload.user}</span
      >
      placed a
      <img
        src="/dist/images/settlement_red.svg?rev=1c05d6b74c014af678b6"
        alt="${payload.building_name}"
        height="20"
        width="20"
        class="lobby-chat-text-icon"
    /></span>`;
  }

  if (type == "steal") {
    element.innerHTML = `<img
      class=""
      id=""
      alt="bot"
      src="/dist/images/icon_bot.svg?rev=3a9113a7cbb03cb69db7"
      width="20"
      height="20"
    /><span class="" id=""
      ><span class="semibold" style="word-break: break-all; color: #223697"
        >${payload.robber}</span
      >
      stole
      <img
        src="/dist/images/card_rescardback.svg?rev=e56f2b6ec37ef5bf6c33"
        alt="${payload.resource}"
        height="20"
        width="14.25"
        class="lobby-chat-text-icon"
      />
      from
      <span class="semibold" style="word-break: break-all; color: #62b95d"
        >${payload.robbed}</span
      ></span
    >`;
  }

  if (type == "you-steal") {
    element.innerHTML = `<img
      class=""
      id=""
      alt="Guest"
      src="/dist/images/icon_player.svg?rev=09141e4aab30f18a521c"
      width="20"
      height="20"
    /><span class="" id=""
      >You stole
      <img
        src="/dist/images/card_wool.svg?rev=9bd29423eae83fe9e6e4"
        alt="${payload.resource}"
        height="20"
        width="14.25"
        class="lobby-chat-text-icon"
      />
      from
      <span class="semibold" style="word-break: break-all; color: #e09742"
        >${payload.robbed}</span
      ></span
    >`;
  }

  if (type == "bank") {
    element.innerHTML = `<img
      class=""
      id=""
      alt="bot"
      src="/dist/images/icon_bot.svg?rev=3a9113a7cbb03cb69db7"
      width="20"
      height="20"
    /><span class="" id=""
      ><span class="semibold" style="word-break: break-all; color: #e09742"
        >${payload.user}</span
      >
      gave bank
      ${payload.give
        .map(
          (resource) =>
            `<img
          src="/dist/images/card_lumber.svg?rev=c3f06b26d0dc1df6e30b"
          alt="${resource}"
          height="20"
          width="14.25"
          class="lobby-chat-text-icon"
        />`
        )
        .join("")} and took
      <img
        src="/dist/images/card_ore.svg?rev=456f643916038b42d704"
        alt="${payload.take}"
        height="20"
        width="14.25"
        class="lobby-chat-text-icon"
      />
    </span>`;
  }
  document.getElementById(pid).appendChild(element);
};
export default addTransactionDOMElement;

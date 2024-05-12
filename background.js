chrome.tabs.onUpdated.addListener(async (tab_id, tabObj) => {
  let tab = await chrome.tabs.get(tab_id);
  if (
    tab.url &&
    (tab.url.includes("colonist.io/#") || tab.url.includes("localhost"))
  ) {
    chrome.tabs.sendMessage(tab_id, {
      url: tab.url,
    });
  }
});

// tab.url && tab.url.includes("colonist.io/")

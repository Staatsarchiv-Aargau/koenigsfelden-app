window.addEventListener("DOMContentLoaded", () => {
  let blocks = [];

 pbEvents.subscribe("pb-update", "transcription", (ev) => {
    blocks.push(ev.detail.root);
    console.log('blocks: %d', blocks.length);
    changeCursor();
  });
  
  
  // find popovers containing the id in their data-ref attribute and call the callback for each.
  function findPopovers(id, callback) {
    blocks.forEach((content) => {
      content.querySelectorAll("pb-popover[data-ref]").forEach((popover) => {
        // data-ref contains a space-separated list of refs
        // each may have a suffix, so we have to match against the start of the substring
        const re = new RegExp(`(^|\\s+)${id}`);
        if (re.test(popover.getAttribute("data-ref"))) {
          callback(popover);
        }
      });
    });
  }

  // wait until register content has been loaded, then prepare the highlight
    pbEvents.subscribe("pb-update", "register", (ev) => {
    ev.detail.root.querySelectorAll("li[data-ref]").forEach((li) => {
      const id = li.getAttribute('data-ref');
      const checkbox = li.querySelector("paper-checkbox");
      if (checkbox) {
        checkbox.addEventListener("change", () => {
          findPopovers(id, (ref) => {
            if (checkbox.checked) {
              ref.classList.add("highlight");
              const collapse = ref.closest("pb-collapse");
              if (collapse) {
                collapse.open();
              }
            } else {
              ref.classList.remove("highlight");
            }
          });
        });
      }
    });
      changeCursor();
  });  

  /**
   * Get the current status of the facsimile and hide viewer and display message if it fails
   */
  window.addEventListener("load", () => {
    const viewer = document.getElementById("facsimile");
    const messageContainer = document.getElementById("status");
    window.pbEvents.subscribe("pb-facsimile-status", null, (ev) => {
      console.log('facsimile status', ev.detail.status);
      if (ev.detail.status === "fail") {
           viewer.style.display = 'none';
           messageContainer.innerHTML = 'Faksimilebild nicht verfügbar.';
      }
    });
  });
});

function changeCursor() {
    document.querySelectorAll('pb-panel').forEach((panel) => {
        panel.shadowRoot.getElementById('menu').style.cursor = 'pointer';})
    };

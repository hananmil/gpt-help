import hljs, { HLJSPlugin } from "highlight.js";

export class MessageFormatter {
  constructor() {
    // hljs.initHighlightingOnLoad();
    // Register the plugin with highlight.js
    hljs.addPlugin(this.plugin());

    const observer = new MutationObserver(this.handleMutations);
    observer.observe(document.body, { childList: true, subtree: true });

    document.querySelectorAll("pre>code:not(.hljs)").forEach((block) => {
      hljs.highlightBlock(block.parentElement);
    });
  }

  public handleMutations(mutations: MutationRecord[]) {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (
          node.nodeName === "PRE" &&
          node.childNodes.length === 1 &&
          node.childNodes[0].nodeName === "CODE"
        ) {
          var element = node as HTMLElement;
          if (element.getAttribute("class")?.indexOf("hljs")) {
            console.log("already highlighted");
            return;
          }
          hljs.highlightBlock(element);
        }
      });
    });
  }

  // my-plugin.js
  plugin(): HLJSPlugin {
    return {
      // This function will be called by highlight.js when the plugin is loaded
      // and should return an object with a "highlightBlock" function
      // that modifies the generated HTML for each code block
      "after:highlightElement": function (event) {
        // Get the generated HTML for the code block

        if (event.el.textContent.trim().length === 0) {
          event.el.className = "";
          return;
        }

        // Create a new div element
        var div = document.createElement("section");
        div.className = "code-toolbar";
        var button = document.createElement("vscode-button");
        button.innerText = "Copy";
        // button.setAttribute("appearance", "primary")
        div.appendChild(button);

        var button = document.createElement("vscode-button");
        button.innerText = "Run";
        // button.setAttribute("appearance", "primary")
        div.appendChild(button);

        // Append the div element after the code block
        event.el.insertAdjacentElement("afterend", div);
      },
    };
  }
}

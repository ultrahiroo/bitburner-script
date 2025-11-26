/** @param {NS} ns */
export async function main(ns) {
  function addCSS() {
    const doc = eval("document");  // NetScript 'document' replacement object.
    const customStyleName = "aDifferentID";
    const customStyleVersion = "002";
    let customStyles = doc.getElementById(customStyleName);  // To avoid styling conflicts, please use a different ID if you copy this code.
    if (!customStyles || customStyles.getAttribute("version") < customStyleVersion) {  // If it doesn't already exist...
      if (!customStyles) {  // Create a new <style> element.
        customStyles = doc.createElement('style');
      } else {  // Clear out the existing <style> element.
        while (customStyles.firstChild) {
          customStyles.removeChild(customStyles.firstChild);
        }
      }
      customStyles.appendChild(doc.createTextNode(
        '.rLink {\n'
        + '    text-decoration: underline;\n'
        + '    cursor: pointer;\n'
        + '}\n'
        + '.rLink:hover {\n'
        + '    filter: brightness(1.5);\n'
        + '}\n'
      ));
      customStyles.id = customStyleName;
      customStyles.type = "text/css";
      customStyles.setAttribute("version", customStyleVersion);
      doc.getElementsByTagName("head")[0].appendChild(customStyles);  // Append the new CSS styling to the document.
    }
  }
  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }
  async function runTerminalCommand(command) {  // deepscan-ignore-line
    var terminalInput = eval("document").getElementById("terminal-input"), terminalEventHandlerKey = Object.keys(terminalInput)[1];
    terminalInput.value = command;
    terminalInput[terminalEventHandlerKey].onChange({ target: terminalInput });
    setTimeout(function (event) {
      terminalInput.focus();
      terminalInput[terminalEventHandlerKey].onKeyDown({ key: 'Enter', preventDefault: () => 0 });
    }, 0);
  };

  const defaultStyle = {};

  function rLinkCL(text, command, style = defaultStyle, altText = "") {
    var linkStyle = clone(defaultStyle);
    linkStyle = Object.assign(linkStyle, style);  // Merge the style parameter's values into the default styling.
    if (altText == "") {
      return React.createElement("a", {
        style: linkStyle, className: "rLink",
        onClick: function (event) { runTerminalCommand(command); }
      }, text);
    } else {
      return React.createElement("a", {
        style: linkStyle, className: "rLink", title: altText,
        onClick: function (event) { runTerminalCommand(command); }
      }, text);
    }
  }
  function rText(text, style = defaultStyle, id = "") {
    var linkStyle = clone(defaultStyle);
    if (style != undefined) {
      linkStyle = Object.assign(linkStyle, style);  // Merge the style parameter's values into the default styling.
    }
    if (id == "" || id == undefined) {
      return React.createElement("span", { style: linkStyle }, text);
    } else {
      return React.createElement("span", { style: linkStyle, id: id }, text);
    }
  }
  function rBreak() {
    return React.createElement("br", {}, undefined);
  }

  function goTo(target) {
    let path = [target]
    while (path[0] !== "home") path.unshift(ns.scan(path[0])[0])
    return [path.join(";connect "), path.length - 2]
  }
  function addReactBlock(target, goto, symb, spacer) {
    let root = ""
    if (ns.hasRootAccess(target)) root = "YES"
    else root = "NO"
    if (target == "n00dles") spacer = "  ┃" + spacer.substring(5)
    return [rText([symb, [rLinkCL(target, goto, defaultStyle, goto)]], { color: "light green" }), rBreak(),
    rText([spacer, "   Root Access: ", root, ", Required hacking skill: ", ns.getServerRequiredHackingLevel(target)], { color: "light green" }), rBreak(),
    rText([spacer, "   Number of open ports required to NUKE: ", ns.getServerNumPortsRequired(target)], { color: "light green" }), rBreak(),
    rText([spacer, "   RAM: ", ns.formatRam(ns.getServerMaxRam(target))], { color: "light green" }), rBreak()]
  }
  addCSS();
  let depth = 0
  if (ns.args.length > 0) {
    depth = ns.args[0]
  }
  let list = ["home"]
  let output = []
  let tempa = ns.scan(list[0])
  let spacer = "  ┃"
  let symb = "┗ "
  output.push(addReactBlock("home", "home", symb, spacer))

  if (depth > 0) spacer += "  "
  for (let i = 0; i < tempa.length; i++) {
    if (!tempa[i].includes("server")) {
      let goto = goTo(tempa[i])[0]
      list.push(tempa[i])
      if (ns.scan(tempa[i]).length > 1 && depth > 1) {
        spacer += " ┃"
      }
      symb = "  ┣ "
      if (tempa[i] == "darkweb") {
        symb = "  ┗ "
        spacer = "      "
      }
      output.push(addReactBlock(tempa[i], goto, symb, spacer))
      spacer = "  ┃"
    }
  }
  for (let i = 0; i < list.length; i++) {
    let temp = ns.scan(list[i])
    for (let j = 0; j < temp.length; j++) {
      if (!list.includes(temp[j]) && !temp[j].includes("hacknet")) {
        let goto = goTo(temp[j])[0]
        if (goTo(temp[j])[1] < depth) {
          let tempscan = ns.scan(temp[j])
          let parent = tempscan[0]
          list.splice(list.indexOf(parent) + ns.scan(parent).indexOf(temp[j]), 0, temp[j])
          spacer = "";
          symb = "";
          for (let k = 0; k < output[list.indexOf(parent)][6].props.children[0].length; k++) {
            if (output[list.indexOf(parent)][6].props.children[0][k] == "┃") {
              if (k == output[list.indexOf(parent)][6].props.children[0].lastIndexOf("┃")) {
                if (temp[j] == ns.scan(parent)[ns.scan(parent).length - 1]) {
                  symb += "┗ "
                  spacer += " "
                }
                else {
                  symb += "┣ "
                  spacer += "┃"
                }
              }
              else {
                symb += "┃"
                spacer += "┃"
              }
            }
            else {
              spacer += " "
              symb += " "
            }
          }
          if (tempscan.length > 1 && goTo(temp[j])[1] < (depth - 1)) {
            spacer += " ┃"
          }
          output.splice(list.indexOf(parent) + ns.scan(parent).indexOf(temp[j]), 0,
            addReactBlock(temp[j], goto, symb, spacer)
          )

        }
      }
    }
  }
  ns.tprintRaw(output)
}
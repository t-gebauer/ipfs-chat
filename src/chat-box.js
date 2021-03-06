"use strict"

import EventEmitter from "events"

/* Dynamically creates a ChatBox with a textarea and an text input field. */
class ChatBox extends EventEmitter {

  constructor(rootNodeId) {
    super()
    let rootNode = document.getElementById(rootNodeId)
    if (!rootNode) { throw new Error("ChatBox: can't find element by id '" + rootNodeId + "'.") }

    // create elements
    let chat_list_div = document.createElement("div")
    chat_list_div.className = "chat_box_div"
    rootNode.appendChild(chat_list_div)
    this.chat_list_div = chat_list_div

    let chat_list = document.createElement("ul")
    chat_list.className = "chat_box_list"
    chat_list_div.appendChild(chat_list)
    this.chat_list = chat_list

    let chat_input = document.createElement("input")
    chat_input.className = "chat_box_input"
    rootNode.appendChild(chat_input)
    chat_input.select()

    chat_input.addEventListener("keydown", (e) => {
      if (!e) { var e = window.event }
      if (e.keyCode == 13 && chat_input.value != "") {
        this.emit("input", chat_input.value)
        chat_input.value = ""
      }
    })
  }

  addMessage(msg) {
    if (msg.type === undefined) { msg.type = "chat" }
    let li = document.createElement("li")
    li.appendChild(document.createTextNode((msg.name ? msg.name + ": " : "") + msg.data))
    li.className = msg.type
    this.chat_list.appendChild(li)
    this.chat_list_div.scrollTop = this.chat_list_div.scrollHeight
  }

  addSystemMessage(msg) {
    this.addMessage({type: "system", data: msg})
  }

  clear() {
    let ul = this.chat_list
    while (ul.firstChild) {
      ul.removeChild(ul.firstChild);
    }
  }
}

export default ChatBox

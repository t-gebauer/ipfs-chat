console.log("Running script 'app.js'.")

import IPFS from "ipfs"
import Room from "ipfs-pubsub-room"

const ipfs = new IPFS({
	repo: repo(),
	EXPERIMENTAL: {
		pubsub: true
	}
})

function repo() {
  // random repo path -> multiple ipfs nodes in the same browser
	return "ipfs/ipfs-chat/" + Math.random()
}

var id = undefined

ipfs.once("ready", () => ipfs.id((err, info) => {
	if (err) { throw err }
  id = info.id
	addChatMessage({type: "system", data: "IPFS node ready with address " + info.id})
}))

ipfs.on("error", (err) => addChatMessage({type: "error", data: "Error: " + err}))

const room = Room(ipfs, "ipfs-chat-room")

room.on("peer joined", (peer) => addChatMessage({type: "system", data: "Peer " + formatName(peer) + " joined."}))
room.on("peer left", (peer) => addChatMessage({type: "system", data: "Peer " + formatName(peer) + " left."})) 
room.on("message", (message) => addChatMessage({type: "chat", name: message.from, data: message.data}))

// Chat

let chat_input = document.getElementById("chat_input")
let chat_list = document.getElementById("chat_list")

chat_input.addEventListener("keydown", (e) => {
  if (!e) { var e = window.event }

  if (e.keyCode == 13 && chat_input.value != "") {
    room.broadcast(chat_input.value)
    chat_input.value = ""
  }
})

var knownIds = []
function formatName(name) {
  if (!name) { return "" }
  var index = knownIds.indexOf(name)
  if (index == -1) { index = knownIds.push(name) - 1 }
  if (name == id) { index = "me" }
  return index + "-[" + name.slice(-8) + "]"
}

function addChatMessage(msg) {
  if (msg.type === undefined) { msg.type = "chat" }
  var li = document.createElement("li")
  li.appendChild(document.createTextNode((msg.name ? formatName(msg.name) + ": " : "") + msg.data))
  li.className = msg.type
  chat_list.appendChild(li)
  chat_list.parentElement.scrollTop = chat_list.parentElement.scrollHeight
}

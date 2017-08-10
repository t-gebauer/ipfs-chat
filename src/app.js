"use strict"

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

ipfs.once("ready", () => ipfs.id((err, info) => {
  if (err) { throw err }
  myId = info.id
  peerInfo[info.id] = {
    id: info.id,
    number: 0,
    name: myName ? myName : info.id.slice(-6)
  }
  chat.addMessage({type: "system", data: "IPFS node ready with address " + info.id})
}))

ipfs.on("error", (err) => chat.addMessage({type: "error", data: "Error: " + err}))

const room = Room(ipfs, "ipfs-chat-room")

room.on("peer joined", (peer) => {
  if (myName) {
    room.sendTo(peer, JSON.stringify({name: myName}))
  }
  chat.addMessage({type: "system", data: "Peer " + formatName(peer) + " joined."})
})

room.on("peer left", (peer) =>
  chat.addMessage({type: "system", data: "Peer " + formatName(peer) + " left."}))

room.on("message", (message) => {
  try {
    // interpret data as JSON
    let data = JSON.parse(message.data)
    if (data.msg) {
      chat.addMessage({type: "chat", name: formatName(message.from), data: data.msg})
    } else if (data.priv) {
      lastPrivateFrom = message.from
      chat.addMessage({type: "chat", name: "From " + formatName(message.from), data: data.priv})
    } else if (data.name) {
      let info = getInfo(message.from)
      chat.addMessage({
        type: "system",
        name: formatName(info.id),
        data: "is now known as [" + data.name + "]."
      })
      info.name = data.name
    }
  } catch(err) {
    if (err.name == "SyntaxError") {
      // JSON.parse() failed
      console.log("Error: not JSON: " + message.data)
    } else {
      throw err
    }
  }
})

var lastPrivateFrom = undefined
var myId = undefined
var myName = undefined
var counter = 0
var peerInfo = {}

/* Get info to a given peer id. Always returns an object. */
function getInfo(id) {
  var info = peerInfo[id]
  if (!info) {
    info = peerInfo[id] = {
      id: id,
      number: ++counter,
      name: id.slice(-6)
    }
  }
  return info
}

function formatName(id) {
  if (!id) { return "" }
  let info = getInfo(id)
  return "[" + info.number + (info.name ? ":" + info.name : "") + "]"
}

/* Try to find a peer identified by a given string. Either by name, number, or id. */
function findInfo(string) {
  var result = undefined
  Object.keys(peerInfo).forEach((id) => {
    let peer = peerInfo[id]
    if (string == peer.number || string == peer.id) {
      result = peer
      return // break forEach
    } else if (peer.name.toUpperCase().startsWith(string.toUpperCase())) {
      result = peer
    }
  })
  return result
}

/* Send a private message if the peer is in the room. */
function trySendTo(id, message) {
  if (room.hasPeer(id)) {
    chat.addMessage({type: "chat", name: "To " + formatName(id), data: message})
    room.sendTo(id, JSON.stringify({priv: message}))
  } else {
    chat.addSystemMessage("Peer is not available.")
  }
}

/* Inititalize ChatBox and CommandParser */

import ChatBox from "./chat-box.js"
import CommandParser from "./command-parser.js"

const chat = new ChatBox("chat_box")
const parser = new CommandParser((feedback) => chat.addSystemMessage(feedback))

chat.on("input", (message) => {
  if (!parser.parse(message)) {
    room.broadcast(JSON.stringify({msg: message}))
  }
})

parser.addHelpCommand()
parser.addCommand("whoami", "Display your own id and name.", () => {
  if (myId) {
    let info = getInfo(myId)
    chat.addSystemMessage("I am " + info.id + ", known as " + info.name + ".")
  } else {
    // ipfs not started
    chat.addSystemMessage("I am " + myName + ".")
  }
})
parser.addCommand("peers", "List all known peers.", () => {
  room.getPeers()
    .map(id => getInfo(id))
    .sort((a, b) => { return a.number - b.number })
    .forEach((peer) => {
      chat.addSystemMessage(formatName(peer.id) + " " + peer.id)
    })
})
parser.addCommand("name", "Change your name.", (_, ...rest) => {
  let name = rest.join(" ")
  myName = name
  if (myId) {
    if (!name) { name = myId.slice(-6) }
    room.broadcast(JSON.stringify({name: name}))
  }
})
parser.addCommand("w", "Whisper to a selected peer.", (_, target, ...rest) => {
  let peer = findInfo(target)
  if (!peer) {
    chat.addSystemMessage("Unknown peer: " + target)
    return
  }
  trySendTo(peer.id, rest.join(" "))
})
parser.addCommand("r", "Reply to last private message.", (_, ...rest) => {
  trySendTo(lastPrivateFrom, rest.join(" "))
})

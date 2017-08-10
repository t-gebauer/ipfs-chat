"use strict"

class CommandParser {

  constructor(feedbackCallback, commandToken = "/") {
    this.feedback = feedbackCallback
    this.commandToken = commandToken
    this.commands = {}
  }

  addHelpCommand() {
    this.addCommand("help", "Display this help message.", () => {
      this.feedback("Available commands:\n")
      Object.keys(this.commands).sort().forEach((k, i) => {
        let command = this.commands[k]
        this.feedback(this.commandToken + command.name + "\t" + command.description)
      })
    })
  }

  parse(message) {
    if (!message.startsWith(this.commandToken)) { return false }
    let args = message.slice(1).split(" ")
    let name = args[0]
    let command = this.commands[name]
    if (command) {
      command.fun.apply(this, args)
    } else {
      this.feedback("Unknown command '" + name + "'. Try " + this.commandToken + "help.")
    }
    return true
  }

  addCommand(name, description, callback) {
    this.commands[name] = {
      name: name,
      fun: callback,
      description: description
    }
  }
}

export default CommandParser

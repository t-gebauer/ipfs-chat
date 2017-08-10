class CommandParser {

  constructor(feedbackFun) {
    this.feedbackFun = feedbackFun
    this.commands = {}
    this.commandToken = "/"
    this.addCommand("help", "Display this help message.", () => {
      this.feedbackFun("Available commands:\n")
      Object.keys(this.commands).sort().forEach((k, i) => {
        let command = this.commands[k]
        this.feedbackFun(this.commandToken + command.name + "\t" + command.description)
      })
    })
  }

  parseMessage(message) {
    if (message.startsWith(this.commandToken)) {
      let args = message.slice(1).split(" ")
      let name = args[0]
      let command = this.commands[name]
      if (command) {
        command.fun.apply(this, args)
      } else {
        this.feedbackFun("Unknown command '" + name + "'. Try " + this.commandToken + "help.")
      }
    } else {
      if (!this.messageListener) { throw new Error("CommandParser: no messageListener set!") }
      this.messageListener(message)
    }
  }

  addCommand(name, description, callback) {
    this.commands[name] = {
      name: name,
      fun: callback,
      description: description
    }
  }

  setCommandToken(token) {
    this.commandToken = token
  }

  setMessageListener(listener) {
    this.messageListener = listener
  }
}

export default CommandParser

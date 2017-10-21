import irc from 'irc'
import EventSource from 'eventsource'

let config = {
	channels: ["#openclonk", ],
	server: "irc.hes.de.euirc.net",
	botName: "NativeBot"
}

let bot = new irc.Client(config.server, config.botName, {
	channels: config.channels
})

bot.addListener('error', function(message) {
    console.log('error: ', message);
});

let evtSource = new EventSource('http://league.openclonk.org/poll_game_events.php')

function handleCreate(e) {
  console.log({handleCreate: e.data})
  if (e.data) {
    let data = JSON.parse(e.data)
    if (data.flags.joinAllowed && !data.flags.passwordNeeded) {
      bot.say(config.channels[0], `${data.host} just opened a round of ${data.title}. Join now!`)
    }
  }
}

evtSource.addEventListener('create', handleCreate)

console.log('Startup complete')

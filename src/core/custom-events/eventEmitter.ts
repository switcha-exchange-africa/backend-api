import * as  events from "events"

events.EventEmitter.defaultMaxListeners = 800;

class EventClass extends events.EventEmitter { }
// create instance
const event = new EventClass()

const allEvents = () => {
  console.log("@listening to all events")
}



export { event, allEvents }
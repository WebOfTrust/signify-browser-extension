export const pubsub = (() => {
  const events = {};

  let subscribersId = -1;

  function publish(event, data) {
    if (!events[event]) {
      return false;
    }

    const subscribers = events[event];
    subscribers.forEach((subscriber) => {
      subscriber.func(event, data);
    });
    return true;
  }

  function subscribe(event, func) {
    if (!events[event]) {
      events[event] = [];
    }

    subscribersId += 1;
    const token = subscribersId.toString();
    events[event].push({
      token,
      func,
    });
    return token;
  }

  function unsubscribe(token) {
    const found = Object.keys(events).some((event) =>
      events[event].some((subscriber, index) => {
        const areEqual = subscriber.token === token.toString();
        if (areEqual) {
          events[event].splice(index, 1);
        }
        return areEqual;
      })
    );

    return found ? token : null;
  }

  return {
    publish,
    subscribe,
    unsubscribe,
  };
})();

import Pusher from "pusher-js";

let pusher: Pusher | null = null;

export const getPusher = () => {
  if (!pusher) {
    pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });
  }

  return pusher;
};

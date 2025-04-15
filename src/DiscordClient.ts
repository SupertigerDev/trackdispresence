import { Client, Events, GatewayIntentBits, Presence } from "discord.js";
import {
  GatewayDispatchPayload,
  GatewayDispatchEvents,
} from "discord-api-types/v9";

interface FormattedPresence {
  status: string;
  activities: FormattedActivity[];
}
interface FormattedActivity {
  name: string;
  createdTimestamp: number | null;
  details: string | null;
  state: string | null;
  syncId: string | null;
  url?: string | null;
  type: number
  assets?: {
    largeText?: string | null;
    smallText?: string | null;
    largeImage?: string | null;
    smallImage?: string | null;
  };
  timestamps?: {
    start: Date | null;
    end: Date | null;
  } | null;
}

const cleanEmpty = <T extends Record<string, any>>(obj: T) =>
  Object.entries(obj)
    .map(([k, v]) => [k, v && typeof v === "object" ? cleanEmpty(v) : v])
    .reduce((a, [k, v]) => (v == null ? a : ((a[k] = v), a)), {});

export const createDiscordClient = (token: string, guildId: string) => {
  const events = {
    presenceUpdate: (userId: string, presence: FormattedPresence) => {},
    ready: () => {},
  };

  const formatPresence = (presence?: any) => {
    if (!presence) return;
    if (typeof presence !== "object") return;
    return cleanEmpty({
      status: presence.status,
      activities: presence.activities.map(
        (a) =>
          ({
            name: a.name,
            timestamps: a.timestamps,
            url: a.url,
            details: a.details,
            syncId: a.syncId,
            type: a.type,
            state: a.state,
            assets: a.assets,
            createdTimestamp: a.createdTimestamp,
          } as FormattedActivity)
      ),
    }) as FormattedPresence;
  };

  const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildPresences],
  });

  client.once(Events.ClientReady, (readyClient) => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);
    events.ready();
  });

  client.on(Events.Raw, (data) => {
    const payload = data as GatewayDispatchPayload;
    if (payload.t === GatewayDispatchEvents.PresenceUpdate) {
      process.nextTick(() => {
        events.presenceUpdate(
          payload.d.user.id,
          getUserPresence(payload.d.user.id) as FormattedPresence
        );
      });
    }
  });

  client.login(token);

  const getUserPresence = (userId: string) => {
    const member = client.guilds.cache.get(guildId)?.members.cache.get(userId);
    if (!member) return "MEMBER_NOT_IN_GUILD";
    return formatPresence(
      member?.presence?.toJSON() || { status: "offline", activities: [] }
    );
  };

  return {
    events,
    getUserPresence,
  };
};

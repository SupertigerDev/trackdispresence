import { Client, Events, GatewayIntentBits, Presence } from "discord.js";
import {
  GatewayDispatchPayload,
  GatewayDispatchEvents,
} from "discord-api-types/v9";
import { getDetectable } from "./database";

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
    largeImageUrl?: string | null;
    smallImageUrl?: string | null;
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



export const createDiscordClient = (token: string, guildId: string) => {
  const events = {
    presenceUpdate: (userId: string, presence: FormattedPresence) => { },
    ready: () => { },
  };

  const formatPresence = (rawPresence: any, presence: Presence | undefined) => {
    if (!rawPresence) return;
    if (typeof rawPresence !== "object") return;
    return {
      status: rawPresence.status,
      activities: rawPresence.activities.map(
        (a, i) => {
          
          const activity = {
            name: a.name,
            timestamps: a.timestamps,
            url: a.url,
            details: a.details,
            syncId: a.syncId,
            type: a.type,
            state: a.state,
            assets: {
              ...a.assets,
              largeImageUrl: presence?.activities[i]?.assets?.largeImageURL(),
              smallImageUrl: presence?.activities[i]?.assets?.smallImageURL(),
            },
            createdTimestamp: a.createdTimestamp,
          } as FormattedActivity

          if (!activity.assets?.largeImage && !activity.assets?.smallImage) {
            const detectable = getDetectable(activity.name);
            if (detectable) {
              activity.assets = {
                largeImageUrl: `https://cdn.discordapp.com/app-icons/${detectable.id}/${detectable.icon}.png?size=240`,
              };
            }
          }

          return activity
        }
      ),
    } as FormattedPresence;
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
      member?.presence?.toJSON() || { status: "offline", activities: [] },
      member?.presence
    );
  };

  return {
    events,
    getUserPresence,
  };
};

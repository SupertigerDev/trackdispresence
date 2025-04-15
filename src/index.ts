import { Elysia } from "elysia";
import { DISCORD_TOKEN, GUILD_ID, PORT } from "./env";
import { createDiscordClient } from "./DiscordClient";
import { rateLimit } from "elysia-rate-limit";

const app = new Elysia().use(
  rateLimit({
    errorResponse: new Response(
      JSON.stringify({
        error: "Rate limit exceeded",
        code: "RATE_LIMIT_EXCEEDED",
      }),
      { status: 429, headers: { "Content-Type": "application/json" } }
    ),
  })
);

const discordClient = createDiscordClient(DISCORD_TOKEN!, GUILD_ID!);

discordClient.events.presenceUpdate = (userId, data) => {
  app.server?.publish(userId, JSON.stringify(data));
};

const MemberNotInGuildErrorMessage =
  "This member is not in the Discord RPC Tracker guild. Join https://discord.gg/ggrd2wr4pe and try again.";

app.ws("/trackdispresence/:userId", {
  open: (ws) => {
    const userId = ws.data.params.userId;
    const presence = discordClient.getUserPresence(userId);
    if (presence === "MEMBER_NOT_IN_GUILD") {
      ws.send({ error: MemberNotInGuildErrorMessage, code: presence });
      ws.close();
    }
    ws.subscribe(userId);

    ws.send(presence);
  },
});

app.get("/trackdispresence/:userId", async ({ params, set }) => {
  const userId = params.userId;

  const presence = discordClient.getUserPresence(userId);
  if (presence === "MEMBER_NOT_IN_GUILD") {
    set.status = 404;
    return {
      error: MemberNotInGuildErrorMessage,
    };
  }

  return presence;
});

discordClient.events.ready = () => {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
};

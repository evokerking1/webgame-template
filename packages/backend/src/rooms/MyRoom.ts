import { Room, Client, ClientArray } from "@colyseus/core";
import { Schema, MapSchema, type } from "@colyseus/schema";
import { JWT } from "@colyseus/auth";
import { User, MonthlyScore } from "../config/database";

export class Player extends Schema {
  @type("string") name: string;
  @type("number") score: number = 0;
}

export class MyRoomState extends Schema {
  @type("number") highestScore: number = 0;
  @type({ map: Player }) players = new MapSchema<Player>();
}

export class MyRoom extends Room<MyRoomState> {

  static async onAuth(token: string) {
    return (token) ? await JWT.verify(token) : { guest: true };
  }

  onCreate (options: any) {
    this.setState(new MyRoomState());

    this.onMessage("increment", (client, payload) => {
      const player = this.state.players.get(client.sessionId);
      player.score++;

      // update highest score of this session
      if (this.state.highestScore < player.score) {
        this.state.highestScore = player.score;
      }
    });
  }

  onJoin (client: Client, options: any) {
    console.log(client.sessionId, "joined!");

    const player = new Player();

    if (client.auth.guest) {
      player.name = "Guest";

    } else if (!client.auth.anonymous) {
      player.name = client.auth.name;

    } else {
      player.name = "Anonymous";
    }

    this.state.players.set(client.sessionId, player);
  }

  async onLeave (client: Client<any, User>, consented: boolean) {
    console.log(client.sessionId, "left!");
    const player = this.state.players.get(client.sessionId);

    if (client.auth.id) {
      console.log("Saving score for user:", client.auth.id, { name: player.name, score: player.score, });
      await MonthlyScore.upsert({ user_id: client.auth.id }, {
        name: player.name,
        score: player.score,
      });
    }

    this.state.players.delete(client.sessionId);
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }

}
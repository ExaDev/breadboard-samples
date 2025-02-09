/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { ClaudeKit } from "@exadev/breadboard-kits/src";
import { Board, Schema, asRuntimeKit } from "@google-labs/breadboard";
import Core from "@google-labs/core-kit";
import Critic from "./critic.ts";
import TemplateKit from "@google-labs/template-kit";

export type CriticResponse = {
  id: string,
  name: string;
  response: string;
};

export class Panel {
  #board: Board;
  #coreKit: Core;
  #critics: Record<string, { id: string, name: string, persona: string }> = {};
  #inputText;

  get board() {
    return this.#board;
  }

  constructor() {
    this.#board = new Board({
      title: "The Panel",
      description: "A Panel of Critics",
      version: "0.0.1",
    });

    this.#coreKit = this.#board.addKit(Core);
    this.#inputText = this.#board.input({
      $id: "input-text",
      schema: {
        type: "object",
        properties: {
          article: {
            type: "string",
            title: "articleToCritique",
            description: "The article that is being critiqued",
          }
        }
      } satisfies Schema
    });
  }

  addCritic(name: string, persona: string) {
    // Set up the board.
    const id = Object.keys(this.#critics).length + 1;
	const idStr = `critic${id}`;
    const panelOutput = this.#board.output();

    const input = this.#board.input({
      $id: `${idStr}-input`,
      schema: {
        type: "object",
        properties: {
          name: {
            type: "string",
            title: "Critic Name",
            description: "The name of the Critic"
          },
          id: {
            type: "string",
            title: "id",
            description: "The id of the critique being created",
          },
          persona: {
            type: "string",
            title: "Critic Persona",
            description: "The Persona of the Critic",
          }
        }
      } satisfies Schema
    });
    const lambda = this.#board.lambda(Critic, { $id: `${idStr}-lambda`, name, persona}).wire("article<-article", this.#inputText);
    const invoke = this.#coreKit.invoke({ board: lambda });
	invoke.wire("id<-id", input);
    invoke.wire("persona<-persona", input);
    invoke.wire("name<-name", input);
    invoke.wire("*->", panelOutput);

    // Store the critic state.
    this.#critics[`${idStr}-input`] = { id: idStr, name, persona };

	return {id: `${idStr}`, name, persona};
  }

  async *critique(text: string): AsyncGenerator<CriticResponse> {
    const kits = [asRuntimeKit(Core), asRuntimeKit(TemplateKit), asRuntimeKit(ClaudeKit)]
    for await (const stop of this.#board.run({
      kits,
      // probe: new LogProbe()
    })) {
      if (stop.type === "input") {
        stop.inputs = { article: text, ...this.#critics[stop.node.id] };
      } else if (stop.type === "output") {
        yield stop.outputs as CriticResponse;
      }
    }
  }
}

// testing so we can preview the board.
const p = new Panel()
p.addCritic("Paul", "The Critic");
p.addCritic("Paul 2", "The Critic");

export default p.board;

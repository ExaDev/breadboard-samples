#!/usr/bin/env npx -y tsx

import generateAndWriteCombinedMarkdown from "@exadev/breadboard-kits/src/util/files/generateAndWriteCombinedMarkdown.js";
import { Board, Schema } from "@google-labs/breadboard";
import fs from "fs";
import * as url from "url";
import MyCustomKit from "./custom-kit-node-values-and-handlers.js";

const board = new Board({
	title: "Custom Kit Node Values and Handlers Demo",
});

const myCustomKit = board.addKit(MyCustomKit);

const echo = myCustomKit.echo();
const concat = myCustomKit.concat();
const split = myCustomKit.split();

const inputSchema = {
	type: "object",
	properties: {
		inputPartOne: {
			type: "string"
		},
		inputPartTwo: {
			type: "string"
		},
		inputPartThree: {
			type: "string"
		},
	},
  } satisfies Schema;

const input = board.input({
	$id: "inputNode", schema: inputSchema
});

input.wire("inputPartOne", echo);
echo.wire(
	"inputPartOne->echoedInput",
	board.output({
		$id: "echoOutput",
	})
);

input.wire("inputPartOne->a", concat).wire("inputPartTwo->b", concat);
concat.wire(
	"value->concatenatedInput",
	board.output({
		$id: "concatOutput",
	})
);

input.wire("inputPartThree->input", split);
split.wire(
	"value->splitInput",
	board.output({
		$id: "splitOutput",
	})
);

(async () => {
	for await (const run of board.run()) {
		if (run.type === "input") {
			run.inputs = {
				inputPartOne: "Hello",
				inputPartTwo: "World!",
				inputPartThree: "Welcome,to,Breadboard!",
			};
		} else if (run.type === "output") {
			console.log(run.node.id, run.outputs);
		}
	}
})();

generateAndWriteCombinedMarkdown({
	board,
	filename: "README",
	dir: url.fileURLToPath(new URL(".", import.meta.url)),
});


fs.writeFileSync(
	url.fileURLToPath(new URL("board.json", import.meta.url)),
	JSON.stringify(board, null, "\t")
);

import generateAndWriteCombinedMarkdown from "@exadev/breadboard-kits/src/util/files/generateAndWriteCombinedMarkdown.js";
import { Board, Schema } from "@google-labs/breadboard";
import fs from "fs";
import * as url from "url";

const board = new Board({
	title: "Multiple Inputs One Output",
});

const output = board.output();

const inputOneSchema = {
	type: "object",
	properties: {
		partOne: {
			type: "string"
		}
	},
  } satisfies Schema;

const inputTwoSchema = {
	type: "object",
	properties: {
		partTwo: {
			type: "string"
		}
	},
  } satisfies Schema;

const inputOne = board.input({
	$id: "inputOne", schema: inputOneSchema
});
inputOne.wire("partOne", output);

const inputTwo = board.input({
	$id: "inputTwo", schema: inputTwoSchema
});
inputTwo.wire("partTwo", output);

(async () => {
	for await (const run of board.run()) {
		if (run.type === "input") {
			if (run.node.id === "inputOne") {
				run.inputs = {
					partOne: `Hello Input One`,
				};
			} else if (run.node.id === "inputTwo") {
				run.inputs = {
					partTwo: `Hello Input Two`,
				};
			}
		} else if (run.type === "output") {
			console.log(JSON.stringify(run.outputs, null, 2));
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

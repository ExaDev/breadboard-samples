#!/usr/bin/env npx -y tsx
import { LogProbe } from "@google-labs/breadboard";
import board from "~/breadboard/index.ts";

(async () => {
	for await (const runResult of board.run({
		probe: new LogProbe()
	})) {
		if (!process.env.CLAUDE_API_KEY) {
			throw new Error("Missing CLAUDE_API_KEY");
		}

		if (runResult.type === "input") {
			runResult.inputs = {
				"query": "Post Office",
				"claudeApiKey": process.env.CLAUDE_API_KEY
			};
		} else if (runResult.type === "output") {
			console.log(runResult.node.id, runResult.outputs);
		}
	}
})();
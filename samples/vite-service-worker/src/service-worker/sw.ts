/// <reference lib="webworker" />
declare const self: ServiceWorkerGlobalScope;

import { Board, RunResult, Schema } from "@google-labs/breadboard";
import { ControllableAsyncGeneratorRunner } from "../ControllableAsyncGeneratorRunner";
import { BroadcastChannelMember } from "../lib/BroadcastChannelMember";
import { BroadcastMessage } from "../lib/BroadcastMessage";
import { SW_BROADCAST_CHANNEL } from "../lib/constants";
import { precacheAndRoute } from "workbox-precaching";

precacheAndRoute(self.__WB_MANIFEST || []);

let boardRunner: ControllableAsyncGeneratorRunner<
	RunResult,
	unknown,
	unknown,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	any
>;

self.addEventListener("install", () => {
	console.log("ServiceWorker", "install");

	boardRunner = new ControllableAsyncGeneratorRunner(
		(): AsyncGenerator<RunResult, unknown, unknown> => board.run(),
		handler
	);

	return self.skipWaiting();
});

self.addEventListener("activate", () => {
	console.log("ServiceWorker", "activate");
	return self.clients.claim();
});

const schema = {
	type: "object",
	additionalProperties: true
} satisfies Schema;

const board = new Board();
for (let i = 0; i < 3; i++) {
	board
		.input({ $id: `input_${i}`, schema: schema })
		.wire("*", board.output({ $id: `output_${i}` }));
}

const channel = new BroadcastChannel(SW_BROADCAST_CHANNEL);
channel.onmessage = (event): void => handleCommand(event.data);
self.addEventListener("message", (event): void => handleCommand(event.data));

function handleCommand(data: { command: string }) {
	console.log("ServiceWorker", "message", data);
	switch (data.command) {
		case "start":
			boardRunner.start();
			break;
		case "pause":
			boardRunner.pause();
			break;
		case "stop":
			boardRunner.stop();
			break;
	}
}

async function handler(runResult: RunResult): Promise<void> {
	console.log("=".repeat(80));
	if (runResult.type === "input") {
		const input = {
			node: runResult.node.id
		};
		console.log(runResult.node.id, "input", input);
		runResult.inputs = input;
	} else if (runResult.type === "output") {
		console.log(runResult.node.id, "output", runResult.outputs);
		const message: BroadcastMessage = {
			id: new Date().getTime().toString(),
			type: "output",
			source: BroadcastChannelMember.ServiceWorker,
			target: BroadcastChannelMember.Client,
			content: runResult.outputs,
		};
		channel.postMessage(message);
	}
	await new Promise((resolve): NodeJS.Timeout => setTimeout(resolve, 1000));
}

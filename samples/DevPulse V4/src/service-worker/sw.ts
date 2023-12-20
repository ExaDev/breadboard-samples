/// <reference lib="webworker" />
declare const self: ServiceWorkerGlobalScope;

import { Board, Edge, RunResult, Schema } from "@google-labs/breadboard";
import { precacheAndRoute } from "workbox-precaching";
import { BroadcastChannelMember } from "../lib/BroadcastChannelMember";
import {
	BroadcastMessage,
	BroadcastMessageTypes,
	InputRequest,
} from "../lib/BroadcastMessage";
import { ControllableAsyncGeneratorRunner } from "../lib/ControllableAsyncGeneratorRunner";
import { ServiceWorkerStatus } from "../lib/ServiceWorkerStatus";
import { SW_BROADCAST_CHANNEL } from "../lib/constants";

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

const board = new Board();
for (let i = 0; i < 3; i++) {
	board
		.input({ $id: `input_${i}` })
		.wire(`message_${i}`, board.output({ $id: `output_${i}` }));
}

const channel = new BroadcastChannel(SW_BROADCAST_CHANNEL);
channel.onmessage = (event): void => handleCommand(event.data);
self.addEventListener("message", (event: ExtendableMessageEvent): void =>
	handleCommand(event)
);

function handleCommand<M extends BroadcastMessage = BroadcastMessage>(
	message: M & ExtendableMessageEvent
) {
	console.log("ServiceWorker", "message", message);
	if (message.messageSource !== BroadcastChannelMember.ServiceWorker) {
		if (message.messageType) {
			if (message.messageType === BroadcastMessageTypes.COMMAND) {
				switch (message.content) {
					case "start":
						if (!boardRunner) {
							boardRunner = new ControllableAsyncGeneratorRunner(
								(): AsyncGenerator<RunResult, unknown, unknown> => board.run(),
								handler
							);
						}
						boardRunner.start();
						break;
					case "pause":
						boardRunner.pause();
						break;
					case "stop":
						boardRunner.stop();
						break;
					default:
						throw new Error(`Unknown command: ${message.content}`);
				}
				broadcastStatus<M>(message);
			} else if (message.messageType === BroadcastMessageTypes.STATUS) {
				broadcastStatus<M>(message);
			}
		}
	}
}

export function getInputSchemaFromNode(runResult: RunResult): Schema {
	let schema: Schema;
	const inputAttribute: string = runResult.state.newOpportunities.find(
		(op: Edge) => op.from == runResult.node.id
	)!.out!;

	const schemaFromOpportunity = {
		type: "object",
		properties: {
			[inputAttribute]: {
				title: inputAttribute,
				type: "string",
			},
		},
	};

	if (runResult.inputArguments.schema) {
		schema = runResult.inputArguments.schema as Schema;
		if (!Object.keys(schema.properties!).includes(inputAttribute)) {
			throw new Error(
				`Input attribute "${inputAttribute}" not found in schema:\n${JSON.stringify(
					schema,
					null,
					2
				)}`
			);
		}
	} else {
		schema = schemaFromOpportunity;
	}
	return schema;
}

export function getInputAttributeSchemaFromNodeSchema(schema: Schema): {
	key: string;
	schema: Schema;
} {
	const key = Object.keys(schema.properties!)[0];
	// const key = schema.title ?? ""
	// return first property in schema
	return {
		key,
		schema
		// schema: schema.properties![key],
	};
}


function broadcastStatus<M extends BroadcastMessage = BroadcastMessage>(message: M & ExtendableMessageEvent) {
	const content: ServiceWorkerStatus = {
		active: boardRunner?.active ?? false,
		paused: boardRunner?.paused ?? false,
		finished: boardRunner?.finished ?? false,
	};
	const response: BroadcastMessage = {
		id: message.id,
		messageType: BroadcastMessageTypes.STATUS,
		messageSource: BroadcastChannelMember.ServiceWorker,
		content,
	};
	channel.postMessage(response);
}

export const pendingInputResolvers: { [key: string]: (input: string) => void; } = {};

export function waitForInput(node: string, attrib: string): Promise<string> {
	return new Promise<string>((resolve) => {
		pendingInputResolvers[`${node}-${attrib}`] = resolve;
	});
}


async function handler(runResult: RunResult): Promise<void> {
	console.log("=".repeat(80));
	if (runResult.type === "input") {
		// const input = {
		// 	node: runResult.node.id,
		// };
		// console.log(runResult.node.id, "input", input);
		// runResult.inputs = input;
		const inputSchema = getInputSchemaFromNode(runResult);
		const { key, schema } = getInputAttributeSchemaFromNodeSchema(inputSchema);


		const message: InputRequest = {
			id: `${runResult.node.id}-${key}`,
			messageType: BroadcastMessageTypes.INPUT_REQUEST,
			messageSource: BroadcastChannelMember.ServiceWorker,
			messageTarget: BroadcastChannelMember.Client,
			content: {
				node: runResult.node.id,
				attribute: key,
				schema,
			},
		};
		new BroadcastChannel(SW_BROADCAST_CHANNEL).postMessage(message);
		new BroadcastChannel(SW_BROADCAST_CHANNEL).addEventListener("message", (event): void => {
			if (event.data.messageType === BroadcastMessageTypes.INPUT_RESPONSE) {
				// if (event.data.content?.attribute !== key) return;
				// if (event.data.content?.node !== runResult.node.id) return;


				// const { node, attribute, value } = event.data.content;
				// pendingInputResolvers[`${node}-${attribute}`](value);

				// const { node, attribute, value } = event.data.content;
				// pendingInputResolvers[`${node}-${attribute}`](value);
				if (event.data.content?.attribute == key && event.data.content?.node == runResult.node.id) {
					const { node, attribute, value } = event.data.content;
					pendingInputResolvers[`${node}-${attribute}`](value);
				}

			}
		})


		const userInput = await waitForInput(runResult.node.id, key);

		runResult.inputs = { [key]: userInput };
		console.log(runResult.inputs);
	} else if (runResult.type === "output") {
		console.log(runResult.node.id, "output", runResult.outputs);
		const message: BroadcastMessage = {
			id: new Date().getTime().toString(),
			messageType: BroadcastMessageTypes.OUTPUT,
			messageSource: BroadcastChannelMember.ServiceWorker,
			messageTarget: BroadcastChannelMember.Client,
			content: runResult.outputs,
		};
		new BroadcastChannel(SW_BROADCAST_CHANNEL).postMessage(message);
	}
	await new Promise((resolve): NodeJS.Timeout => setTimeout(resolve, 1000));
}
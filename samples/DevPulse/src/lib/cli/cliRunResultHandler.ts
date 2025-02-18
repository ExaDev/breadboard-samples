import { RunResult } from "@google-labs/breadboard";
import { getInputSchemaFromNode } from "../../service-worker/getNodeInputSchema";
import { getInputForSchema } from "../../service-worker/getInputForSchema";

export async function cliRunResultHandler(runResult: RunResult): Promise<void> {
	console.debug("=".repeat(80));
	console.debug(runResult.node.id, runResult.type);
	if (runResult.type === "input") {
		const inputAttribute = getInputSchemaFromNode(runResult);
		const input = await getInputForSchema(inputAttribute);
		console.debug(runResult.node.id, "input", input);
		runResult.inputs = input;
		return;
	} else if (runResult.type === "output") {
		console.debug(runResult.node.id, "output", runResult.outputs);
		return;
	}
}

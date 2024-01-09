import { ConfigKit, StringKit } from "@exadev/breadboard-kits";
import { generateAndWriteCombinedMarkdown } from "@exadev/breadboard-kits/util/files/generateAndWriteCombinedMarkdown";
import { Board } from "@google-labs/breadboard";
import { ClaudeKit } from "@paulkinlan/claude-breadboard-kit";
import fs from "fs";
import { FeatureKit } from "~/breadboard/featurekit.js";

const board: Board = new Board({title: "AutoBake"});
const featureKit: FeatureKit = board.addKit(FeatureKit);
const claudeKit: ClaudeKit = board.addKit(ClaudeKit);
const stringKit: StringKit = board.addKit(StringKit);
const config: ConfigKit = board.addKit(ConfigKit);

const getFeatureContent = featureKit.getFeatureResources({$id: "featureResources"});
const features = featureKit.chromeStatusApiFeatures({$id: "chromeApiFeatures"});

const serverUrl = "https://api.anthropic.com/v1/complete";
const claudeParams = {
	model: "claude-2",
	url: `${serverUrl}`,
};

const claudeCompletion = claudeKit.generateCompletion({
	$id: "claudeAPI",
	...claudeParams,
});

const prompt = [
	"Create a markdown document that can be used to teach a junior developer about the feature discussed in the `feature` code block.",
	"Base the script on the content of the `resources` code block.",
	"The first line of the document should be a heading with the name of the feature.",
	"\n",
	"Provide your response formatted as raw markdown.",
	"Only respond with the result of this request.",
	"Do not add any additional information to the script",
	"\n",
	"```resources",
	"{{resources}}",
	"```",
	"\n",
	"```feature",
	"{{feature}}",
	"```",
].join("/n");
const instructionTemplate = stringKit.template({
	$id: "claudePromptConstructor",
	template: prompt,
});

const claudeApiKey = config.readEnvVar({
	$id: "getClaudeAPIKey",
	key: "CLAUDE_API_KEY"
});

//TODO refactor to take feature ID as a board input
features.wire("features->list", getFeatureContent);

getFeatureContent.wire("featureResources->featureResources", instructionTemplate);
claudeApiKey.wire("CLAUDE_API_KEY", claudeCompletion);
instructionTemplate.wire("string->text", claudeCompletion);
claudeCompletion.wire("completion->", board.output({$id: "claudeOutput"}));

const result = await board.runOnce({});
generateAndWriteCombinedMarkdown({
	board,
	filename: "README",
	dir: "./"
});

if (result.completion){

fs.writeFileSync(
	"./featureScript.md",
	result.completion?.toString()
);
} else {
	console.error("No completion found");
	if(!process.env.CLAUDE_API_KEY) {
		console.error("No CLAUDE_API_KEY found");
	}
	throw new Error("No completion found");
}

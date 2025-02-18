// export { board } from "./board";
// export { board as default} from "./board";
import {
	HackerNewsAlgoliaKit,
	HackerNewsFirebaseKit,
	JsonKit,
	ListKit,
	ObjectKit,
	StringKit,
} from "@exadev/breadboard-kits/src";
import { Board, Schema } from "@google-labs/breadboard";
import Core from "@google-labs/core-kit";
import { ClaudeKitBuilder } from "./ClaudeKitBuilder";

const LIMIT_DEPTH = 3;
const SEARCH_RESULT_COUNT = 10;

const DEBUG = false;
const TOP_STORIES = false;

const board = new Board({
	title: "DevPulse",
});
//////////////////////////////////////////////
const hnFirebaseKit = board.addKit(HackerNewsFirebaseKit);
const algolia = board.addKit(HackerNewsAlgoliaKit);
const core = board.addKit(Core);
const listKit = board.addKit(ListKit);
const claudeKit = board.addKit(ClaudeKitBuilder);
const objectKit = board.addKit(ObjectKit);
const stringKit = board.addKit(StringKit);
//////////////////////////////////////////////
const query: Schema = {
	title: "Please enter a search query",
	type: "string",
}
const limit: Schema = {
	title: "Please enter the number of results to return",
	type: "number",
	default: SEARCH_RESULT_COUNT.toString(),
}
const claudeApiKeySchema: Schema = {
	title: "Please enter your API Key",
	type: "password",
}
//////////////////////////////////////////////
const searchParams: Schema = {
	type: "object",
	properties: {
		query,
		limit,
		claudeApiKey: claudeApiKeySchema
	},
} satisfies Schema;
//////////////////////////////////////////////

const search = algolia.search({
	tags: ["story"],
	limit: SEARCH_RESULT_COUNT,
});

const searchInProgress = board.output({$id: "searchInProgress"})

const searchParamsInput = board.input({$id: "searchParams", schema: searchParams});
const searchParamPassthrough = core.passthrough();

searchParamsInput.wire("*", searchParamPassthrough);
searchParamPassthrough.wire("", searchInProgress)

searchParamPassthrough.wire("query", search)
searchParamPassthrough.wire("limit", search)

search.wire("algoliaUrl", board.output({$id: "algoliaSearchUrl"}));

const claudeApiKey = core.passthrough();
searchParamPassthrough.wire("claudeApiKey", claudeApiKey);

//////////////////////////////////////////////
if (DEBUG) {
	search.wire(
		"hits",
		board.output({
			$id: "searchResults",
		})
	);
}
const popSearchResult = listKit.pop({
	$id: "popSearchResult",
});

search.wire("hits->list", popSearchResult);
popSearchResult.wire("list", popSearchResult);
const searchResult = objectKit.spread({
	$id: "searchResult",
});
popSearchResult.wire("item->object", searchResult);
const searchResultOutput = board.output({
	$id: "searchResultData",
});
searchResult.wire("story_id", searchResultOutput);
searchResult.wire("title", searchResultOutput);
searchResult.wire("url", searchResultOutput);
searchResult.wire("author", searchResultOutput);
searchResult.wire("created_at", searchResultOutput);
searchResult.wire("created_at_i", searchResultOutput);
searchResult.wire("points", searchResultOutput);
searchResult.wire(
	"story_id",
	stringKit
		.template({
			template: "https://news.ycombinator.com/item?id={{story_id}}",
		})
		.wire("string->hnURL", searchResultOutput)
);

//////////////////////////////////////////////
const popStory = listKit.pop({
	$id: "popStoryId",
});
if (TOP_STORIES) {
	const hackerNewsTopStoryIdList = core.passthrough();
	hnFirebaseKit
		.topStoryIds({
			limit: 1,
		})
		.wire("storyIds", hackerNewsTopStoryIdList);

	hackerNewsTopStoryIdList.wire("storyIds->list", popStory);
}
popStory.wire("list", popStory);
const storyId = core.passthrough();
popStory.wire("item->id", storyId);

if (DEBUG) {
	storyId.wire(
		"id",
		board.output({
			$id: "storyId",
		})
	);
}

//////////////////////////////////////////////
searchResult.wire("story_id->id", storyId);
//////////////////////////////////////////////

const hnAlgoliaKit = board.addKit(HackerNewsAlgoliaKit);

const getStoryFromId = hnAlgoliaKit.getStory();
storyId.wire("id", getStoryFromId);
const story = core.passthrough();

getStoryFromId.wire("*", story);
if (DEBUG) {
	story.wire(
		"*",
		board.output({
			$id: "fullStory",
		})
	);
}

const storyOutput = board.output({
	$id: "story",
});

story.wire("algoliaUrl", storyOutput);
story.wire("author", storyOutput);
story.wire("created_at", storyOutput);
story.wire("created_at_i", storyOutput);
// story.wire("id", storyOutput);
story.wire("points", storyOutput);
story.wire("story_id", storyOutput);
story.wire("title", storyOutput);
story.wire("type", storyOutput);
story.wire("url", storyOutput);
search.wire("algoliaUrl", storyOutput);
// searchParamsInput.wire("query", storyOutput);

if (DEBUG) {
	story.wire("children", storyOutput);
}

//////////////////////////////////////////////

//////////////////////////////////////////////


const VITE_SERVER_PORT = 5173;
const fallback = `http://localhost:${VITE_SERVER_PORT}`;
let serverUrl = `${fallback}/anthropic/v1/complete`;

if (typeof process !== "undefined" && process.release.name === "node") {
	console.log("Running in node");
	serverUrl = `${fallback}/anthropic/v1/complete`;
}

//////////////////////////////////////////////

const jsonKit = board.addKit(JsonKit);
const stringifiedPost = jsonKit.stringify();

const nest = objectKit.nest({
	key: "story",
});
story.wire("*", nest);

if (LIMIT_DEPTH) {
	const objectKit = board.addKit(ObjectKit);
	const limit = objectKit.limitDepth({
		depth: LIMIT_DEPTH,
	});
	nest.wire("story->object", limit);
	limit.wire("object", stringifiedPost);
} else {
	story.wire("story->object", stringifiedPost);
}
if (DEBUG) {
	stringifiedPost.wire("string", board.output({$id: "json"}));
}

//////////////////////////////////////////////

const instruction = "Summarise the discussion regarding this post";
const templateText = [instruction, "```json", "{{story}}", "```"].join("\n");

story.wire(
	"story_id",
	board.output({
		$id: "templateText",
		instruction,
		templateText,
	})
);

const instructionTemplate = stringKit.template({
	$id: "instructionTemplate",
	template: templateText,
});
stringifiedPost.wire("string->story", instructionTemplate);

if (DEBUG) {
	instructionTemplate.wire(
		"string",
		board.output({
			$id: "populatedTemplate",
		})
	);
}

story.wire(
	"story_id",
	board.output({
		$id: "pendingOutput",
		summary: "pending",
	})
);

const claudePostSummarisation = claudeKit.complete({
	$id: "claudePostSummarisation",
	model: "claude-2",
	url: serverUrl,
});

claudeApiKey.wire("claudeApiKey->apiKey", claudePostSummarisation);
instructionTemplate.wire("string->userQuestion", claudePostSummarisation);

const summaryOutput = board.output({
	$id: "summary",
});

story.wire("story_id", summaryOutput);
claudePostSummarisation.wire("completion->summary", summaryOutput);

export { board };
export { board as default };

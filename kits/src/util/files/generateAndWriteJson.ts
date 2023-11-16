import { Board } from "@google-labs/breadboard";
import { generateJson, writeJson } from "util/files/index.js";

export default function generateAndWriteJson(dir: string, name: string, board: Board) {
	const jsonContent = generateJson(board);
	writeJson(dir, name, jsonContent);
}

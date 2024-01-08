import React from "react";
import { useWorkerControllerContext } from "~/old/worker/useWorkerControllerContext";
import styles from "./worker-component.module.scss";
import Button from "~/components/button";
import OutputAccordion from "~/hnStory/components/output-accordion";
import { SW_BROADCAST_CHANNEL } from "../../lib/constants";
import { Schema } from "@google-labs/breadboard";
import { InputResponse } from "~/lib/types/InputResponse";

export const WorkerStatus = {
	idle: "idle",
	running: "running",
	paused: "paused",
	stopped: "stopped",
	loading: "loading",
	finished: "finished",
} as const;

export type WorkerStatus = (typeof WorkerStatus)[keyof typeof WorkerStatus];

export const WorkerComponent: React.FC = () => {
	const { broadcastChannel, workerSteps } = useWorkerControllerContext();
	const handleSubmit = (
		e: React.FormEvent<HTMLFormElement>,
		node: string,
		schema: Schema,
		attribute: string
	) => {
		e.preventDefault();
		const input = (e.target as HTMLFormElement).querySelector("input");

		const inputObject: InputResponse = {
			node,
			attribute,
			schema,
			value: input?.value,
		};
		workerSteps.addStep(inputObject);

		/* const message: ClientInputResponseData = {
			type: ClientBroadcastType.INPUT_RESPONSE,
			source: BROADCAST_SOURCE.CLIENT,
			target: BROADCAST_TARGET.SERVICE_WORKER,
			value: inputObject,
		}; */
		new BroadcastChannel(SW_BROADCAST_CHANNEL).postMessage(message);
	};
	const running =
		broadcastChannel.status.active &&
		!broadcastChannel.status.paused &&
		!broadcastChannel.status.finished;
	//const inputField = useSelector((state: RootState) => selectInput(state))
	return (
		<div>
			<header className={styles.header}>
				<h6>
					Service Worker{" "}
					<span>
						Status:{" "}
						{running
							? "running"
							: broadcastChannel.status.paused
							? "paused"
							: broadcastChannel.status.finished
							? "finished"
							: "idle"}
					</span>
				</h6>
				<div className={styles.ccontrols}>
					<Button onClick={broadcastChannel.start}>Start</Button>
					<Button onClick={broadcastChannel.pause} disabled={!running}>
						Pause
					</Button>
					<Button onClick={broadcastChannel.stop} disabled={!running}>
						Stop
					</Button>
				</div>
			</header>

			<main className={styles.main}>
				{running && (
					<form
						className={styles.form}
						onSubmit={(e) =>
							handleSubmit(
								e,
								broadcastChannel.input?.node || "",
								broadcastChannel.input!.schema!,
								broadcastChannel.input?.attribute || ""
							)
						}
					>
						<label htmlFor="input" className={styles.label}>
							{JSON.stringify(broadcastChannel.input?.value) || ""}
						</label>

						<input
							type="text"
							name="input"
							placeholder={`${broadcastChannel.input?.node}`}
							className={styles.input}
						/>

						<Button type="submit" className={styles.button}>
							Submit
						</Button>
					</form>
				)}
			</main>

			<OutputAccordion
				data={broadcastChannel.output}
				nodeId="searchResultData"
			/>
		</div>
	);
};

export default WorkerComponent;
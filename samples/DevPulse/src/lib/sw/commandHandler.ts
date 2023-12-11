import { ServiceWorkerCommand } from "./serviceWorkerCommand.ts";
import { ServiceWorkerCommandEvent } from "./serviceWorkerCommandEvent.ts";
import { SW_CONTROL_CHANNEL } from "../constants";
import { boardRunner } from "../../service-worker/sw";

export function commandHandler(data: ServiceWorkerCommandEvent) {
	console.log("ServiceWorker", "message", data);
	switch (data.command) {
		case ServiceWorkerCommand.start:
			boardRunner.start();
			break;
		case ServiceWorkerCommand.pause:
			boardRunner.pause();
			break;
		case ServiceWorkerCommand.stop:
			boardRunner.stop();
			break;
		case ServiceWorkerCommand.status:
			new BroadcastChannel(SW_CONTROL_CHANNEL).postMessage({
				command: "status",
				active: boardRunner.active,
				paused: boardRunner.paused,
			});
			break;
	}
}

export default commandHandler;

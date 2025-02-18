import { SW_BROADCAST_CHANNEL } from "~/lib/constants/SW_BROADCAST_CHANNEL.ts";
import { BroadcastChannelEventHandler } from "~/lib/types/BroadcastChannelEventHandler.ts";
import { BroadcastChannelMember } from "~/lib/types/BroadcastChannelMember.ts";
import { BroadcastMessage } from "~/lib/types/BroadcastMessage.ts";

import { sendBroadcastMessageToServiceWorker } from "~/lib/functions/SendBroadcastMessageToServiceWorker.ts";
import { BroadcastMessageType } from "~/lib/types/BroadcastMessageType.ts";
import { ResponseForMessage } from "~/lib/types/ResponseForMessage.ts";
import { ServiceWorkerStatus } from "~/lib/types/ServiceWorkerStatus.ts";

export function sendStatusRequestToServiceWorker<
	M extends BroadcastMessage & {
		messageTarget: BroadcastChannelMember.ServiceWorker;
		messageType: BroadcastMessageType.STATUS;
	} = BroadcastMessage & {
		messageTarget: BroadcastChannelMember.ServiceWorker;
		messageType: BroadcastMessageType.STATUS;
	},
	R extends BroadcastMessage = ResponseForMessage<M> & {
		content: ServiceWorkerStatus;
		source: BroadcastChannelMember.ServiceWorker;
		type: BroadcastMessageType.STATUS;
	},
	H extends BroadcastChannelEventHandler<R> = BroadcastChannelEventHandler<R>
	>({
		channelId = SW_BROADCAST_CHANNEL,
		responseHandler,
	}: {
		channelId?: string;
		responseHandler?: H;
	} = {}) {
	return sendBroadcastMessageToServiceWorker<M, R, H>(
		channelId,
		{
			messageType: BroadcastMessageType.STATUS,
			messageTarget: BroadcastChannelMember.ServiceWorker,
		} as M,
		responseHandler
	);
}

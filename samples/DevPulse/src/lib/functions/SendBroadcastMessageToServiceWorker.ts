import { sendBroadcastMessage } from "~/lib/functions/SendBroadcastMessage";
import { BroadcastChannelEventHandler } from "~/lib/types/BroadcastChannelEventHandler";
import { BroadcastChannelMember } from "~/lib/types/BroadcastChannelMember";
import { BroadcastMessage } from "~/lib/types/BroadcastMessage";
import { ResponseForMessage } from "~/lib/types/ResponseForMessage";


export function sendBroadcastMessageToServiceWorker<
	M extends BroadcastMessage & {
		messageTarget: BroadcastChannelMember.ServiceWorker;
	} = BroadcastMessage & { messageTarget: BroadcastChannelMember.ServiceWorker; },
	R extends BroadcastMessage = ResponseForMessage<M>,
	H extends BroadcastChannelEventHandler<R> = BroadcastChannelEventHandler<R>
>(channelId: string, message: M, responseHandler?: H) {
	return sendBroadcastMessage<M, R, H>(
		channelId,
		{
			...message,
			id: message.id ?? new Date().getTime().toString(),
		},
		responseHandler
	);
}

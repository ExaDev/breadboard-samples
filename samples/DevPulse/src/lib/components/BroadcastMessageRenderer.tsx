import React, { ReactNode, useEffect, useState } from "react";
import { SW_BROADCAST_CHANNEL } from "../constants";
import { BroadcastMessage } from "../types/BroadcastMessage";
import BasicMessage from "./BasicMessage";

export function BroadcastMessageRenderer({
	channelId = SW_BROADCAST_CHANNEL,
	matchers = [],
	ignoreMatchers = [],
	defaultMessageComponent = BasicMessage,
	onRenderMessages,
}: {
	channelId: string;
	matchers?: [
		matcher: (message: BroadcastMessage) => boolean,
		component: React.ComponentType<{ message: BroadcastMessage }>
	][]; // Array of tuples of matcher functions and components
	ignoreMatchers?: ((message: BroadcastMessage) => boolean)[];
	defaultMessageComponent?: React.ComponentType<{ message: BroadcastMessage }>;
	onRenderMessages: () => void;
}): ReactNode {
	const [messages, setMessages] = useState<BroadcastMessage[]>([]);

	useEffect(() => {
		const channel = new BroadcastChannel(channelId);

		const handleMessage = (e: MessageEvent) => {
			const newMessage = e.data as BroadcastMessage;
			if (
				ignoreMatchers &&
				!ignoreMatchers.some((matcher: (arg0: BroadcastMessage) => boolean) =>
					matcher(newMessage)
				)
			) {
				setMessages((prevMessages) => [...prevMessages, newMessage]);
			}
		};

		channel.addEventListener("message", handleMessage);

		return () => {
			channel.removeEventListener("message", handleMessage);
			channel.close();
		};
	}, [channelId, ignoreMatchers]);

	useEffect(() => {
		if (messages?.length > 0) {
			onRenderMessages();
		}
	}, [messages]);

	const renderMessage = (message: BroadcastMessage) => {
		for (const [matcher, Component] of matchers) {
			if (matcher(message)) {
				return <Component key={message.id} message={message} />;
			}
		}
		return React.createElement(defaultMessageComponent, {
			key: message.id,
			message: message,
		});
	};

	return <div>{messages.map(renderMessage)}</div>;
}

export default BroadcastMessageRenderer;

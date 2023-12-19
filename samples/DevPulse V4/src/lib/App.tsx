import viteLogo from "/vite.svg";
import { useState } from "react";
import { ServiceWorkerControllerComponent } from "lib/ServiceWorkerControllerComponent.tsx";
import "lib/App.css";
import reactLogo from "assets/react.svg";
import { BroadcastMessageRenderer } from "lib/BroadcastMessageRenderer.tsx";
import { SW_BROADCAST_CHANNEL } from "lib/constants.ts";

function InputRequestsRenderer(_props: { channelId: string }) {
	return null;
}

function App() {
	const [count, setCount] = useState(0);
	return (
		<>
			<div>
				<a href="https://vitejs.dev" target="_blank">
					<img src={viteLogo} className="logo" alt="Vite logo" />
				</a>
				<a href="https://react.dev" target="_blank">
					<img src={reactLogo} className="logo react" alt="React logo" />
				</a>
			</div>
			<h1>Vite + React</h1>
			<div className="card">
				<button onClick={() => setCount((count) => count + 1)}>
					count is {count}
				</button>
				<p>
					Edit <code>src/App.tsx</code> and save to test HMR
				</p>
			</div>
			<p className="read-the-docs">
				Click on the Vite and React logos to learn more
			</p>
			<InputRequestsRenderer channelId={SW_BROADCAST_CHANNEL}/>
			<ServiceWorkerControllerComponent />
			<BroadcastMessageRenderer channelId={SW_BROADCAST_CHANNEL} />
		</>
	);
}

export default App;


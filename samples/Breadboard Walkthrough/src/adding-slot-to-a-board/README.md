# Adding Slot to a Board

```mermaid
%%{init: 'themeVariables': { 'fontFamily': 'Fira Code, monospace' }}%%
graph TD;
slot1(("slot <br> id='slot-1'")):::slot -- "nestedOutput->nestedOutput" --> mainOutputNode{{"output <br> id='mainOutputNode'"}}:::output
mainInputNode[/"input <br> id='mainInputNode'"/]:::input -- "mainInput->nestedInput" --> slot1(("slot <br> id='slot-1'")):::slot
classDef default stroke:#ffab40,fill:#fff2ccff,color:#000
classDef input stroke:#3c78d8,fill:#c9daf8ff,color:#000
classDef output stroke:#38761d,fill:#b6d7a8ff,color:#000
classDef passthrough stroke:#a64d79,fill:#ead1dcff,color:#000
classDef slot stroke:#a64d79,fill:#ead1dcff,color:#000
classDef config stroke:#a64d79,fill:#ead1dcff,color:#000
classDef secrets stroke:#db4437,fill:#f4cccc,color:#000
classDef slotted stroke:#a64d79
```

```json
{
	"title": "Adding Slot to a Board",
	"edges": [
		{
			"from": "slot-1",
			"to": "mainOutputNode",
			"out": "nestedOutput",
			"in": "nestedOutput"
		},
		{
			"from": "mainInputNode",
			"to": "slot-1",
			"out": "mainInput",
			"in": "nestedInput"
		}
	],
	"nodes": [
		{
			"id": "mainInputNode",
			"type": "input",
			"configuration": {
				"schema": {
					"type": "object",
					"properties": {
						"mainInput": {
							"type": "string"
						}
					}
				}
			}
		},
		{
			"id": "mainOutputNode",
			"type": "output"
		},
		{
			"id": "slot-1",
			"type": "slot",
			"configuration": {
				"slot": "nested"
			}
		}
	],
	"kits": [
		{
			"url": "npm:@google-labs/core-kit"
		}
	]
}
```
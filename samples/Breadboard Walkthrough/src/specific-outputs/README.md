# Specific Outputs

```mermaid
%%{init: 'themeVariables': { 'fontFamily': 'Fira Code, monospace' }}%%
graph TD;
input1[/"input <br> id='input-1'"/]:::input -- "message->message" --> output1{{"output <br> id='output1'"}}:::output
input1[/"input <br> id='input-1'"/]:::input -- "message->message" --> output2{{"output <br> id='output2'"}}:::output
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
	"title": "Specific Outputs",
	"edges": [
		{
			"from": "input-1",
			"to": "output1",
			"out": "message",
			"in": "message"
		},
		{
			"from": "input-1",
			"to": "output2",
			"out": "message",
			"in": "message"
		}
	],
	"nodes": [
		{
			"id": "input-1",
			"type": "input",
			"configuration": {
				"schema": {
					"type": "object",
					"properties": {
						"message": {
							"type": "string"
						}
					}
				}
			}
		},
		{
			"id": "output1",
			"type": "output"
		},
		{
			"id": "output2",
			"type": "output"
		}
	],
	"kits": []
}
```
import React, {useState, FunctionComponent, useEffect} from 'react';
import './App.css';
import calculate from "./Calculate" 
import {Grid, GridSize} from "@material-ui/core"

// import {ipcRenderer} from "./ipcRenderer"
declare var window: any;

function App() {
	const [input, setInput] = useState("")
	const [prevCalculation, setPrevCalculation] = useState("")
	const [hasError, setHasError] = useState(false)
	const allowed = "0123456789+-*/^."
	
	/**
	 * Layout
	 * 				Input
	 * 		C		^	/
	 * 		7	8	9	*
	 * 		4	5	6	-
	 * 		1	2	3	+
	 * 		0	.		=
	 * 		
	 */

	// interface Keys {
	// 	[index: number]: 
	// }
	
	// TODO: make ipcRenderer work

	const handleClick = (str: string) => {
		if (hasError) {
			setInput(str)
			setHasError(false)
		} else {
			setInput(input+str)
		}
	}

	const clear = () => {
		if (hasError) {
			setInput(prevCalculation)
			setHasError(false)
		} else {
			setInput("")
		}
	}

	const getResult = () => {
		setPrevCalculation(input)
		setHasError(false)
		const result = calculate(input)
		if (result.success) {
			setInput(String(result.result))
		} else {
			setInput(result.error)
			setHasError(true)
		}
	}

	const backspace = () => {
		if (hasError) {
			console.log(prevCalculation)
			setInput(prevCalculation)
			setHasError(false)
		} else {
			var splitted = input.split("")
			splitted.pop()
			setInput(splitted.join(""))	
		}
	}

	interface CustomKey {
		text: string,
		handleClick: Function,
		tooltip?: string,
		style?: string
	}

	const keys: Array<Array<string | null | CustomKey>> = [
		[{text: "C", handleClick:clear, tooltip:"Ctrl+Backspace"}, {text: "DEL", handleClick:backspace, tooltip:"Backspace"}, "^", "/"],
		["7", "8", "9", "*"],
		["4", "5", "6", "-"],
		["1", "2", "3", "+"],
		["0", ".", null, {text: "=", handleClick:getResult, tooltip:"Enter", style: "equals"}],
	]


	useEffect(() => {
		const handleKeyPressUp = (event: KeyboardEvent) => {
			if (allowed.split("").includes(event.key)) {
				handleClick(event.key)
			} else if (event.key === "Enter") {
				if (!hasError) {
					getResult()
				}
			} else if (event.key === "Backspace") {
				if (event.ctrlKey === true) {
					clear()
				} 
			}
		}

		const handleKeyPressDown = (event: KeyboardEvent) => {
			if (event.key === "Backspace") {
				backspace()
			}
		}

		document.addEventListener("keyup", handleKeyPressUp, false)
		document.addEventListener("keydown", handleKeyPressDown, false)

		return () => {
			document.removeEventListener("keyup", handleKeyPressUp, false)	
			document.removeEventListener("keydown", handleKeyPressDown, false)	
		}
	}, [input, handleClick, hasError, backspace])


	useEffect(() => {
		window.api.response("clear", clear)
		return ()=>{
			window.api.removeListeners()
		}
	}, [clear])

	return (
		<div className="App">
			<div className="input" style={{textAlign: "right"}}>
				{input}
			</div>
			<div style={{textAlign: "center"}}>
				{keys.map((keyRow, i) => {
					return (
						<Grid container spacing={1} key={i}>
							{keyRow.map((key, j) => {
								if (typeof key === "string") return <Button size={1} text={key} click={handleClick} key={j}/>
								else if (key === null) return <Button size={1} text={""} click={()=>{}} key={j}/>
								else if (typeof key === "object") return <Button size={1} text={key.text} click={key.handleClick} tooltip={key.tooltip} key={j} style={key.style} />
								return <Button size={1} text={key} click={handleClick} key={j}/>
							})}
						</Grid>
					) 
				}) }
			</div>
		</div>
	);
}

interface ButtonProps {
	size: 1 | 2 | 3 | 4,
	text: string,
	click: Function,
	tooltip?: string,
	style?: string
}
const Button: FunctionComponent<ButtonProps> = ({size, text, click, tooltip, style}) => (
	<Grid className={`button ${style?style: ""}`} item={true} xs={size * 3 as GridSize} onClick={()=>click(text)}>
		<p title={tooltip?tooltip:undefined} className="button-text">
			{text}
		</p>
	</Grid>
)


export default App;

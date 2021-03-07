interface Calculation {
    o: string,
    l: number | Calculation,
    r: number | Calculation,
}

type ParseResultSuccess = {
    success: true,
    tree: Calculation,
}

type ParseResultError = {
    success: false,
    error: ErrorType
}

type ParseResult = ParseResultError | ParseResultSuccess

type CalculatorResultSuccess = {
    success: true, 
    result: number
}

type CalculatorResultError = {
    success: false,
    error: ErrorType
}

type CalculatorResult = CalculatorResultSuccess | CalculatorResultError 

enum ErrorType {
    SyntaxError = "Syntax Error",
    Unknown = "Unknown Error"
}

var order: string[] = ["^", "/", "*", "+", "-"]

const splitAndJoin = (str: string, char: string) => {
    // Converts a string into an array with the string splitted being inserted where it was removed
    var arr = str.split(char)
    var ret = []
    for (let i = 0; i < arr.length; i++) {
        const item = arr[i];
        ret.push(item)
        if (i !== arr.length-1) {
            ret.push(char)
        }
    }
    return ret
}

// TODO add brackets
const parse = (input: string): ParseResult => {

    // Clean input
    input = input.replace(" ", "")

    // Spread out each part
    var spread = [input]
    for (let operator of order) {
        var newArr = []
        for (let part of spread) {
            // Not a symbol or int
            if (!order.includes(part) || !isNaN(Number(part)) ) {
                // console.log({part, operator})
                newArr.push(...splitAndJoin(part, operator))
            } else {
                newArr.push(part)
            }
        }
        spread = newArr
    }

    // Remove blanks
    spread = spread.filter(item => {
        return item !== ""
    })
    
    // Fix odd rules
    var changed = true
    while (changed === true) {
        changed = false
        for (let i = 0; i < spread.length; i++) {
            const item = spread[i];
            const prev = spread[i-1]
            const next = spread[i+1]
            // If +- or -+ replace with -
            if ((item === "-" && prev === "+") || (item === "+" && prev === "-")) {
                spread.splice(i-1, 2, "-")
            } else if (item === "-" && (prev === undefined || order.includes(prev))) {
                // If starts with -
                spread.splice(i, 2, String(-Number(next)) )
                changed = true
                break
            }
        }
        
    }

    // Check if any item is not a number or a symbol
    var typed: Array<any> = []
    for (let item of spread) {
        if (!isNaN(Number(item))) typed.push(Number(item))
        else if (order.includes(item)) typed.push(item)
        else return {success: false, error: ErrorType.SyntaxError}
    }

    // Convert into a binary tree
    for (let i = 0; i < order.length; i++) {
        const operator = order[i];
        var changed = true
        while (changed === true) {
            changed = false
            for (let i = 0; i < typed.length; i++) {
                const item = typed[i];
                if (item === operator) {
                    const left = typed[i-1]
                    const right = typed[i+1]
                    if (!left || !right) {
                        return {success: false, error: ErrorType.SyntaxError}
                    }
                    var node: Calculation = {
                        o: operator,
                        l: left,
                        r: right,
                    }
                    typed.splice(i-1, 3, node)
                    changed = true
                    break
                }
            }            
            // console.log(typed)
        }
    }
    console.log(typed)
    if (typeof typed[0] === "object" ) {
        return {success: true, tree: typed[0]}  
    } else if (typeof typed[0] === "number") {
        // Little hack for when in integer is entered
        return {success: true, tree: {o: "+", l: typed[0], r: 0}}
    } else {
        console.warn("Error calculating")
        console.warn(typed)
        return {success: false, error: ErrorType.Unknown}
    }
}

const calculate = (eq: Calculation): number => {
    
    const operator = eq.o
    var left = eq.l
    var right = eq.r
    var result: number

    if (typeof left === "object" ) {
        left = calculate(left)
    }

    if (typeof right === "object" ) {
        right = calculate(right)
    }

    switch (operator) {
        case "+":
            result = left + right
            break;
        case "-": 
            result = left - right
            break;
        case "x":
        case "*": 
            result = left * right
            break;
        case "/": 
            result = left / right
            break;
        case "^": 
            result = left ** right
            break;
        default:
            result = 0
            break;
    }
    return result
    
}

const calculator = (input: string): CalculatorResult => {
    const parsed: ParseResult = parse(input)
    if (parsed.success) {
        return {success: true, result: calculate(parsed.tree)}
    } else {
        return {success: false, error: parsed.error}
    }
}

// console.log(calculator("-811*-4-+33-2^4*2"))

export default calculator
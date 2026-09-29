const academicData = [
    {
        subject: "Data Structures",
        topic: "Binary Search",
        content: `
Binary Search is a searching algorithm used on a sorted array.
It repeatedly divides the search interval into two halves.

Important points:
- The array must be sorted.
- Time complexity: O(log n)
- Space complexity: O(1) for iterative implementation.
- It is faster than linear search for large sorted arrays.

Common exam questions:
1. Explain Binary Search with an algorithm.
2. Write a C program for Binary Search.
3. Compare Linear Search and Binary Search.
`
    },

    {
        subject: "Data Structures",
        topic: "Stack",
        content: `
A Stack is a linear data structure that follows LIFO
(Last In First Out).

Basic operations:
- Push
- Pop
- Peek/Top

Applications:
- Function calls
- Expression evaluation
- Undo operations
- Parentheses matching

Common exam questions:
1. Explain Stack with its operations.
2. Write a C program to implement Stack.
3. Explain applications of Stack.
`
    },

    {
        subject: "Computer Organization",
        topic: "CPU",
        content: `
CPU stands for Central Processing Unit.

The major components of CPU are:
- ALU (Arithmetic Logic Unit)
- Control Unit
- Registers

ALU performs arithmetic and logical operations.
The Control Unit controls the execution of instructions.
Registers provide very fast temporary storage.
`
    },

    {
        subject: "Analog and Digital Electronics",
        topic: "Logic Gates",
        content: `
Logic gates are basic building blocks of digital circuits.

Important logic gates:
- AND
- OR
- NOT
- NAND
- NOR
- XOR
- XNOR

NAND and NOR are called universal gates because they can
be used to implement other basic logic gates.
`
    }
];

module.exports = academicData;
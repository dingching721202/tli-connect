# general
- Follow the user story mapping
- Follow the data schema given in src/data
- Do not have ANY type

# Next.js
- use localstorage as db
- Use less code better than more codepri 

# TypeScript
1. Define Explicit Types
Use interfaces or type aliases to clearly describe your data structures.

interface User {
  id: number
  name: string
  email: string
}

function greet(user: User): void {
  console.log(`Hello, ${user.name}!`)
}

2. Use Generics
If you need flexibility, use generics instead of any to preserve type safety.

function identity<T>(arg: T): T {
  return arg
}

let output = identity<string>('hello')

3. Use unknown Instead of any
The unknown type is safer than any. You must check its type before using it, which prevents unsafe operations.

function handleData(data: unknown) {
  if (typeof data === 'string') {
    console.log(data.toUpperCase())
  }
}

4. Rely on Type Inference
TypeScript can often infer types automatically. Avoid explicitly setting any.

const count = 5 // Inferred as number

5. Add Type Definitions for Third-Party Libraries
For libraries without type definitions, install the relevant @types package or write your own type declarations.

npm install @types/lodash

6. Enable Strict Mode
Turn on strict settings in tsconfig.json to prevent variables from silently becoming any:

{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true
  }
}

7. Use Advanced Type Features
Use as const to lock down constant types.
Use type guards to narrow types safely.
const arr = [1, 2, 3] as const // arr is readonly [1, 2, 3]
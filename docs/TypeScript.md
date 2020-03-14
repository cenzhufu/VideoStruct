## TypeScript

## .d.ts

### 库类型

#### Global library

> 全局引用的，没有使用```import```，如通过```<script>```标签，或者定义在```window```上
>
> 一般表现为：
>
> * ```var```, ```function```
> * ```window.someName```
> * ```document```或者```window```
>
> 不会为：
>
> * ```require```, ```define```

##### ```global.d.ts```


```typescript
// Type definitions for [~THE LIBRARY NAME~] [~OPTIONAL VERSION NUMBER~]
// Project: [~THE PROJECT NAME~]
// Definitions by: [~YOUR NAME~] <[~A URL FOR YOU~]>

/*~ If this library is callable (e.g. can be invoked as myLib(3)),
 *~ include those call signatures here.
 *~ Otherwise, delete this section.
 */
declare function myLib(a: string): string;
declare function myLib(a: number): number;

/*~ If you want the name of this library to be a valid type name,
 *~ you can do so here.
 *~
 *~ For example, this allows us to write 'var x: myLib';
 *~ Be sure this actually makes sense! If it doesn't, just
 *~ delete this declaration and add types inside the namespace below.
 */
interface myLib {
  name: string;
  length: number;
  extras?: string[];
}

/*~ If your library has properties exposed on a global variable,
 *~ place them here.
 *~ You should also place types (interfaces and type alias) here.
 */
declare namespace myLib {
  //~ We can write 'myLib.timeout = 50;'
  let timeout: number;

  //~ We can access 'myLib.version', but not change it
  const version: string;

  //~ There's some class we can create via 'let c = new myLib.Cat(42)'
  //~ Or reference e.g. 'function f(c: myLib.Cat) { ... }
  class Cat {
    constructor(n: number);

    //~ We can read 'c.age' from a 'Cat' instance
    readonly age: number;

    //~ We can invoke 'c.purr()' from a 'Cat' instance
    purr(): void;
  }

  //~ We can declare a variable as
  //~   'var s: myLib.CatSettings = { weight: 5, name: "Maru" };'
  interface CatSettings {
    weight: number;
    name: string;
    tailLength?: number;
  }

  //~ We can write 'const v: myLib.VetID = 42;'
  //~  or 'const v: myLib.VetID = "bob";'
  type VetID = string | number;

  //~ We can invoke 'myLib.checkCat(c)' or 'myLib.checkCat(c, v);'
  function checkCat(c: Cat, s?: VetID);
}
```

#### Module library

> 模块的定义
>
> 一般表现为:
>
> * 无条件的```require```或```define```
> * 像```import * as a from 'b'```或者```export c```的声明
> * 赋值给```exports```或者```module.exports```
>
> 不会有:
>
> * 赋值给```window```或者```global```

##### UMD

> 可以被当成全局，也可以被当成模块
>
> ```javascript
> (function (root, factory) {
>   if (typeof define === "function" && define.amd) {
>     define(["libName"], factory);
>   } else if (typeof module === "object" && module.exports) {
>     module.exports = factory(require("libName"));
>   } else {
>     root.returnExports = factory(root.libName);
>   }
> }(this, function (b) {
> ```
>
>

###### ```module-function.d.ts```

```typescript
// Type definitions for [~THE LIBRARY NAME~] [~OPTIONAL VERSION NUMBER~]
// Project: [~THE PROJECT NAME~]
// Definitions by: [~YOUR NAME~] <[~A URL FOR YOU~]>

/*~ This is the module template file for function modules.
 *~ You should rename it to index.d.ts and place it in a folder with the same name as the module.
 *~ For example, if you were writing a file for "super-greeter", this
 *~ file should be 'super-greeter/index.d.ts'
 */

/*~ Note that ES6 modules cannot directly export callable functions.
 *~ This file should be imported using the CommonJS-style:
 *~   import x = require('someLibrary');
 *~
 *~ Refer to the documentation to understand common
 *~ workarounds for this limitation of ES6 modules.
 */

/*~ If this module is a UMD module that exposes a global variable 'myFuncLib' when
 *~ loaded outside a module loader environment, declare that global here.
 *~ Otherwise, delete this declaration.
 */
export as namespace myFuncLib;

/*~ This declaration specifies that the function
 *~ is the exported object from the file
 */
export = MyFunction;

/*~ This example shows how to have multiple overloads for your function */
declare function MyFunction(name: string): MyFunction.NamedReturnType;
declare function MyFunction(length: number): MyFunction.LengthReturnType;

/*~ If you want to expose types from your module as well, you can
 *~ place them in this block. Often you will want to describe the
 *~ shape of the return type of the function; that type should
 *~ be declared in here, as this example shows.
 */
declare namespace MyFunction {
  export interface LengthReturnType {
    width: number;
    height: number;
  }
  export interface NamedReturnType {
    firstName: string;
    lastName: string;
  }

  /*~ If the module also has properties, declare them here. For example,
   *~ this declaration says that this code is legal:
   *~   import f = require('myFuncLibrary');
   *~   console.log(f.defaultName);
   */
  export const defaultName: string;
  export let defaultLength: number;
}
```

###### ```module-class.d.ts```

```typescript
// Type definitions for [~THE LIBRARY NAME~] [~OPTIONAL VERSION NUMBER~]
// Project: [~THE PROJECT NAME~]
// Definitions by: [~YOUR NAME~] <[~A URL FOR YOU~]>

/*~ This is the module template file for class modules.
 *~ You should rename it to index.d.ts and place it in a folder with the same name as the module.
 *~ For example, if you were writing a file for "super-greeter", this
 *~ file should be 'super-greeter/index.d.ts'
 */

/*~ Note that ES6 modules cannot directly export class objects.
 *~ This file should be imported using the CommonJS-style:
 *~   import x = require('someLibrary');
 *~
 *~ Refer to the documentation to understand common
 *~ workarounds for this limitation of ES6 modules.
 */

/*~ If this module is a UMD module that exposes a global variable 'myClassLib' when
 *~ loaded outside a module loader environment, declare that global here.
 *~ Otherwise, delete this declaration.
 */
export as namespace myClassLib;

/*~ This declaration specifies that the class constructor function
 *~ is the exported object from the file
 */
export = MyClass;

/*~ Write your module's methods and properties in this class */
declare class MyClass {
  constructor(someParam?: string);

  someProperty: string[];

  myMethod(opts: MyClass.MyClassMethodOptions): number;
}

/*~ If you want to expose types from your module as well, you can
 *~ place them in this block.
 */
declare namespace MyClass {
  export interface MyClassMethodOptions {
    width?: number;
    height?: number;
  }
}
```

###### ```module.d.ts```

```typescript
// Type definitions for [~THE LIBRARY NAME~] [~OPTIONAL VERSION NUMBER~]
// Project: [~THE PROJECT NAME~]
// Definitions by: [~YOUR NAME~] <[~A URL FOR YOU~]>

/*~ This is the module template file. You should rename it to index.d.ts
 *~ and place it in a folder with the same name as the module.
 *~ For example, if you were writing a file for "super-greeter", this
 *~ file should be 'super-greeter/index.d.ts'
 */

/*~ If this module is a UMD module that exposes a global variable 'myLib' when
 *~ loaded outside a module loader environment, declare that global here.
 *~ Otherwise, delete this declaration.
 */
export as namespace myLib;

/*~ If this module has methods, declare them as functions like so.
 */
export function myMethod(a: string): string;
export function myOtherMethod(a: number): number;

/*~ You can declare types that are available via importing the module */
export interface someType {
  name: string;
  length: number;
  extras?: string[];
}

/*~ You can declare properties of the module using const, let, or var */
export const myField: number;

/*~ If there are types, properties, or methods inside dotted names
 *~ of the module, declare them inside a 'namespace'.
 */
export namespace subProp {
  /*~ For example, given this definition, someone could write:
   *~   import { subProp } from 'yourModule';
   *~   subProp.foo();
   *~ or
   *~   import * as yourMod from 'yourModule';
   *~   yourMod.subProp.foo();
   */
  export function foo(): void;
}
```

#### Module Plugin & UMD Plugin

##### ```module-plugin.d.ts```

```typescript
// Type definitions for [~THE LIBRARY NAME~] [~OPTIONAL VERSION NUMBER~]
// Project: [~THE PROJECT NAME~]
// Definitions by: [~YOUR NAME~] <[~A URL FOR YOU~]>

/*~ This is the module plugin template file. You should rename it to index.d.ts
 *~ and place it in a folder with the same name as the module.
 *~ For example, if you were writing a file for "super-greeter", this
 *~ file should be 'super-greeter/index.d.ts'
 */

/*~ On this line, import the module which this module adds to */
import * as m from 'someModule';

/*~ You can also import other modules if needed */
import * as other from 'anotherModule';

/*~ Here, declare the same module as the one you imported above */
declare module 'someModule' {
  /*~ Inside, add new function, classes, or variables. You can use
   *~ unexported types from the original module if needed. */
  export function theNewMethod(x: m.foo): other.bar;

  /*~ You can also add new properties to existing interfaces from
   *~ the original module by writing interface augmentations */
  export interface SomeModuleOptions {
    someModuleSetting?: string;
  }

  /*~ New types can also be declared and will appear as if they
   *~ are in the original module */
  export interface MyModulePluginOptions {
    size: number;
  }
}
```

#### Global Plugin

##### ```global-plugin.d.ts```

```typescript
// Type definitions for [~THE LIBRARY NAME~] [~OPTIONAL VERSION NUMBER~]
// Project: [~THE PROJECT NAME~]
// Definitions by: [~YOUR NAME~] <[~A URL FOR YOU~]>

/*~ This template shows how to write a global plugin. */

/*~ Write a declaration for the original type and add new members.
 *~ For example, this adds a 'toBinaryString' method with to overloads to
 *~ the built-in number type.
 */
interface Number {
  toBinaryString(opts?: MyLibrary.BinaryFormatOptions): string;
  toBinaryString(callback: MyLibrary.BinaryFormatCallback, opts?: MyLibrary.BinaryFormatOptions): string;
}

/*~ If you need to declare several types, place them inside a namespace
 *~ to avoid adding too many things to the global namespace.
 */
declare namespace MyLibrary {
  type BinaryFormatCallback = (n: number) => string;
  interface BinaryFormatOptions {
    prefix?: string;
    padding: number;
  }
}
```

#### Global-modifying Modules

##### ```global-modifying-module.d.ts```

```typescript
// Type definitions for [~THE LIBRARY NAME~] [~OPTIONAL VERSION NUMBER~]
// Project: [~THE PROJECT NAME~]
// Definitions by: [~YOUR NAME~] <[~A URL FOR YOU~]>

/*~ This is the global-modifying module template file. You should rename it to index.d.ts
 *~ and place it in a folder with the same name as the module.
 *~ For example, if you were writing a file for "super-greeter", this
 *~ file should be 'super-greeter/index.d.ts'
 */

/*~ Note: If your global-modifying module is callable or constructable, you'll
 *~ need to combine the patterns here with those in the module-class or module-function
 *~ template files
 */
declare global {
  /*~ Here, declare things that go in the global namespace, or augment
   *~ existing declarations in the global namespace
   */
  interface String {
    fancyFormat(opts: StringFormatOptions): string;
  }
}

/*~ If your module exports types or values, write them as usual */
export interface StringFormatOptions {
  fancinessLevel: number;
}

/*~ For example, declaring a method on the module (in addition to its global side effects) */
export function doSomething(): void;

/*~ If your module exports nothing, you'll need this line. Otherwise, delete it */
export { };
```

### 依赖

#### 依赖global library

```typescript
/// <reference types="someLib" />
```

#### 依赖modules

```typescript
import * as moment from "moment";
```

#### 依赖UMD library

##### Global libray依赖UMD

```typescript
/// <reference types="moment" />

function getThing(): moment;
```

##### module/UMD依赖UMD

````typescript
import * as someLib from 'someLib';
````


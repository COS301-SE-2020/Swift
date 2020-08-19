
# Coding Standards

### Limited use of global variables
This is done to avoid potentially using a variable for the wrong purposes unintentionally. This could also make debugging very difficult as variables can be accessed from any scope making it harder to find the cause of a problem.

### Standard headers for different modules
For better understanding and maintenance of the code, the header of different modules should follow some standard format and information.

### Meaningful and understandable variables names.
Local variables should be named using camel case lettering starting with small letter (e.g. localData).

Global variables names should start with a capital letter (e.g. GlobalData).

Constant names should be formed using capital letters only (e.g. CONSTANTDATA).

It is better to avoid the use of digits in variable names. The names of the function should be written in camel case starting with small letters. The name of the function must describe the reason of using the function clearly and briefly.

### Indentation
Proper indentation is very important to increase the readability of the code. There must be a space after giving a comma between two function arguments. Each nested block should be properly indented and spaced. Proper Indentation should be there at the beginning and at the end of each block in the program. All braces should start from a new line and the code following the end of braces also start from a new line.

### Exception handling conventions
All functions that encountering an error condition should log the error with a descriptive message that helps the debugging by making it easier to understand where the error is coming from.

### Avoid using an identifier for multiple purposes (variable shadowing)
Each variable should be given a descriptive and meaningful name indicating the reason behind using it. This is not possible if an identifier is used for multiple purposes and thus it can lead to confusion to the reader. Moreover, it leads to more difficulty during future enhancements.

### Code should be well documented
The code should be properly commented for understanding easily. Comments regarding the statements increase the understandability of the code.

### Length of functions should be short
Lengthy functions are very difficult to understand. That’s why functions should be small enough to carry out small work and lengthy functions should be broken into small ones for completing small tasks.

### Lines should be a maximum of 100 characters
To improve the readability of the code, lines should not be longer that 100 characters to avoid code overflow which could make it harder to follow.

### ESLint
To help enforce the coding standards mentioned above, eslint is used to check the code for violations and fix it where possible. Bugs start from badly written code therefor enforcing coding standards makes it easier to spot any bugs before they cause problems in the production environment.
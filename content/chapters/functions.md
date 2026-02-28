# Functions

Functions are reusable blocks of code that perform specific tasks. They help organize complex algorithms into smaller, more manageable parts.

## Defining a Function

Use the `function` and `end function` keywords to define your logic. Here is an implementation of the **Insertion Sort** algorithm:

```stepcode
function insertion_sort(arr)
    for i = 2 to len(arr) do
        key := arr[i]
        j := i - 1
        while j > 0 and arr[j] > key do
            arr[j + 1] := arr[j]
            j := j - 1
        end while
        arr[j + 1] := key
    end for
    return arr
end function

arr := insertion_sort([5, 2, 4, 6, 1, 3])
```

## Recursion

**stepcode** supports recursive function calls, where a function calls itself to solve smaller instances of the same problem. A classic example is the **Factorial** function:

```stepcode
function factorial(n)
    if n <= 1 then
        return 1
    else
        return n * factorial(n - 1)
    end if
end function

result := factorial(5)
```

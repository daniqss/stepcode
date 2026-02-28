# Functions

Define a function as follows:

```pseudocode
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

Recursion is allowed:

```pseudocode
function factorial(n)
    if n <= 1 then
        return 1
    else
        return n * factorial(n - 1)
    end if
end function

result := factorial(5)
```

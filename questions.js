/**
 * questions.js
 * -----------------------------------------------------------------------
 * All event content lives here. To add or replace a question, edit the
 * objects below — nothing else in the app needs to change.
 *
 * This is a single continuous list of 9 questions, presented in order:
 * Easy, Medium, Hard — repeated three times
 * (Q1 Easy, Q2 Medium, Q3 Hard, Q4 Easy, Q5 Medium, Q6 Hard, Q7 Easy, Q8 Medium, Q9 Hard).
 *
 * Each question object:
 * {
 *   id:          number  (display order, 1–9)
 *   difficulty:  "Easy" | "Medium" | "Hard"
 *   unit:        string  (topic / syllabus unit shown under the badge)
 *   question:    string  (the instruction shown above the code)
 *   code:        string  (C source, template literal so indentation is kept)
 *   answer:      string  (the exact correct output)
 *   explanation: string  (short reasoning shown with the answer)
 * }
 * -----------------------------------------------------------------------
 */

const predictionQuestions = [
  // ---------------------------------------------------------- ROUND 1: EASY
  {
    id: 1,
    difficulty: "Easy",
    unit: "Unit 1: Operators & Decision Making",
    question: "Predict the exact output of the following C program.",
    code: `#include <stdio.h>

int main() {
    int x = 5;
    if (x = 0) {
        printf("A");
    } else {
        printf("B%d", x);
    }
    return 0;
}`,
    answer: "B0",
    explanation:
      "Inside the if statement, x = 0 is an assignment, not a comparison (==). It assigns 0 to x. Because 0 is treated as false in C, the if block is skipped, and the else block executes, printing B followed by the new value of x, which is 0.",
  },

  // -------------------------------------------------------- ROUND 1: MEDIUM
  {
    id: 2,
    difficulty: "Medium",
    unit: "Unit 2: Loop Control Statements",
    question: "Predict the exact output of the following C program.",
    code: `#include <stdio.h>

int main() {
    int sum = 0;
    for (int i = 1; i <= 5; i++) {
        if (i == 3) continue;
        sum = sum + i;
    }
    printf("%d", sum);
    return 0;
}`,
    answer: "12",
    explanation:
      "The loop runs from 1 to 5. When i == 3, continue skips the addition for that iteration. Therefore: 1 + 2 + 4 + 5 = 12.",
  },

  // ---------------------------------------------------------- ROUND 1: HARD
  {
    id: 3,
    difficulty: "Hard",
    unit: "Unit 5: Structures and Pointers",
    question: "Predict the exact output of the following C program.",
    code: `#include <stdio.h>

struct Point {
    int x;
    int y;
};

int main() {
    struct Point arr[3] = {{1, 2}, {3, 4}, {5, 6}};
    struct Point *ptr = arr;

    ptr++;

    printf("%d %d", ptr->y, (ptr+1)->x);
    return 0;
}`,
    answer: "4 5",
    explanation:
      "ptr initially points to arr[0]. ptr++ moves it to arr[1]. ptr->y accesses the y value of arr[1], which is 4. (ptr+1)->x accesses the x value of arr[2], which is 5.",
  },

  // ---------------------------------------------------------- ROUND 2: EASY
  {
    id: 4,
    difficulty: "Easy",
    unit: "Unit 1: Unary Operators",
    question: "Predict the exact output of the following C program.",
    code: `#include <stdio.h>

int main() {
    int a = 3;
    printf("%d", ++a);
    printf("%d", a++);
    printf("%d", a);
    return 0;
}`,
    answer: "445",
    explanation:
      "++a changes a to 4 and prints 4. a++ prints the current value 4 and then increments a to 5. The final printf prints 5. There are no spaces between the outputs, so the final output is 445.",
  },

  // -------------------------------------------------------- ROUND 2: MEDIUM
  {
    id: 5,
    difficulty: "Medium",
    unit: "Unit 4: Storage Classes",
    question: "Predict the exact output of the following C program.",
    code: `#include <stdio.h>

void counter() {
    static int count = 10;
    count += 5;
    printf("%d ", count);
}

int main() {
    counter();
    counter();
    return 0;
}`,
    answer: "15 20",
    explanation:
      "The static variable count is initialized only once and retains its value between function calls. The first call changes 10 to 15. The second call changes 15 to 20.",
  },

  // ---------------------------------------------------------- ROUND 2: HARD
  {
    id: 6,
    difficulty: "Hard",
    unit: "Unit 3 & 4: Arrays and Pointer Arithmetic",
    question: "Predict the exact output of the following C program.",
    code: `#include <stdio.h>

int main() {
    int arr[] = {100, 200, 300, 400};
    int *p = arr;

    *(p + 2) += 50;

    printf("%d ", *p++);
    printf("%d", *++p);
    return 0;
}`,
    answer: "100 350",
    explanation:
      "*(p + 2) modifies the third element from 300 to 350. *p++ prints 100 and then moves p to the next element. *++p moves p forward again to the third element, whose value is now 350.",
  },

  // ---------------------------------------------------------- ROUND 3: EASY
  {
    id: 7,
    difficulty: "Easy",
    unit: "Unit 3: Strings Initialization and Handling",
    question: "Predict the exact output of the following C program.",
    code: `#include <stdio.h>

int main() {
    char str[] = "Competition";
    str[4] = '\\0';
    printf("%s", str);
    return 0;
}`,
    answer: "Comp",
    explanation:
      "The string originally contains \"Competition\". Index 4 is replaced with the null character '\\0'. printf(\"%s\") stops reading when it reaches the null terminator, so only \"Comp\" is printed.",
  },

  // -------------------------------------------------------- ROUND 3: MEDIUM
  {
    id: 8,
    difficulty: "Medium",
    unit: "Unit 4: Parameter Passing",
    question: "Predict the exact output of the following C program.",
    code: `#include <stdio.h>

void modify(int *a, int b) {
    *a = *a + 5;
    b = b + 5;
}

int main() {
    int x = 10, y = 20;
    modify(&x, y);
    printf("%d %d", x, y);
    return 0;
}`,
    answer: "15 20",
    explanation:
      "x is passed by address using &x, so modifying *a changes the original x to 15. y is passed by value, so modifying b changes only the local copy. The original y remains 20.",
  },

  // ---------------------------------------------------------- ROUND 3: HARD
  {
    id: 9,
    difficulty: "Hard",
    unit: "Unit 2: Decision Making and Loops",
    question: "Predict the exact output of the following C program.",
    code: `#include <stdio.h>

int main() {
    int i = 1, sum = 0;
    while (i <= 3) {
        switch (i) {
            case 1: sum += 1;
            case 2: sum += 2; break;
            case 3: sum += 3;
        }
        i++;
    }
    printf("%d", sum);
    return 0;
}`,
    answer: "8",
    explanation:
      "When i = 1, case 1 executes and falls through to case 2 because there is no break after case 1. The sum becomes 3. When i = 2, case 2 adds 2, making the sum 5. When i = 3, case 3 adds 3, making the final sum 8.",
  },
];

/**
 * PROGRAMMING ROUND
 * -----------------------------------------------------------------------
 * Flat difficulty (no Easy/Medium/Hard tags). The problem statement is
 * shown on screen; the code stays hidden until the host clicks
 * "Show Answer", which reveals the model solution below as the reference
 * for scoring.
 *
 * Each question object:
 * {
 *   id:       number  (display order, 1–6)
 *   title:    string  (short problem name)
 *   question: string  (problem statement shown to participants)
 *   code:     string  (model-answer C source, revealed on request)
 * }
 * -----------------------------------------------------------------------
 */
const programmingQuestions = [
  {
    id: 1,
    title: "The Manual String Reversal",
    question:
      "Write a function void reverse_string(char str[]) that reverses a given string in place, without using any built-in reverse function.",
    code: `#include <stdio.h>
#include <string.h>

// Reverses the string in-place by swapping characters
void reverse_string(char str[]) {
    int length = strlen(str);
    for (int i = 0; i < length / 2; i++) {
        char temp = str[i];
        str[i] = str[length - i - 1];
        str[length - i - 1] = temp;
    }
}`,
  },

  {
    id: 2,
    title: "The Palindrome Number Checker",
    question:
      "Write a function bool is_palindrome(int num) that returns true if the given integer reads the same forwards and backwards, and false otherwise.",
    code: `#include <stdio.h>
#include <stdbool.h>

// Returns true (1) if palindrome, false (0) if not
bool is_palindrome(int num) {
    int original_num = num;
    int reversed_num = 0;

    while (num > 0) {
        int digit = num % 10;
        reversed_num = (reversed_num * 10) + digit;
        num = num / 10;
    }

    return original_num == reversed_num;
}`,
  },

  {
    id: 3,
    title: "Factorial Using Recursion",
    question:
      "Write a recursive function long long recursive_factorial(int n) that returns the factorial of a non-negative integer n.",
    code: `#include <stdio.h>

// Using long long to prevent integer overflow for larger factorials
long long recursive_factorial(int n) {
    if (n == 0 || n == 1) {
        return 1;
    } else {
        return n * recursive_factorial(n - 1);
    }
}`,
  },

  {
    id: 4,
    title: "Find the Second Largest Number",
    question:
      "Write a function int second_largest(int arr[], int size) that returns the second largest distinct value in an array of integers.",
    code: `#include <stdio.h>
#include <limits.h> // Required for INT_MIN

int second_largest(int arr[], int size) {
    int largest = INT_MIN;
    int second = INT_MIN;

    for (int i = 0; i < size; i++) {
        if (arr[i] > largest) {
            second = largest;
            largest = arr[i];
        } else if (arr[i] > second && arr[i] != largest) {
            second = arr[i];
        }
    }

    return second;
}`,
  },

  {
    id: 5,
    title: "Vowels and Consonants Counter",
    question:
      "Write a function void count_letters(char str[]) that counts and prints the number of vowels and consonants in a given string, ignoring any non-alphabetic characters.",
    code: `#include <stdio.h>
#include <ctype.h> // Required for isalpha() and tolower()

void count_letters(char str[]) {
    int v_count = 0;
    int c_count = 0;

    // Loop continues until it hits the null terminator '\\0'
    for (int i = 0; str[i] != '\\0'; i++) {
        if (isalpha(str[i])) { // Only check alphabetical characters
            char ch = tolower(str[i]);
            if (ch == 'a' || ch == 'e' || ch == 'i' || ch == 'o' || ch == 'u') {
                v_count++;
            } else {
                c_count++;
            }
        }
    }

    printf("Vowels: %d, Consonants: %d\\n", v_count, c_count);
}`,
  },

  {
    id: 6,
    title: "Find the Missing Number in a Sequence",
    question:
      "Write a function int find_missing_number(int arr[], int size, int n) that finds the single missing number from an array containing size distinct integers taken from the range 1 to n.",
    code: `#include <stdio.h>

// 'size' is the length of the array, 'n' is the maximum number in the sequence
int find_missing_number(int arr[], int size, int n) {
    // Mathematical formula for the sum of the first N numbers
    int expected_sum = n * (n + 1) / 2;
    int actual_sum = 0;

    for (int i = 0; i < size; i++) {
        actual_sum += arr[i];
    }

    return expected_sum - actual_sum;
}`,
  },
];

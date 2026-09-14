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

const questions = [
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

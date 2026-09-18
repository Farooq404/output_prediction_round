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

// Round 1 (Medium pair): Q2, Q4 — positions 1–2
// Round 2 (Hard pair): Q1, Q9 — positions 3–4
const predictionQuestions = [
  // -------------------------------------------------------- ROUND 1: QUESTION 1 (id: 2)
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

  // -------------------------------------------------------- ROUND 1: QUESTION 2 (id: 4)
  {
    id: 4,
    difficulty: "Medium",
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

  // -------------------------------------------------------- ROUND 2: QUESTION 1 (id: 1)
  {
    id: 1,
    difficulty: "Hard",
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

  // -------------------------------------------------------- ROUND 2: QUESTION 2 (id: 9)
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
 * Flat difficulty. The problem statement, edge cases, and test cases are
 * shown on screen; the C solution stays hidden until the user clicks
 * "Reveal Answer".
 *
 * Each question has a 10-minute time limit.
 * -----------------------------------------------------------------------
 */
const programmingQuestions = [
  // -------------------------------------------------------- MAIN QUESTION 1 (id: 4)
  {
    id: 4,
    title: "Linear Search for a Key",
    difficulty: "Medium (Beginner Level)",
    timeLimit: "10 Minutes",
    question: `<div class="q-prob-statement">
  <strong>Problem Statement</strong>
  <p>Write a C program to search for a specific target value (key) in an array.</p>
  <p>If the key is found, print its index. Otherwise, print that the element is not present.</p>
</div>

<div class="q-section">
  <p class="q-section-title">Edge Cases</p>
  <ul>
    <li>Key is at the first position (index 0).</li>
    <li>Key is at the last position.</li>
    <li>Key is not present.</li>
    <li>Duplicate values — return the first occurrence.</li>
  </ul>
</div>

<div class="q-section">
  <p class="q-section-title">Test Cases</p>
  <div class="test-cases-grid">
    <div class="test-case-item">
      <strong>Test Case 1</strong>
      <div class="tc-block"><span>Input:</span><pre>5
10 20 30 40 50
30</pre></div>
      <div class="tc-block"><span>Expected Output:</span><pre>Element found at index 2</pre></div>
    </div>
    <div class="test-case-item">
      <strong>Test Case 2</strong>
      <div class="tc-block"><span>Input:</span><pre>4
5 10 15 20
5</pre></div>
      <div class="tc-block"><span>Expected Output:</span><pre>Element found at index 0</pre></div>
    </div>
    <div class="test-case-item">
      <strong>Test Case 3</strong>
      <div class="tc-block"><span>Input:</span><pre>4
5 10 15 20
20</pre></div>
      <div class="tc-block"><span>Expected Output:</span><pre>Element found at index 3</pre></div>
    </div>
    <div class="test-case-item">
      <strong>Test Case 4</strong>
      <div class="tc-block"><span>Input:</span><pre>4
5 10 15 20
25</pre></div>
      <div class="tc-block"><span>Expected Output:</span><pre>Element not found in the array.</pre></div>
    </div>
    <div class="test-case-item">
      <strong>Test Case 5</strong>
      <div class="tc-block"><span>Input:</span><pre>5
10 20 10 30 10
10</pre></div>
      <div class="tc-block"><span>Expected Output:</span><pre>Element found at index 0</pre></div>
    </div>
  </div>
</div>`,
    code: `#include <stdio.h>

int main() {
    int n, i, key, found = 0;
    int arr[100];

    printf("Enter number of elements: ");
    if (scanf("%d", &n) != 1 || n <= 0) return 0;

    printf("Enter elements: ");
    for (i = 0; i < n; i++) {
        scanf("%d", &arr[i]);
    }

    printf("Enter element to search: ");
    if (scanf("%d", &key) != 1) return 0;

    for (i = 0; i < n; i++) {
        if (arr[i] == key) {
            printf("Element found at index %d\\n", i);
            found = 1;
            break;
        }
    }

    if (!found) {
        printf("Element not found in the array.\\n");
    }

    return 0;
}`,
  },

  // -------------------------------------------------------- MAIN QUESTION 2 (id: 2)
  {
    id: 2,
    title: "Count Even and Odd Numbers",
    difficulty: "Easy",
    timeLimit: "10 Minutes",
    question: `<div class="q-prob-statement">
  <strong>Problem Statement</strong>
  <p>Write a C program to count how many even and odd numbers are present in a given array of integers.</p>
</div>

<div class="q-section">
  <p class="q-section-title">Edge Cases</p>
  <ul>
    <li>All numbers are even.</li>
    <li>All numbers are odd.</li>
    <li>0 should be counted as even.</li>
    <li>Negative numbers such as -3 and -4.</li>
  </ul>
</div>

<div class="q-section">
  <p class="q-section-title">Test Cases</p>
  <div class="test-cases-grid">
    <div class="test-case-item">
      <strong>Test Case 1</strong>
      <div class="tc-block"><span>Input:</span><pre>5
1 2 3 4 5</pre></div>
      <div class="tc-block"><span>Expected Output:</span><pre>Even numbers count: 2
Odd numbers count: 3</pre></div>
    </div>
    <div class="test-case-item">
      <strong>Test Case 2</strong>
      <div class="tc-block"><span>Input:</span><pre>4
2 4 6 8</pre></div>
      <div class="tc-block"><span>Expected Output:</span><pre>Even numbers count: 4
Odd numbers count: 0</pre></div>
    </div>
    <div class="test-case-item">
      <strong>Test Case 3</strong>
      <div class="tc-block"><span>Input:</span><pre>4
1 3 5 7</pre></div>
      <div class="tc-block"><span>Expected Output:</span><pre>Even numbers count: 0
Odd numbers count: 4</pre></div>
    </div>
    <div class="test-case-item">
      <strong>Test Case 4</strong>
      <div class="tc-block"><span>Input:</span><pre>4
0 -3 -4 7</pre></div>
      <div class="tc-block"><span>Expected Output:</span><pre>Even numbers count: 2
Odd numbers count: 2</pre></div>
    </div>
  </div>
</div>`,
    code: `#include <stdio.h>

int main() {
    int n, i;
    int arr[100];
    int evenCount = 0, oddCount = 0;

    printf("Enter number of elements: ");
    if (scanf("%d", &n) != 1 || n <= 0) return 0;

    printf("Enter elements: ");
    for (i = 0; i < n; i++) {
        scanf("%d", &arr[i]);

        if (arr[i] % 2 == 0) {
            evenCount++;
        } else {
            oddCount++;
        }
    }

    printf("Even numbers count: %d\\n", evenCount);
    printf("Odd numbers count: %d\\n", oddCount);

    return 0;
}`,
  },

  // -------------------------------------------------------- BACKUP QUESTION 1 (id: 1)
  {
    id: 1,
    title: "Find the Maximum and Minimum in an Array",
    difficulty: "Very Easy",
    timeLimit: "10 Minutes",
    question: `<div class="q-prob-statement">
  <strong>Problem Statement</strong>
  <p>Write a C program that takes an array of integers and finds both the maximum and minimum values in the array.</p>
</div>

<div class="q-section">
  <p class="q-section-title">Edge Cases</p>
  <ul>
    <li>Single element array: <code>[5]</code> — maximum and minimum should both be 5.</li>
    <li>All identical elements: <code>[3, 3, 3, 3]</code>.</li>
    <li>Negative numbers: <code>[-5, -1, -10, -3]</code>.</li>
  </ul>
</div>

<div class="q-section">
  <p class="q-section-title">Test Cases</p>
  <div class="test-cases-grid">
    <div class="test-case-item">
      <strong>Test Case 1</strong>
      <div class="tc-block"><span>Input:</span><pre>5
10 5 8 2 15</pre></div>
      <div class="tc-block"><span>Expected Output:</span><pre>Maximum: 15
Minimum: 2</pre></div>
    </div>
    <div class="test-case-item">
      <strong>Test Case 2</strong>
      <div class="tc-block"><span>Input:</span><pre>1
5</pre></div>
      <div class="tc-block"><span>Expected Output:</span><pre>Maximum: 5
Minimum: 5</pre></div>
    </div>
    <div class="test-case-item">
      <strong>Test Case 3</strong>
      <div class="tc-block"><span>Input:</span><pre>4
3 3 3 3</pre></div>
      <div class="tc-block"><span>Expected Output:</span><pre>Maximum: 3
Minimum: 3</pre></div>
    </div>
    <div class="test-case-item">
      <strong>Test Case 4</strong>
      <div class="tc-block"><span>Input:</span><pre>4
-5 -1 -10 -3</pre></div>
      <div class="tc-block"><span>Expected Output:</span><pre>Maximum: -1
Minimum: -10</pre></div>
    </div>
  </div>
</div>`,
    code: `#include <stdio.h>

int main() {
    int n, i;
    int arr[100];

    printf("Enter number of elements: ");
    if (scanf("%d", &n) != 1 || n <= 0) return 0;

    printf("Enter elements: ");
    for (i = 0; i < n; i++) {
        scanf("%d", &arr[i]);
    }

    int max = arr[0];
    int min = arr[0];

    for (i = 1; i < n; i++) {
        if (arr[i] > max) {
            max = arr[i];
        }
        if (arr[i] < min) {
            min = arr[i];
        }
    }

    printf("Maximum: %d\\n", max);
    printf("Minimum: %d\\n", min);

    return 0;
}`,
  },

  // -------------------------------------------------------- BACKUP QUESTION 2 (id: 3)
  {
    id: 3,
    title: "Factorial Calculation",
    difficulty: "Easy",
    timeLimit: "10 Minutes",
    question: `<div class="q-prob-statement">
  <strong>Problem Statement</strong>
  <p>Write a C program to calculate the factorial of a given non-negative integer N.</p>
  <p><em>Remember: 0! = 1</em></p>
</div>

<div class="q-section">
  <p class="q-section-title">Edge Cases</p>
  <ul>
    <li>Input 0 should produce 1.</li>
    <li>Input 1 should produce 1.</li>
    <li>Small values such as 2 and 5.</li>
    <li>Use an appropriate integer type to reduce overflow issues.</li>
  </ul>
</div>

<div class="q-section">
  <p class="q-section-title">Test Cases</p>
  <div class="test-cases-grid">
    <div class="test-case-item">
      <strong>Test Case 1</strong>
      <div class="tc-block"><span>Input:</span><pre>5</pre></div>
      <div class="tc-block"><span>Expected Output:</span><pre>Factorial of 5 = 120</pre></div>
    </div>
    <div class="test-case-item">
      <strong>Test Case 2</strong>
      <div class="tc-block"><span>Input:</span><pre>0</pre></div>
      <div class="tc-block"><span>Expected Output:</span><pre>Factorial of 0 = 1</pre></div>
    </div>
    <div class="test-case-item">
      <strong>Test Case 3</strong>
      <div class="tc-block"><span>Input:</span><pre>1</pre></div>
      <div class="tc-block"><span>Expected Output:</span><pre>Factorial of 1 = 1</pre></div>
    </div>
    <div class="test-case-item">
      <strong>Test Case 4</strong>
      <div class="tc-block"><span>Input:</span><pre>10</pre></div>
      <div class="tc-block"><span>Expected Output:</span><pre>Factorial of 10 = 3628800</pre></div>
    </div>
  </div>
</div>`,
    code: `#include <stdio.h>

int main() {
    int n, i;
    unsigned long long factorial = 1;

    printf("Enter a non-negative integer: ");
    if (scanf("%d", &n) != 1 || n < 0) return 0;

    for (i = 1; i <= n; i++) {
        factorial *= i;
    }

    printf("Factorial of %d = %llu\\n", n, factorial);

    return 0;
}`,
  },
];


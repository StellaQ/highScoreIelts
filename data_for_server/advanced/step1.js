const prompt_basic_questions = `
# IELTS Speaking Part 2 AI Question Generator System

## Purpose
Generate modified versions of IELTS Speaking Part 2 questions while maintaining the original question's structure and intent.

## Output Structure
The output should be a JSON object with the following format:

\`\`\`json
{
  "ai_questions": [{
    "topicName_real": "Original topic name in natural language",
    "topicName_rewrite": "Rewritten version of the topic",
    "points_original": [
      {"Original point 1"},
      {"Original point 2"},
      {"Original point 3"}
    ],
    "points_rewrite": [
      {"Rewritten version of point 1"},
      {"Rewritten version of point 2"},
      {"Rewritten version of point 3"}
    ]
  }]
}
\`\`\`

## Example Demonstration

### Input:
\`\`\`
Describe a person you know who likes to talk a lot.
You should say:
who this person is
how you know this person
what this person usually talks about
and explain how you felt about him/her
\`\`\`

### Output:
\`\`\`json
{
  "ai_questions": [{
    "topicName_real": "a person you know who likes to talk a lot",
    "topicName_rewrite": "someone in your life who is particularly talkative",
    "points_original": [
      {"who this person is"},
      {"how you know this person"},
      {"what this person usually talks about"},
      {"and explain how you felt about him/her"}
    ],
    "points_rewrite": [
      {"identify this individual"},
      {"describe your relationship with them"},
      {"explain the typical subjects of their conversations"},
      {"share your personal impressions of this person"}
    ]
  }]
}
\`\`\`

## Guidelines
1. Maintain the original meaning while varying the wording
2. Keep the same number of points
3. Ensure rewritten versions are natural and appropriate for IELTS Speaking Part 2
4. Use complete phrases rather than fragments for better readability
`;

module.exports = prompt_basic_questions;
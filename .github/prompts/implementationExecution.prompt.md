---
agent: agent
description: 'Prompt to implement tasks based on a detailed implementation plan, following a structured execution approach to ensure quality and completeness.'
model: Claude Haiku 4.5 (copilot)
---

# Implementation Plan Execution Prompt

Execute the implementation plan systematically using this approach:

## Instructions

1. **Work sequentially** - Complete tasks in dependency order, never skip ahead
2. **Use PLAN > SEARCH > ADJUST > EXECUTE > VALIDATE** for each task:
   - **PLAN**: Understand the task and requirements
   - **SEARCH**: Research existing code patterns if needed
   - **ADJUST**: Adapt approach based on findings
   - **EXECUTE**: Implement the solution
   - **VALIDATE**: Test against acceptance criteria
3. **Mark checkboxes** - Update [ ] to ✅ after completing each implementation step
4. **Validate acceptance criteria** - After all steps, check each acceptance criteria and mark checkboxes
5. **Add development summary** - At the end, document what was built and how

## Execution Rules

- Follow existing project patterns and conventions
- Implement behind feature toggles for safe deployment
- Maintain backward compatibility
- Use comprehensive error handling
- Test thoroughly before marking complete

## Final Deliverable

Create a "Development Summary" section at the end explaining:
- What was implemented
- Key technical decisions made
- Components created/modified
- Testing approach used
- Any limitations or future enhancements

Execute the implementation plan now.
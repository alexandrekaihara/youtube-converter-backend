---
agent: agent
description: Create a comprehensive implementation plan from requirements document through extensive research
model: Claude Haiku 4.5 (copilot)
argument-hint: 'High-level task requirements'
---

# Create Implementation Plan from Requirements

You are about to create a comprehensive implementation plan based on a feature requirements document (typically generated using elaborateFeature.md). This involves extensive research, analysis, and planning to produce a detailed roadmap for execution broken down into specific, actionable tasks. Create a markdown file to elaborate this implementation plan.

## Step 1: Read and Analyze Requirements

Read the requirements document from: ARGUMENTS

Extract and understand:
- Core feature requests and objectives
- Technical requirements and constraints
- Expected outcomes and success criteria
- Integration points with existing systems
- Performance and scalability requirements
- Any specific technologies or frameworks mentioned
- User experience and workflow requirements
- Security and compliance considerations
- Deployment and operational requirements
- Read the necessary figma files using the Framelink Figma MCP to get information of front-end mocks if needed for the task inserted

## Step 2: Planning and Design

Based on your research, create a detailed plan that includes:

### 2.1 Technical Architecture

Define the technical approach:
- Component structure and organization
- Data flow and state management
- API design (if applicable)
- Integration patterns
- Security implementation approach

### 2.2 Task Breakdown

Create a prioritized list of implementation tasks considering the technical details on the feature document read following this template:

'''
**[] Task N: [Task Goal]**
- **Description**: [Detailed explanation of what needs to be accomplished]
- **Implementation Steps**
  - [] Create `[repository-name]/[file-path]` - [Brief description of purpose]
  - [] Implement method myMethod that reads all the entries on entity MyEntity and returns a list
  - [] Edit `[repository-name]/[file-path]` - [What changes are needed]
- **Acceptance Criteria**:
  - [] [Specific conditions that must be met for task completion 1]
  - [] [Specific conditions that must be met for task completion 2]
'''

#### Task Guidelines:
- **Tasks should ALWAYS** consider the technical details.
- Each task should be **specific and actionable** (not too high-level)
- Tasks should be **appropriately sized** (1-3 days of work ideally)
- **Dependencies** between tasks should be considered. ALWAYS suggest a task order that dont depend on future tasks
- Each step should be **clear, actionable and atomic changes**
- **Group related changes together** by user context rather than by technical layer

#### Iterative Phase Planning

**CRITICAL PROCESS**: Before creating tasks, request Product Owner input:

1. **Request Phase Definition**: Ask Product Owner to provide the specific phases they want implemented
2. **Wait for Phase Input**: Do not proceed with task creation until phases are confirmed
3. **Iterative Task Creation**: Generate tasks phase by phase, waiting for approval between phases
4. **Validate Dependencies**: Ensure each phase builds logically on previous phases

**Example Request Format**:
```
I need to understand the implementation phases from the Product Owner perspective. 
Please provide the phases you want me to focus on, and I'll create detailed tasks 
for each phase iteratively. 

Phase 1: [Waiting for your input]
Phase 2: [Waiting for your input] 
Phase 3: [Waiting for your input]
etc.

I'll wait for your phase definition before proceeding with task creation.
```

### 4.4 Risk Assessment and Mitigation
- Identify potential technical risks
- Propose mitigation strategies
- Highlight critical dependencies

### 4.6 Deployment and Operations
- Deployment strategy and phases
- Configuration management
- Monitoring and alerting requirements
- Rollback procedures

## 5. Refine implementation plan
Now that you generated the implementation plan. Read again the feature document on the Technical Architecture and do a review on the the implementation plan to refine it and add missing tasks, steps and details.

## Guidelines for Creating Quality Tasks

### Do Include:
- Clear, actionable objectives
- **Repository context for every file change** (e.g., `category-taxonomy/db/schema.cds`, `category-plan-ui/webapp/controller/`)
- Specific file changes with purpose
- Realistic dependencies
- Measurable acceptance criteria
- Technical implementation notes
- Testing requirements
- **Cross-repository coordination notes** when changes span multiple repositories

### Avoid:
- Overly granular implementation steps
- Tasks that are too broad or vague
- Missing dependency relationships
- Unclear acceptance criteria
- Tasks without clear deliverables
- **File paths without repository context** (always specify which repository)
- **Cross-repository changes without coordination notes**
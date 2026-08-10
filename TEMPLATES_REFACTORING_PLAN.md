# Templates Refactoring Plan

## Problem Analysis
Current templates (经典教学, 故事魔法, 科学实验室, 商务精英) are fundamentally identical in content structure:
- **All templates use exactly the same slide types**: cover → warmup → vocabulary → grammar → game → summary → homework
- **Slide sequence is identical** (7 slides in same order)
- **Knowledge presentation flow is the same** despite different discipline focus
- **Only visual elements differ**: color_schemes, fonts, background aesthetics

## Solution: Real Template Differentiation

### 1. Classic Learning Template (经典教学)
**Traditional pedagogy** - Direct instruction flow:
```
cover → overview → knowledge → practice → review → homework
```
- **Slide types**: cover, overview, knowledge, practice, review, homework (6 slides)
- **Voice**: Teacher-centered, clear presentation
- **Visual**: Structured, hierarchical layout
- **Best for**: Traditional classroom settings, clear knowledge transfer

### 2. Story Magic Template (故事魔法)
**Narrative-based learning** - Story-first approach:
```
cover → hook → story → exploration → activity → reflection → homework
```
- **Slide types**: cover, hook, story, exploration, activity, reflection, homework (7 slides)
- **Voice**: Engaging, story-like, conversational
- **Visual**: Rich imagery, flowing layout, emotional appeal
- **Best for**: Language learning, creative subjects, student engagement

### 3. Science Lab Template (科学实验室)
**Inquiry-based learning** - Problem-solving flow:
```
cover → question → hypothesis → experiment → analysis → conclusion → homework
```
- **Slide types**: cover, question, hypothesis, experiment, analysis, conclusion, homework (7 slides)
- **Voice**: Analytical, investigative, data-driven
- **Visual**: Technical diagrams, charts, experimental setups
- **Best for**: Science, math, analytical subjects

### 4. Business Elite Template (商务精英)
**Case-study based learning** - Practical application:
```
cover → case → problem → solution → presentation → feedback → homework
```
- **Slide types**: cover, case, problem, solution, presentation, feedback, homework (7 slides)
- **Voice**: Professional, persuasive, presentation-focused
- **Visual**: Clean layouts, business graphics, infographics
- **Best for**: Business, presentation skills, professional development

## Implementation Plan

### Frontend Changes
1. **Template Configuration** (`frontend/src/templates/`):
```javascript
const TEMPLATES = {
  'classic': {
    name: '经典教学',
    description: '传统授课模式，知识传递有序',
    slideTypes: ['cover', 'overview', 'knowledge', 'practice', 'review', 'homework'],
    voiceStyle: 'teacher-centered',
    visualTheme: 'structured-hierarchical'
  },
  'story-magic': {
    name: '故事魔法',
    description: '叙事驱动的学习，激发想象力',
    slideTypes: ['cover', 'hook', 'story', 'exploration', 'activity', 'reflection', 'homework'],
    voiceStyle: 'narrative-engaging',
    visualTheme: 'rich-imaging-flowing'
  },
  'science-lab': {
    name: '科学实验室',
    description: '探究式学习，培养思维能力',
    slideTypes: ['cover', 'question', 'hypothesis', 'experiment', 'analysis', 'conclusion', 'homework'],
    voiceStyle: 'analytical-investigative',
    visualTheme: 'technical-charts-diagrams'
  },
  'business-elite': {
    name: '商务精英',
    description: '案例式学习，提升实践能力',
    slideTypes: ['cover', 'case', 'problem', 'solution', 'presentation', 'feedback', 'homework'],
    voiceStyle: 'professional-presentation',
    visualTheme: 'clean-infographics-business'
  }
};
```

2. **Template-Aware Content Generation**:
   - Generate different narrative structures based on template
   - Adjust voice and tone according to teaching style
   - Create specialized slide types for each template

3. **Dynamic Content Assembly**:
   - Create template-specific content building blocks
   - Ensure smooth handoff between different pedagogical approaches

### Backend Changes
1. **Enhanced Template System** (`frontend/functions/api/[[catchall]].js`):
   - Move from color_scheme-based to pedagogy-based classification
   - Implement template-aware content generation
   - Support custom slide sequences and layouts

2. **Template-Specific AI Prompts**:
   - Generate content tailored to teaching style
   - Include template-specific instructional strategies
   - Adjust vocabulary and complexity based on template

### Content Generation Differences

**1. Knowledge Structure**:
- **Classic**: Linear, hierarchical knowledge organization
- **Story**: Narrative, contextual knowledge presentation
- **Science**: Conceptual, relationship-focused knowledge
- **Business**: Case-based, application-first knowledge

**2. Student Interaction**:
- **Classic**: Teacher questions, student answers
- **Story**: Student imagination, personal connections
- **Science**: Student hypotheses, experimental design
- **Business**: Student proposals, peer feedback

**3. Assessment Methods**:
- **Classic**: Recall and application
- **Story**: Creative expression and personal reflection
- **Science**: Analytical thinking and conclusion drawing
- **Business**: Presentation and practical demonstration

## Testing Framework

### Template Validation
1. **Template Detection**: Verify template consistency across deployment
2. **Content Generation**: Test template-specific content patterns
3. **Visual Differentiation**: Validate template-specific aesthetics
4. **User Experience**: Test template-appropriate user flows

### Integration Testing
1. **Cross-Template Compatibility**: Ensure different templates work seamlessly
2. **Responsive Design**: Test templates on different devices
3. **Performance**: Compare template loading and rendering speeds

## Deployment Strategy

### Phase 1: Core Template Implementation
- Implement basic template structure
- Ensure backward compatibility
- Launch with minimal template options

### Phase 2: Advanced Template Features
- Add advanced visual elements
- Implement template-specific interactions
- Add template management UI

### Phase 3: Template Optimization
- Performance optimization for all templates
- Template-specific analytics and insights
- Advanced template customization options

## Expected Outcomes

### Pedagogical Impact
1. **Different Learning Approaches**: Four distinct teaching methodologies
2. **Enhanced Student Engagement**: Template-appropriate content styles
3. **Improved Learning Outcomes**: Tailored instruction for different learning types

### Technical Benefits
1. **Modular Architecture**: Easily extendable template system
2. **Content Personalization**: Template-aware content generation
3. **Visual Diversity**: Meaningful aesthetic and structural differences

### User Experience
1. **Clear Template Selection**: Intuitive template choice interface
2. **Template Preview**: Visual representation of template styles
3. **Adaptive Content**: Content that matches teaching approach

## Next Steps

1. **Immediate**: Implement template detection and basic structure
2. **Short-term**: Complete template-specific content generation
3. **Medium-term**: Add advanced template features and optimization
4. **Long-term**: Full template ecosystem with advanced customization

This refactoring ensures that each template provides truly different teaching approaches, knowledge presentation methods, and student engagement strategies - going far beyond mere aesthetic changes to create meaningful educational differentiation.
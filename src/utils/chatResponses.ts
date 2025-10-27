// Standard prompts for the guided conversation flow
export const standardPrompts = {
  1: `Let's work on feedback for Standard 1: Professionalism & Responsibility

Please provide feedback on the following areas:

• Does the learner demonstrate professionalism (e.g., punctuality, attire, preparedness, accountability)?
• Does the learner take responsibility for their actions, including acknowledging and learning from errors?
• How effectively does the learner communicate about schedule changes, absences, or other responsibilities?
• In what ways does the learner show honesty, integrity, and reliability in clinical practice?
• Does the learner seek guidance appropriately when needed to ensure safe, competent care?
• How receptive is the learner to feedback, and do they act on it?
• Has the learner reflected on or revised their professional goals during the placement?

Please share your observations about the learner's performance, and I'll help you structure constructive feedback based on BCCNM standards.`,

  2: `Let's work on feedback for Standard 2: Knowledge-Based Practice

Please provide feedback on the following areas:

• What strengths has the learner demonstrated in their clinical skills and knowledge?
• Which clinical skills or knowledge areas should the learner continue to develop?
• Were there situations where they needed additional guidance or struggled with decision-making?
• Is the learner's assessment systematic, complete, and inclusive of safety checks?
• Do they identify clinical problems effectively, or do you need to cue them often?
• Does the learner prepare for patients (diagnoses, labs, history) and rationalize interventions appropriately?
• How effectively does the learner organize tasks and manage time?
• Do they prioritize care appropriately as their assignment grows?
• Do they use strategies (e.g., clustering care, cheat sheets) to stay organized and provide effective handover?
• Does the learner seek out learning opportunities and show initiative?
• How could the learner further enhance their learning experience?

Please share your observations about the learner's performance, and I'll help you structure constructive feedback based on BCCNM standards.`,

  3: `Let's work on feedback for Standard 3: Client-Focused Provision of Service

Please provide feedback on the following areas:

• How effective is the learner's communication with patients, families, and the healthcare team?
• Does the learner demonstrate respect for client diversity, preferences, and autonomy in care?
• Can you suggest ways the learner might improve their communication or interpersonal interactions?
• Does the learner develop and contribute to patient care plans, or do they require significant guidance?
• Does the learner participate in patient education (e.g., teaching, discharge instructions)?
• When concerns arise, does the learner advocate for the patient independently or rely on you?

Please share your observations about the learner's performance, and I'll help you structure constructive feedback based on BCCNM standards.`,

  4: `Let's work on feedback for Standard 4: Ethical Practice

Please provide feedback on the following areas:

• Does the learner demonstrate respect, empathy, and compassion in patient interactions?
• How well does the learner uphold confidentiality and patient privacy?
• Has the learner shown awareness of ethical issues in care delivery (e.g., consent, advocacy, boundaries)?
• Does the learner take responsibility for errors or near misses and respond appropriately?
• How receptive is the learner to constructive feedback, and do they act on it?
• Has the learner reflected on their practice and revised professional goals in light of feedback or experience?

Please share your observations about the learner's performance, and I'll help you structure constructive feedback based on BCCNM standards.`
};

// Generate transition feedback after user responds to a standard
export const generateTransitionFeedback = (standard: number): string => {
  const feedbackMessages = [
    // Standard 1 feedback
    `Excellent! Thank you for sharing those observations about the learner's professionalism and responsibility. 

Based on what you've shared, here are some key points for your feedback:

✓ Highlight specific examples of professional behavior you've observed
✓ Connect their actions to patient safety and quality of care
✓ Acknowledge their accountability and willingness to learn
✓ Provide clear guidance on areas for continued growth

Great work on Standard 1! 🎉`,

    // Standard 2 feedback
    `Wonderful! Your observations about the learner's clinical knowledge and skills are very thorough.

Based on what you've shared, here are some key points for your feedback:

✓ Emphasize the clinical strengths and competencies you've witnessed
✓ Provide specific examples of effective assessment and intervention
✓ Identify areas where additional practice or learning would benefit the learner
✓ Recognize their critical thinking and evidence-based practice

Excellent progress on Standard 2! 🎉`,

    // Standard 3 feedback
    `Perfect! Your insights on the learner's client-focused care are really valuable.

Based on what you've shared, here are some key points for your feedback:

✓ Highlight effective communication and interpersonal skills
✓ Recognize patient advocacy and therapeutic relationship building
✓ Note contributions to care planning and patient education
✓ Identify opportunities to enhance patient-centered care

Great job completing Standard 3! 🎉`,

    // Standard 4 feedback (not used since Standard 4 is last)
    ``
  ];

  return feedbackMessages[standard - 1] || '';
};

// Final feedback for after all standards are complete
export const generateFinalFeedback = (): string => {
  return `Excellent work! Your observations about the learner's ethical practice are comprehensive and thoughtful.

Based on what you've shared, here are some key points for your feedback:

✓ Acknowledge demonstrations of respect, empathy, and compassion
✓ Recognize ethical awareness and professional boundaries
✓ Note their responsiveness to feedback and commitment to growth
✓ Highlight their reflection on practice and professional development

---

🎉 Congratulations! You've completed feedback for all 4 BCCNM Standards of Practice!

You now have a comprehensive, structured feedback framework for your nursing learner. Your thorough observations across all standards will help provide meaningful guidance for their professional development.

Remember to:
✓ Be specific with your examples
✓ Connect feedback to BCCNM standards
✓ Balance constructive criticism with recognition of strengths
✓ Provide actionable steps for improvement

Feel free to ask me any follow-up questions about the feedback or start a new feedback session!`;
};

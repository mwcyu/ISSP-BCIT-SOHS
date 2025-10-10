"""
LangChain chains for the RAG-based Clinical Feedback Helper
Uses modern LangChain patterns with LCEL (LangChain Expression Language)
"""
from typing import Dict, Any, List
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.output_parsers import StrOutputParser, PydanticOutputParser
from langchain_core.runnables import RunnablePassthrough, RunnableParallel
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from .config import Config, SYSTEM_PROMPT_TEMPLATE, PRIVACY_CHECK_PROMPT
from .models import FeedbackEvaluation, PrivacyCheckResult, FeedbackQuality
from .vectorstore import KnowledgeBase, format_docs


class FeedbackChains:
    """Collection of LangChain chains for feedback processing"""
    
    def __init__(self, knowledge_base: KnowledgeBase):
        self.kb = knowledge_base
        self.llm = ChatOpenAI(
            model=Config.MODEL_NAME,
            temperature=Config.TEMPERATURE,
            openai_api_key=Config.OPENAI_API_KEY
        )
        
        # Structured output LLM for evaluations
        self.structured_llm = ChatOpenAI(
            model=Config.MODEL_NAME,
            temperature=0.3,  # Lower temperature for more consistent structured outputs
            openai_api_key=Config.OPENAI_API_KEY
        )
    
    def create_conversation_chain(self):
        """Create the main conversation chain with RAG"""
        
        # Create retriever
        retriever = self.kb.get_retriever(k=3)
        
        # Prompt template
        prompt = ChatPromptTemplate.from_messages([
            ("system", SYSTEM_PROMPT_TEMPLATE),
            MessagesPlaceholder(variable_name="chat_history"),
            ("human", "{input}")
        ])
        
        # Build the chain with LCEL
        chain = (
            RunnableParallel(
                context=lambda x: format_docs(retriever.invoke(x["input"])),
                input=lambda x: x["input"],
                state=lambda x: x["state"],
                chat_history=lambda x: x["chat_history"]
            )
            | prompt
            | self.llm
            | StrOutputParser()
        )
        
        return chain
    
    def create_evaluation_chain(self):
        """Create chain for evaluating feedback quality"""
        
        parser = PydanticOutputParser(pydantic_object=FeedbackEvaluation)
        
        prompt = ChatPromptTemplate.from_messages([
            ("system", """You are an expert evaluator of clinical feedback quality.
            
Your task is to analyze preceptor feedback and determine:
1. Is it SPECIFIC (detailed, not vague like "good" or "needs work")?
2. Does it include a CONCRETE EXAMPLE or clinical situation?

Extract key points and classify the overall quality as:
- VAGUE: General statements without detail
- SPECIFIC_NO_EXAMPLE: Detailed but missing concrete example
- SPECIFIC_WITH_EXAMPLE: Detailed with concrete clinical example

{format_instructions}"""),
            ("human", """Evaluate this feedback from a nursing preceptor:

Feedback: {feedback}

Standard being evaluated: {standard_name}""")
        ])
        
        chain = (
            {
                "feedback": lambda x: x["feedback"],
                "standard_name": lambda x: x["standard_name"],
                "format_instructions": lambda _: parser.get_format_instructions()
            }
            | prompt
            | self.structured_llm
            | parser
        )
        
        return chain
    
    def create_privacy_check_chain(self):
        """Create chain for checking PII in feedback"""
        
        parser = PydanticOutputParser(pydantic_object=PrivacyCheckResult)
        
        prompt = ChatPromptTemplate.from_messages([
            ("system", """You are a privacy compliance checker for healthcare feedback.

Identify any personally identifiable information (PII) including:
- Patient names, initials, or descriptions that could identify them
- Student names or initials
- Facility names or specific locations
- Specific dates (beyond "this week" or "recently")
- Medical record numbers
- Room numbers or specific unit identifiers

Return SAFE if no PII is detected.

{format_instructions}"""),
            ("human", "Check this text for PII:\n\n{text}")
        ])
        
        chain = (
            {
                "text": lambda x: x["text"],
                "format_instructions": lambda _: parser.get_format_instructions()
            }
            | prompt
            | self.structured_llm
            | parser
        )
        
        return chain
    
    def create_synthesis_chain(self):
        """Create chain for synthesizing feedback into summary and suggestion"""
        
        prompt = ChatPromptTemplate.from_messages([
            ("system", """You are a clinical education expert creating structured feedback summaries.

Based on the preceptor's feedback, generate:
1. A SUMMARY: Concise, professional summary (2-3 sentences) of the feedback
2. A SUGGESTION: One specific, actionable recommendation for the student's development

Guidelines:
- Use professional nursing language
- Be constructive and specific
- If feedback is entirely positive, frame suggestion as "continue" or "expand"
- Focus on behaviors and skills, not personal attributes

Return your response in this format:
SUMMARY: [your summary here]
SUGGESTION: [your suggestion here]"""),
            ("human", """Standard: {standard_name}

Preceptor's Feedback:
{feedback}

Generate the summary and suggestion.""")
        ])
        
        chain = (
            {
                "standard_name": lambda x: x["standard_name"],
                "feedback": lambda x: x["feedback"]
            }
            | prompt
            | self.llm
            | StrOutputParser()
        )
        
        return chain
    
    def create_probe_question_chain(self):
        """Create chain for generating clarifying questions"""
        
        prompt = ChatPromptTemplate.from_messages([
            ("system", """You are helping a nursing preceptor provide better feedback.

Based on the evaluation, generate ONE clarifying question to help the preceptor:
- If VAGUE: Ask for more specific details
- If SPECIFIC_NO_EXAMPLE: Ask for a concrete clinical situation/example

Be professional, encouraging, and concise. Ask questions that help elicit actionable feedback.

Context about this standard:
{context}"""),
            ("human", """Standard: {standard_name}

Preceptor's feedback: {feedback}

Evaluation: {evaluation_reason}

Quality: {quality}

Generate an appropriate follow-up question.""")
        ])
        
        # Get retriever for context
        retriever = self.kb.get_retriever(k=2)
        
        chain = (
            {
                "standard_name": lambda x: x["standard_name"],
                "feedback": lambda x: x["feedback"],
                "evaluation_reason": lambda x: x["evaluation_reason"],
                "quality": lambda x: x["quality"],
                "context": lambda x: format_docs(retriever.invoke(x["standard_name"]))
            }
            | prompt
            | self.llm
            | StrOutputParser()
        )
        
        return chain
    
    def create_introduction_chain(self):
        """Create chain for generating the session introduction"""
        
        prompt = ChatPromptTemplate.from_messages([
            ("system", """You are the Clinical Feedback Helper starting a new feedback session.

Provide a brief, professional welcome that:
1. Introduces yourself and your purpose
2. Explains you'll collect feedback on the four BCCNM standards
3. Mentions you'll ask for specific examples
4. Reassures about privacy (no names needed)
5. Is warm but concise (3-4 sentences max)

Context about BCCNM standards:
{context}"""),
            ("human", "Generate the welcome message to start the feedback session.")
        ])
        
        retriever = self.kb.get_retriever(k=2)
        
        chain = (
            {
                "context": lambda x: format_docs(retriever.invoke("BCCNM standards overview"))
            }
            | prompt
            | self.llm
            | StrOutputParser()
        )
        
        return chain
    
    def create_standard_introduction_chain(self):
        """Create chain for introducing each standard"""
        
        prompt = ChatPromptTemplate.from_messages([
            ("system", """You are introducing a BCCNM standard to the preceptor.

Generate a question that:
1. Names the standard
2. Briefly explains what it covers (1-2 sentences)
3. Asks an open-ended question about the student's performance

Be professional, clear, and encouraging.

Relevant context:
{context}"""),
            ("human", "Introduce {standard_name} and ask for feedback.")
        ])
        
        retriever = self.kb.get_retriever(k=3)
        
        chain = (
            {
                "standard_name": lambda x: x["standard_name"],
                "context": lambda x: format_docs(retriever.invoke(x["standard_name"]))
            }
            | prompt
            | self.llm
            | StrOutputParser()
        )
        
        return chain
    
    def create_final_report_chain(self):
        """Create chain for generating the final report message"""
        
        prompt = ChatPromptTemplate.from_messages([
            ("system", """You are completing a feedback session.

Create a brief message that:
1. Thanks the preceptor for their time and detailed feedback
2. Explains the feedback will be compiled into a report
3. Asks for their health authority email address to send the report
4. Is warm and professional (2-3 sentences)"""),
            ("human", "Generate the completion message asking for email.")
        ])
        
        chain = prompt | self.llm | StrOutputParser()
        
        return chain


def parse_synthesis_output(output: str) -> Dict[str, str]:
    """Parse the synthesis chain output into summary and suggestion"""
    lines = output.strip().split('\n')
    result = {"summary": "", "suggestion": ""}
    
    for line in lines:
        if line.startswith("SUMMARY:"):
            result["summary"] = line.replace("SUMMARY:", "").strip()
        elif line.startswith("SUGGESTION:"):
            result["suggestion"] = line.replace("SUGGESTION:", "").strip()
    
    return result

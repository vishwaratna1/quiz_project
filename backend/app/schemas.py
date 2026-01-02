from pydantic import BaseModel, Field
from typing import List, Optional
from uuid import UUID
from datetime import datetime
from app.models import QuestionType


# Quiz Schemas
class QuizBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None


class QuizCreate(QuizBase):
    pass


class QuizUpdate(QuizBase):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None


class QuizResponse(QuizBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Question Option Schemas
class QuestionOptionBase(BaseModel):
    option_text: str = Field(..., min_length=1)
    is_correct: bool = False
    order: int


class QuestionOptionCreate(QuestionOptionBase):
    pass


class QuestionOptionResponse(QuestionOptionBase):
    id: UUID

    class Config:
        from_attributes = True


# Question Schemas
class QuestionBase(BaseModel):
    question_text: str = Field(..., min_length=1)
    question_type: QuestionType
    points: int = Field(default=1, ge=1)
    order: int


class QuestionCreate(QuestionBase):
    options: Optional[List[QuestionOptionCreate]] = None
    correct_answer_text: Optional[str] = None  # For TEXT type questions


class QuestionUpdate(BaseModel):
    question_text: Optional[str] = Field(None, min_length=1)
    question_type: Optional[QuestionType] = None
    points: Optional[int] = Field(None, ge=1)
    order: Optional[int] = None
    options: Optional[List[QuestionOptionCreate]] = None
    correct_answer_text: Optional[str] = None


class QuestionResponse(QuestionBase):
    id: UUID
    quiz_id: UUID
    options: List[QuestionOptionResponse] = []
    correct_answer_text: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Quiz with Questions
class QuizWithQuestions(QuizResponse):
    questions: List[QuestionResponse] = []


# Public Quiz Schemas (without correct answers)
class PublicQuestionOptionResponse(BaseModel):
    id: UUID
    option_text: str
    order: int

    class Config:
        from_attributes = True


class PublicQuestionResponse(BaseModel):
    id: UUID
    question_text: str
    question_type: QuestionType
    points: int
    order: int
    options: List[PublicQuestionOptionResponse] = []

    class Config:
        from_attributes = True


class PublicQuizResponse(BaseModel):
    id: UUID
    title: str
    description: Optional[str]
    questions: List[PublicQuestionResponse] = []

    class Config:
        from_attributes = True


# Quiz Submission Schemas
class AnswerSubmission(BaseModel):
    question_id: UUID
    selected_option_id: Optional[UUID] = None
    text_response: Optional[str] = None


class QuizSubmission(BaseModel):
    user_name: Optional[str] = None
    answers: List[AnswerSubmission]


class QuizResultResponse(BaseModel):
    attempt_id: UUID
    quiz_id: UUID
    score: int
    total_points: int
    percentage: float
    submitted_at: datetime
    responses: List[dict]  # Detailed response info

    class Config:
        from_attributes = True


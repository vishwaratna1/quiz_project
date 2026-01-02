from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from uuid import UUID

from app.database import get_db
from app.models import Quiz, Question, QuestionOption, QuestionType
from app.schemas import (
    QuizCreate, QuizUpdate, QuizResponse, QuizWithQuestions,
    QuestionCreate, QuestionUpdate, QuestionResponse
)
from app.auth import get_current_user

router = APIRouter(prefix="/api/admin", tags=["admin"])


# Quiz CRUD
@router.post("/quizzes", response_model=QuizResponse, status_code=status.HTTP_201_CREATED)
def create_quiz(quiz: QuizCreate, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    db_quiz = Quiz(**quiz.dict())
    db.add(db_quiz)
    db.commit()
    db.refresh(db_quiz)
    return db_quiz


@router.get("/quizzes", response_model=List[QuizResponse])
def list_quizzes(db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    quizzes = db.query(Quiz).order_by(Quiz.created_at.desc()).all()
    return quizzes


@router.get("/quizzes/{quiz_id}", response_model=QuizWithQuestions)
def get_quiz(quiz_id: UUID, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    return quiz


@router.put("/quizzes/{quiz_id}", response_model=QuizResponse)
def update_quiz(quiz_id: UUID, quiz_update: QuizUpdate, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    db_quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not db_quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    
    update_data = quiz_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_quiz, field, value)
    
    db.commit()
    db.refresh(db_quiz)
    return db_quiz


@router.delete("/quizzes/{quiz_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_quiz(quiz_id: UUID, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    db_quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not db_quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    
    db.delete(db_quiz)
    db.commit()
    return None


# Question CRUD
@router.post("/quizzes/{quiz_id}/questions", response_model=QuestionResponse, status_code=status.HTTP_201_CREATED)
def create_question(quiz_id: UUID, question: QuestionCreate, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    # Verify quiz exists
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    
    # Validate question type and options
    if question.question_type in [QuestionType.MCQ, QuestionType.TRUE_FALSE]:
        if not question.options or len(question.options) < 2:
            raise HTTPException(
                status_code=400,
                detail=f"{question.question_type.value} questions must have at least 2 options"
            )
        correct_count = sum(1 for opt in question.options if opt.is_correct)
        if correct_count != 1:
            raise HTTPException(
                status_code=400,
                detail=f"{question.question_type.value} questions must have exactly one correct answer"
            )
    elif question.question_type == QuestionType.TEXT:
        if not question.correct_answer_text:
            raise HTTPException(
                status_code=400,
                detail="Text questions must have a correct_answer_text"
            )
    
    # Create question
    question_data = question.dict(exclude={"options", "correct_answer_text"})
    db_question = Question(quiz_id=quiz_id, **question_data)
    if question.correct_answer_text:
        db_question.correct_answer_text = question.correct_answer_text
    
    db.add(db_question)
    db.flush()
    
    # Create options if present
    if question.options:
        for opt_data in question.options:
            db_option = QuestionOption(question_id=db_question.id, **opt_data.dict())
            db.add(db_option)
    
    db.commit()
    db.refresh(db_question)
    return db_question


@router.put("/questions/{question_id}", response_model=QuestionResponse)
def update_question(question_id: UUID, question_update: QuestionUpdate, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    db_question = db.query(Question).filter(Question.id == question_id).first()
    if not db_question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    update_data = question_update.dict(exclude_unset=True, exclude={"options"})
    
    # Handle question type change validation
    new_type = update_data.get("question_type", db_question.question_type)
    if new_type in [QuestionType.MCQ, QuestionType.TRUE_FALSE]:
        if question_update.options:
            if len(question_update.options) < 2:
                raise HTTPException(
                    status_code=400,
                    detail=f"{new_type.value} questions must have at least 2 options"
                )
            correct_count = sum(1 for opt in question_update.options if opt.is_correct)
            if correct_count != 1:
                raise HTTPException(
                    status_code=400,
                    detail=f"{new_type.value} questions must have exactly one correct answer"
                )
    elif new_type == QuestionType.TEXT:
        if not question_update.correct_answer_text and not db_question.correct_answer_text:
            raise HTTPException(
                status_code=400,
                detail="Text questions must have a correct_answer_text"
            )
    
    # Update question fields
    for field, value in update_data.items():
        setattr(db_question, field, value)
    
    if question_update.correct_answer_text is not None:
        db_question.correct_answer_text = question_update.correct_answer_text
    
    # Update options if provided
    if question_update.options is not None:
        # Delete existing options
        db.query(QuestionOption).filter(QuestionOption.question_id == question_id).delete()
        # Create new options
        for opt_data in question_update.options:
            db_option = QuestionOption(question_id=question_id, **opt_data.dict())
            db.add(db_option)
    
    db.commit()
    db.refresh(db_question)
    return db_question


@router.delete("/questions/{question_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_question(question_id: UUID, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    db_question = db.query(Question).filter(Question.id == question_id).first()
    if not db_question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    db.delete(db_question)
    db.commit()
    return None


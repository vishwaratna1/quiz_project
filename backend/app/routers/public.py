from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List
from uuid import UUID
from decimal import Decimal

from app.database import get_db
from app.models import Quiz, Question, QuestionOption, QuizAttempt, QuizResponse as QuizResponseModel, QuestionType
from app.schemas import PublicQuizResponse, QuizSubmission, QuizResultResponse, AnswerSubmission

router = APIRouter(prefix="/api/public", tags=["public"])


@router.get("/quizzes/{quiz_id}", response_model=PublicQuizResponse)
def get_quiz_for_taking(quiz_id: UUID, db: Session = Depends(get_db)):
    quiz = db.query(Quiz).options(
        joinedload(Quiz.questions).joinedload(Question.options)
    ).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    
    # Return quiz without correct answers (schema will filter out is_correct)
    return quiz


@router.post("/quizzes/{quiz_id}/submit", response_model=QuizResultResponse, status_code=status.HTTP_201_CREATED)
def submit_quiz(quiz_id: UUID, submission: QuizSubmission, db: Session = Depends(get_db)):
    # Verify quiz exists
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    
    # Get all questions for this quiz
    questions = db.query(Question).filter(Question.quiz_id == quiz_id).order_by(Question.order).all()
    question_dict = {q.id: q for q in questions}
    
    # Validate submission
    if len(submission.answers) != len(questions):
        raise HTTPException(
            status_code=400,
            detail=f"Expected {len(questions)} answers, got {len(submission.answers)}"
        )
    
    submitted_question_ids = {ans.question_id for ans in submission.answers}
    if submitted_question_ids != set(question_dict.keys()):
        raise HTTPException(
            status_code=400,
            detail="Submitted answers do not match quiz questions"
        )
    
    # Calculate score
    total_points = sum(q.points for q in questions)
    score = 0
    responses_data = []
    
    for answer in submission.answers:
        question = question_dict[answer.question_id]
        is_correct = False
        points_earned = 0
        
        if question.question_type == QuestionType.MCQ or question.question_type == QuestionType.TRUE_FALSE:
            if answer.selected_option_id:
                selected_option = db.query(QuestionOption).filter(
                    QuestionOption.id == answer.selected_option_id,
                    QuestionOption.question_id == question.id
                ).first()
                
                if selected_option and selected_option.is_correct:
                    is_correct = True
                    points_earned = question.points
                    score += question.points
        elif question.question_type == QuestionType.TEXT:
            if answer.text_response and question.correct_answer_text:
                # Case-insensitive comparison
                if answer.text_response.strip().lower() == question.correct_answer_text.strip().lower():
                    is_correct = True
                    points_earned = question.points
                    score += question.points
        
        responses_data.append({
            "question_id": str(question.id),
            "question_text": question.question_text,
            "is_correct": is_correct,
            "points_earned": points_earned,
            "question_points": question.points
        })
    
    # Calculate percentage
    percentage = (Decimal(score) / Decimal(total_points) * 100) if total_points > 0 else Decimal(0)
    
    # Create quiz attempt
    attempt = QuizAttempt(
        quiz_id=quiz_id,
        user_name=submission.user_name,
        score=score,
        total_points=total_points,
        percentage=percentage
    )
    db.add(attempt)
    db.flush()
    
    # Create responses
    for answer in submission.answers:
        question = question_dict[answer.question_id]
        response = QuizResponseModel(
            attempt_id=attempt.id,
            question_id=question.id,
            selected_option_id=answer.selected_option_id,
            text_response=answer.text_response,
            is_correct=responses_data[submission.answers.index(answer)]["is_correct"],
            points_earned=responses_data[submission.answers.index(answer)]["points_earned"]
        )
        db.add(response)
    
    db.commit()
    db.refresh(attempt)
    
    return QuizResultResponse(
        attempt_id=attempt.id,
        quiz_id=quiz_id,
        score=score,
        total_points=total_points,
        percentage=float(percentage),
        submitted_at=attempt.submitted_at,
        responses=responses_data
    )


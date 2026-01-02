from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
import bcrypt

# Configuration
SECRET_KEY = "your-secret-key-change-in-production"  # In production, use environment variable
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


# Default admin credentials (in production, store in database)
ADMIN_USERNAME = "admin"
_ADMIN_PASSWORD_HASH = None


def _truncate_password_to_bytes(password: str) -> bytes:
    """Truncate password to 72 bytes (bcrypt limit) and return as bytes."""
    if isinstance(password, bytes):
        password_bytes = password
    else:
        password_bytes = password.encode('utf-8')
    
    # Bcrypt has a 72-byte limit
    if len(password_bytes) > 72:
        password_bytes = password_bytes[:72]
    
    return password_bytes


def get_admin_password_hash() -> str:
    """Get or compute the admin password hash (lazy initialization)."""
    global _ADMIN_PASSWORD_HASH
    if _ADMIN_PASSWORD_HASH is None:
        # Use bcrypt directly to avoid passlib issues
        password_bytes = _truncate_password_to_bytes("admin")
        hashed = bcrypt.hashpw(password_bytes, bcrypt.gensalt())
        _ADMIN_PASSWORD_HASH = hashed.decode('utf-8')
    return _ADMIN_PASSWORD_HASH


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None


class LoginRequest(BaseModel):
    username: str
    password: str


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a hash. Bcrypt has a 72-byte limit."""
    try:
        # Truncate password to 72 bytes
        password_bytes = _truncate_password_to_bytes(plain_password)
        hashed_bytes = hashed_password.encode('utf-8') if isinstance(hashed_password, str) else hashed_password
        return bcrypt.checkpw(password_bytes, hashed_bytes)
    except Exception:
        # Fallback to passlib if bcrypt direct fails
        password_bytes = _truncate_password_to_bytes(plain_password)
        plain_password = password_bytes.decode('utf-8', errors='replace')
        return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hash a password. Bcrypt has a 72-byte limit, so we truncate if necessary."""
    password_bytes = _truncate_password_to_bytes(password)
    hashed = bcrypt.hashpw(password_bytes, bcrypt.gensalt())
    return hashed.decode('utf-8')


def authenticate_user(username: str, password: str) -> bool:
    """Authenticate user credentials."""
    if username != ADMIN_USERNAME:
        return False
    
    # Verify password against hashed password (verify_password handles 72-byte limit)
    admin_hash = get_admin_password_hash()
    return verify_password(password, admin_hash)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create a JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


async def get_current_user(token: str = Depends(oauth2_scheme)):
    """Get current authenticated user from JWT token."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception
    
    # Verify user is admin
    if token_data.username != ADMIN_USERNAME:
        raise credentials_exception
    
    return token_data.username


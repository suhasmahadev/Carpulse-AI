from datetime import datetime, timedelta
from typing import Optional

from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from db import get_db
from models import User

# TODO: move to env in real deployment
SECRET_KEY = "change_this_to_a_long_random_secret_string"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

# bcrypt hard limit
MAX_PASSWORD_BYTES = 72


def _normalize_password(password: str) -> str:
    """
    Bcrypt only uses the first 72 bytes of the password.
    We normalize by truncating to 72 bytes in UTF-8 and decoding back.
    This MUST be applied both on hash and verify so they match.
    """
    if password is None:
        return ""
    pwd_bytes = password.encode("utf-8")
    if len(pwd_bytes) > MAX_PASSWORD_BYTES:
        pwd_bytes = pwd_bytes[:MAX_PASSWORD_BYTES]
        # ignore incomplete multibyte at end
        password = pwd_bytes.decode("utf-8", errors="ignore")
    return password


def hash_password(password: str) -> str:
    password = _normalize_password(password)
    return pwd_context.hash(password)

def get_password_hash(password: str) -> str:
    return hash_password(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    plain_password = _normalize_password(plain_password)
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(
    data: dict,
    expires_minutes: int = ACCESS_TOKEN_EXPIRE_MINUTES,
) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=expires_minutes)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None

def authenticate_user(db: Session, email: str, password: str):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception
    email: str = payload.get("sub")
    if email is None:
        raise credentials_exception
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception
    return user

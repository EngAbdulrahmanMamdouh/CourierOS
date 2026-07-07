from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import HTTPException, status

from app.config import settings

SECRET_KEY = settings.secret_key
ALGORITHM = settings.algorithm
ACCESS_TOKEN_EXPIRE_MINUTES = settings.access_token_expire_minutes

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)


def hash_password(password: str):
    return pwd_context.hash(password)


def verify_password(
    plain_password: str,
    hashed_password: str
):
    try:
        return pwd_context.verify(
            plain_password,
            hashed_password
        )
    except Exception:
        # Do not expose internal hashing errors (e.g., bcrypt length errors) to callers.
        # Treat any verification error as authentication failure.
        return False


def create_access_token(data: dict):

    to_encode = data.copy()

    expire = datetime.now(
        timezone.utc
    ) + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    to_encode.update(
        {"exp": expire}
    )

    token = jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    print('create_access_token: SECRET_KEY=', SECRET_KEY)
    print('create_access_token: ALGORITHM=', ALGORITHM)
    print('create_access_token: generated_token=', token)

    return token

def decode_access_token(token: str):
    try:
        print('decode_access_token: received_token=', token)
        print('decode_access_token: SECRET_KEY=', SECRET_KEY)
        print('decode_access_token: ALGORITHM=', ALGORITHM)
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )
        return payload

    except JWTError as exc:
        print('JWT decode exception:', type(exc).__name__)
        print('JWT decode message:', str(exc))
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
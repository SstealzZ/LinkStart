from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timedelta
from passlib.context import CryptContext
from bson import ObjectId
import jwt
import logging
from fastapi.responses import JSONResponse
from ping3 import ping
import ipaddress
import socket
from dotenv import load_dotenv
import os

# Charger les variables d'environnement
load_dotenv()

# Configurer le niveau de journalisation
logging.basicConfig(level=logging.INFO)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://ls.stealz.moe",
        "http://localhost",
        "http://127.0.0.1:3000",
        "http://127.0.0.1"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Configuration MongoDB
MONGO_URI = os.getenv("MONGO_URI")
client = AsyncIOMotorClient(MONGO_URI)
db = client[os.getenv("DB_NAME")]
user_collection = db["users"]  # Collection pour les utilisateurs
service_collection = db["services"]  # Collection pour les services

# Configuration JWT
SECRET_KEY = os.getenv("JWT_SECRET_KEY")
ALGORITHM = os.getenv("JWT_ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES"))

# Context pour hasher les mots de passe
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Modèles
class Token(BaseModel):
    access_token: str
    token_type: str

class User(BaseModel):
    username: str
    email: EmailStr

class UserInDB(User):
    hashed_password: str

class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=30)
    email: EmailStr
    password: str = Field(..., min_length=8)

class Service(BaseModel):
    id: Optional[str] = None
    service_owner: str
    name: str
    public_ip: str
    private_ip: str

    class Config:
        json_encoders = {
            ObjectId: str
        }

# Utils
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)

def hash_password(password: str):
    return pwd_context.hash(password)

# Fonctions avec MongoDB
async def get_user_by_username(username: str):
    user = await user_collection.find_one({"username": username})
    return user

async def get_user_by_email(email: str):
    user = await user_collection.find_one({"email": email})
    return user

async def create_user(user_data: dict):
    await user_collection.insert_one(user_data)

# Endpoints
@app.post("/auth/register", response_model=Token)
async def register(user: UserCreate):
    # Vérifier si l'utilisateur ou l'email existe déjà
    if await get_user_by_username(user.username):
        raise HTTPException(status_code=400, detail="Username already registered")
    if await get_user_by_email(user.email):
        raise HTTPException(status_code=400, detail="Email already registered")

    # Hacher le mot de passe
    hashed_password = hash_password(user.password)

    # Ajouter l'utilisateur à la collection MongoDB
    user_data = {
        "username": user.username,
        "email": user.email,
        "hashed_password": hashed_password,
    }
    await create_user(user_data)

    # Créer un token JWT
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/auth/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await get_user_by_username(form_data.username)
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token = create_access_token(data={"sub": user["username"]})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/auth/me", response_model=User)
async def read_current_user(token: str = Depends(OAuth2PasswordBearer(tokenUrl="/auth/login"))):
    try:
        # Decode the JWT token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

    # Fetch the user from the database
    user = await get_user_by_username(username)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Return the user details without the hashed password
    return User(username=user["username"], email=user["email"])

@app.post("/services", response_model=Service)
async def add_service(
    service: Service, 
    token: str = Depends(OAuth2PasswordBearer(tokenUrl="/auth/login"))
):
    try:
        # Décoder le token pour obtenir le propriétaire
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        service_owner = payload.get("sub")
        
        # Préparer les données du service
        service_data = {
            "service_owner": service_owner,
            "name": service.name,
            "public_ip": service.public_ip,
            "private_ip": service.private_ip
        }
        
        # Insérer dans MongoDB
        result = await service_collection.insert_one(service_data)
        
        # Créer l'objet de retour avec l'ID
        created_service = {
            "id": str(result.inserted_id),
            **service_data
        }
        
        return created_service

    except Exception as e:
        raise HTTPException(status_code=422, detail=str(e))

@app.get("/services", response_model=list[Service])
async def get_services(token: str = Depends(OAuth2PasswordBearer(tokenUrl="/auth/login"))):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        service_owner = payload.get("sub")
        if not service_owner:
            raise HTTPException(status_code=401, detail="Invalid token")

        cursor = service_collection.find({"service_owner": service_owner})
        services = []
        async for service in cursor:
            service["id"] = str(service["_id"])
            del service["_id"]
            services.append(service)
        return services

    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


# Supprimer un service par ID
@app.delete("/services/{service_id}")
async def delete_service(
    service_id: str, 
    token: str = Depends(OAuth2PasswordBearer(tokenUrl="/auth/login"))
):
    try:
        # Décoder le token pour obtenir le propriétaire
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        service_owner = payload.get("sub")

        # Vérifier que le service existe et appartient à l'utilisateur
        try:
            object_id = ObjectId(service_id)
        except:
            raise HTTPException(status_code=400, detail="Invalid service ID format")

        service = await service_collection.find_one({
            "_id": object_id,
            "service_owner": service_owner
        })

        if not service:
            raise HTTPException(status_code=404, detail="Service not found")

        # Supprimer le service
        result = await service_collection.delete_one({
            "_id": object_id,
            "service_owner": service_owner
        })

        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Service not found")

        return {"message": "Service successfully deleted"}

    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


# Compter le nombre de services d'un utilisateur
@app.get("/services/count")
async def count_services(token: str = Depends(OAuth2PasswordBearer(tokenUrl="/auth/login"))):
    try:
        # Décoder le token pour obtenir le propriétaire
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        service_owner = payload.get("sub")
        if not service_owner:
            raise HTTPException(status_code=401, detail="Invalid token")

        # Compter les services
        count = await service_collection.count_documents({"service_owner": service_owner})
        return {"count": count}

    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": "Une erreur interne est survenue."},
    )

# Ajouter cette nouvelle route pour rafraîchir les tokens
@app.post("/auth/refresh", response_model=Token)
async def refresh_token(request: Request):
    try:
        # Obtenir le refresh token du corps de la requête
        body = await request.json()
        refresh_token = body.get("refresh_token")
        if not refresh_token:
            raise HTTPException(status_code=400, detail="Refresh token missing")

        # Décoder le refresh token
        try:
            payload = jwt.decode(refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
            username: str = payload.get("sub")
            if not username:
                raise HTTPException(status_code=401, detail="Invalid refresh token")
        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=401, detail="Refresh token expired")
        except jwt.InvalidTokenError:
            raise HTTPException(status_code=401, detail="Invalid refresh token")

        # Vérifier que l'utilisateur existe dans la base de données
        user = await get_user_by_username(username)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Créer un nouveau token d'accès
        new_access_token = create_access_token(data={"sub": username}, expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))

        # Optionnel : créer un nouveau refresh token (optionnel : pour la rotation des tokens)
        new_refresh_token = create_access_token(data={"sub": username}, expires_delta=timedelta(days=7))

        # Retourner les nouveaux tokens
        return {"access_token": new_access_token, "refresh_token": new_refresh_token, "token_type": "bearer"}

    except Exception as e:
        logging.error(f"Error refreshing token: {str(e)}")
        raise HTTPException(status_code=500, detail="Unable to refresh token")


@app.get("/ping/{address}")
async def ping_ip(address: str):
    try:
        # Resolve domain name to IP if necessary
        try:
            ip = ipaddress.ip_address(address)  # Check if it's already an IP
        except ValueError:
            ip = socket.gethostbyname(address)  # Resolve domain name to IP
        
        # Perform the ping
        response_time = ping(str(ip), timeout=2)
        if response_time is not None:
            return {"reachable": True, "response_time": response_time, "resolved_ip": str(ip)}
        else:
            return {"reachable": False, "error": "No response", "resolved_ip": str(ip)}
    except socket.gaierror:
        return {"reachable": False, "error": "Invalid domain name or unable to resolve"}
    except Exception as e:
        return {"reachable": False, "error": str(e)}